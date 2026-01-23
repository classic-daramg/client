import Image from 'next/image';

export default function InfoBanner() {
    return (
        <div className="w-full px-5 py-7 bg-white flex flex-col items-start gap-3.5 mb-2.5">
            <div className="flex flex-col items-start justify-center gap-4 text-left">
                <Image 
                    src="/icons/curation-logo.svg" 
                    alt="큐레이션 로고" 
                    width={222} 
                    height={68} 
                    priority // LCP 개선을 위해 priority 추가
                />
                <div className="text-neutral-600 text-sm font-semibold font-['Pretendard'] leading-tight">
                    나만의 이야기와 취향을 담아 클래식을 추천하는 공간
                </div>
                <div className="text-zinc-400 text-xs font-medium font-['Pretendard'] leading-tight whitespace-pre-line text-left">
                    다람쥐 여러분, 누구나 이곳에서 큐레이터가 될 수 있습니다.
                    자신의 이야기를 담아 곡과 음반, 영상을 추천해보세요.
                </div>
            </div>
        </div>
    );
}
