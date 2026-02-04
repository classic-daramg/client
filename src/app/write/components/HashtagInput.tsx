'use client'

import React, { useMemo, useState } from 'react';
import Image from 'next/image';

interface HashtagInputProps {
    value: string[];
    onChange: (nextTags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

const normalizeTag = (tag: string) => tag.replace(/^#+/, '').trim();

const HashtagInput: React.FC<HashtagInputProps> = ({
    value,
    onChange,
    placeholder = '해시태그 작성 최대 N개',
    maxTags,
}) => {
    const [inputValue, setInputValue] = useState('');

    const tags = useMemo(() => value ?? [], [value]);

    const addTag = (raw: string) => {
        const normalized = normalizeTag(raw);
        if (!normalized) return;
        if (tags.includes(normalized)) return;
        if (maxTags && tags.length >= maxTags) return;
        onChange([...tags, normalized]);
        setInputValue('');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            addTag(inputValue);
        } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    const handleRemove = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="w-full px-[20px] py-[10px] bg-white">
            <div className="flex flex-wrap items-center gap-x-[5px] gap-y-[6px] rounded-[10px] bg-[#f4f5f7] px-[14px] py-[6px]">
                {tags.map((tag) => (
                    <div
                        key={tag}
                        className="flex items-center gap-[2px] rounded-full border border-[#d9d9d9] bg-white px-3 py-1.5"
                    >
                        <span className="text-[12px] font-semibold text-[#4c4c4c]">#{tag}</span>
                        <button
                            type="button"
                            onClick={() => handleRemove(tag)}
                            className="flex h-3 w-3 items-center justify-center"
                            aria-label={`#${tag} 삭제`}
                        >
                            <Image src="/icons/close-white.svg" alt="삭제" width={12} height={12} className="invert" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="min-w-[80px] flex-1 bg-transparent text-[12px] font-semibold text-[#4c4c4c] focus:outline-none placeholder-[#4c4c4c]"
                />
            </div>
        </div>
    );
};

export default HashtagInput;
