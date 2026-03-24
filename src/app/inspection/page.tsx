import React from 'react';
// lucide-react 대신 직접 SVG 컴포넌트 사용
const Mail = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const Wrench = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);
const RefreshCcw = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" />
    </svg>
);
const Database = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
);
const Settings = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const AcornIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M48 10 Q50 5 52 10 L52 20 L48 20 Z" fill="#8B5A2B" />
        <path d="M20 40 C20 15 80 15 80 40 Z" fill="#A0522D" />
        <rect x="15" y="40" width="70" height="10" rx="4" fill="#8B4513" />
        <path d="M25 50 C25 85 40 95 50 95 C60 95 75 85 75 50 Z" fill="#F4A460" />
        <path d="M35 60 Q40 70 45 75 Q40 65 35 60 Z" fill="#DEB887" opacity="0.6" />
    </svg>
);

export default function InspectionPage() {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#F9FAFB] flex items-center justify-center p-6 font-sans tracking-tight overflow-hidden">
            {/* 부드러운 배경 데코레이션 */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-14 p-8 border border-amber-50 flex flex-col items-center text-center relative z-10 transition-all duration-300 hover:shadow-2xl">

                {/* 일러스트레이션 섹션 */}
                <div className="relative mb-10 w-40 h-40 flex justify-center items-center">
                    {/* 메인 도토리 아이콘 애니메이션 */}
                    <div className="absolute animate-bounce" style={{ animationDuration: '3s' }}>
                        <AcornIcon className="w-24 h-24 drop-shadow-lg" />
                    </div>

                    {/* 창고 정리를 나타내는 부가 아이콘들 */}
                    <div className="absolute top-2 left-2 animate-[spin_8s_linear_infinite]">
                        <Settings className="w-6 h-6 text-amber-900/40" />
                    </div>
                    <div className="absolute bottom-4 right-1 text-orange-400/80">
                        <Database className="w-8 h-8 drop-shadow-sm" />
                    </div>
                    <div className="absolute top-6 right-6 text-amber-500/80 animate-pulse">
                        <Wrench className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <span className="inline-block py-1.5 px-3.5 rounded-full bg-amber-50 text-amber-700 text-xs font-black tracking-wider shadow-sm border border-amber-100/50">
                        SYSTEM MAINTENANCE
                    </span>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        창고 정리 중!
                    </h1>
                    <p className="text-gray-500 font-medium text-sm sm:text-base px-2 leading-relaxed">
                        다람쥐들이 커뮤니티의 겨울을 나기 위해 도토리(데이터)를<br className="hidden sm:block" />
                        더 넓고 안전한 창고에 정리하고 있어요.
                    </p>
                </div>

                <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100/80 text-left space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                            <RefreshCcw className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 tracking-tight">점검 목적</h3>
                            <p className="text-sm text-gray-600 mt-1 font-medium">더 쾌적한 커뮤니티 환경을 위한 DB 최적화 작업 중</p>
                        </div>
                    </div>
                    <div className="h-px w-full bg-gray-200/60" />
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 tracking-tight">점검 시간</h3>
                            <div className="mt-1.5 inline-block px-2.5 py-1 bg-amber-100/60 rounded text-amber-800 text-sm font-medium font-mono border border-amber-200/50">
                                미정
                            </div>
                        </div>
                    </div>
                </div>

                <a
                    href="mailto:support@classic-daramg.com"
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-semibold overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-xl hover:bg-gray-800 w-full sm:w-auto"
                >
                    <Mail className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                    <span className="tracking-wide">긴급 문의하기</span>
                </a>
            </div>
        </div>
    );
}
