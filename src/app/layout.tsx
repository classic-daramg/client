import Image from 'next/image';
import Link from 'next/link';
import './globals.css';
import ScrollButton from '@/components/scroll_button';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body className="min-h-screen bg-gray-100 flex justify-center">
                {/* max-w-[375px]: 최대 너비를 iPhone mini 사이즈(375px)로 정확히 제한 */}
                <div className="w-full max-w-[375px] min-h-screen flex flex-col bg-white shadow-lg">
                    {/* 헤더 */}
                    
                    {/* 페이지 콘텐츠 (children) */}
                    <main className="w-full flex-1">
                        {children}
                    </main>
                    <ScrollButton />
                </div>
            </body>
        </html>
    );
}