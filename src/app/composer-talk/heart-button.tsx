'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function HeartButton() {
  const [isHeartSelected, setIsHeartSelected] = useState(false);

  const toggleHeart = () => {
    setIsHeartSelected(!isHeartSelected);
  };

  return (
    <button onClick={toggleHeart} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
      <Image
        src={isHeartSelected ? '/icons/heart_selected.svg' : '/icons/heart.svg'}
        alt="Heart Icon"
        width={40}
        height={40}
        className="w-10 h-10"
      />
    </button>
  );
}