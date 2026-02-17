'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface NoticeDetail {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    writerNickname: string;
    writerProfileImage?: string;
    images?: string[];
}

const backIcon = '/icons/back.svg';

export default function NoticeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const noticeId = params.id;

    const [notice, setNotice] = useState<NoticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!noticeId) return;

        const fetchNoticeDetail = async () => {
            try {
                setIsLoading(true);
                console.log('공지사항 조회 시작 - noticeId:', noticeId);
                // GET /notice/{noticeId}
                const response = await apiClient.get(`/notice/${noticeId}`);
                console.log('공지사항 조회 성공:', response);
                console.log('응답 데이터:', response.data);
                setNotice(response.data);
            } catch (err: unknown) {
                const axiosError = err as AxiosError;
                console.error('공지사항 상세 조회 실패:');
                console.error('에러 객체:', axiosError);
                console.error('상태 코드:', axiosError.response?.status);
                console.error('에러 메시지:', axiosError.response?.data);
                console.error('전체 에러:', err);
                setError('공지사항을 불러올 수 없습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNoticeDetail();
    }, [noticeId]);

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const year = String(date.getFullYear());
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}.${month}.${day} ${hours}:${minutes}`;
        } catch {
            return '';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-white flex items-center justify-center">
                <p className="text-zinc-400 text-sm">로딩 중...</p>
            </div>
        );
    }

    if (error || !notice) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-zinc-500 text-sm">{error || '공지사항을 찾을 수 없습니다.'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-zinc-100 rounded-lg text-sm text-zinc-700 font-medium"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[375px] mx-auto min-h-screen bg-white flex flex-col font-['Pretendard']">
            {/* Header */}
            <header className="fixed top-0 w-full max-w-[375px] bg-white z-10 border-b border-zinc-100">
                <div className="h-[54px] flex items-center px-5">
                    <button
                        onClick={() => router.back()}
                        className="w-6 h-6 flex items-center justify-center -ml-1"
                    >
                        <Image src={backIcon} alt="뒤로가기" width={20} height={20} />
                    </button>
                    <h1 className="flex-1 text-center text-zinc-900 text-base font-semibold pr-5">
                        공지사항
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-[54px] px-5 pb-10">
                <div className="py-5 border-b border-zinc-100">
                    <h2 className="text-zinc-900 text-lg font-bold leading-snug mb-2">
                        {notice.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <span>{notice.writerNickname}</span>
                        <div className="w-px h-2.5 bg-zinc-200" />
                        <span>{formatDate(notice.createdAt)}</span>
                    </div>
                </div>

                <div className="py-6 flex flex-col gap-6">
                    {/* Notice Images */}
                    {notice.images && notice.images.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {notice.images.map((imgUrl, idx) => (
                                <div key={idx} className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100">
                                    <Image
                                        src={imgUrl}
                                        alt={`공지 이미지 ${idx + 1}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Text Content */}
                    <div className="whitespace-pre-wrap text-zinc-800 text-[15px] leading-relaxed break-words font-medium">
                        {notice.content}
                    </div>
                </div>
            </main>
        </div>
    );
}
