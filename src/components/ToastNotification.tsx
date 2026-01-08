'use client';

import React, { useEffect } from 'react';

interface ToastNotificationProps {
  message?: string;
  isVisible?: boolean;
  onClose?: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message = "해당 게시물의 링크가 복사되었습니다",
  isVisible = true,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible && onClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-12 w-[295px] h-[33px] flex flex-row justify-center items-center px-[10px] py-2 gap-[10px] bg-[#4C4C4C] shadow-[0px_0px_6px_rgba(0,0,0,0.25)] rounded-full">
      <span className="w-48 h-[17px] font-pretendard font-medium text-sm leading-[17px] flex items-center text-center tracking-[-0.02em] text-white">
        {message}
      </span>
    </div>
  );
};

export default ToastNotification;