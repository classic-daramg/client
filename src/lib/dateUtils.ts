/**
 * Safely parses an ISO date string.
 * If the string does not end with 'Z' and doesn't have a timezone offset, 
 * it appends 'Z' to ensure it's treated as UTC (as per backend requirement).
 */
export const parseISO = (dateString: string | null | undefined): Date => {
    if (!dateString) return new Date();

    // If it doesn't have 'Z' and doesn't have +/- offset (e.g. +09:00)
    if (!dateString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateString)) {
        return new Date(`${dateString}Z`);
    }

    return new Date(dateString);
};

/**
 * Formats a date string to YY/MM/DD HH:mm in local time.
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = parseISO(dateString);
    return date
        .toLocaleString('ko-KR', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        .replace(/\. /g, '/')
        .replace('.', '');
};

/**
 * Formats a date string to a relative time (e.g., "5분 전") or YYYY. MM. DD.
 */
export const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = parseISO(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${Math.max(0, seconds)}초전`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간전`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일전`;

    return date.toLocaleDateString('ko-KR');
};
