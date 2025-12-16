import { useState } from 'react';
import Image from 'next/image';

export interface LikeButtonProps {
  defaultSelected: boolean; // API에서 받아온 디폴트 값
  onToggle?: (selected: boolean) => void;
  className?: string;
  size?: number; // 아이콘 크기 (px)
}

const LikeButton = ({ defaultSelected, onToggle, className = '', size = 26 }: LikeButtonProps) => {
  const [selected, setSelected] = useState(defaultSelected);
  const handleClick = () => {
    setSelected((prev) => {
      const next = !prev;
      if (onToggle) onToggle(next);
      return next;
    });
    // TODO: 백엔드 API 호출로 하트 상태 업데이트
  };
  return (
    <button
      onClick={handleClick}
      className={`overflow-clip relative shrink-0 rounded-full transition-colors hover:bg-gray-100 ${className}`}
      aria-label="좋아요"
      style={{ width: size, height: size }}
    >
      <Image
        src={selected ? "/icons/heart_selected.svg" : "/icons/heart.svg"}
        alt="heart"
        width={size - 8}
        height={size - 8}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </button>
  );
};

export default LikeButton;
