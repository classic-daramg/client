'use client';

import React from 'react';
import Image from 'next/image';

interface HeartButtonProps {
  isSelected?: boolean;
  onToggle?: () => void;
}

export default function HeartButton({ isSelected = false, onToggle }: HeartButtonProps) {
  const toggleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <button onClick={toggleHeart} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
      <Image
        src={isSelected ? '/icons/heart_selected.svg' : '/icons/heart.svg'}
        alt="Heart Icon"
        width={40}
        height={40}
        className="w-10 h-10"
      />
    </button>
  );
}