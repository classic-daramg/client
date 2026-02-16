// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';
import { Metadata } from 'next';
import './globals.css';
import ScrollButton from '@/components/scroll_button';

export const metadata: Metadata = {
  title: '클래식 듣는 다람쥐 다람쥐 - 클래식 음악 커뮤니티',
  description: '작곡가별 토크룸, 클래식 큐레이션, 자유 토크룸을 통해 클래식 음악 애호가들과 소통하는 공간',
  openGraph: {
    title: '클래식 듣는 다람쥐 - 클래식 음악 커뮤니티',
    description: '작곡가별 토크룸, 클래식 큐레이션, 자유 토크룸을 통해 클래식 음악 애호가들과 소통하는 공간',
    type: 'website',
    url: 'https://www.classicaldaramz.com',
    images: [
      {
        url: 'https://www.classicaldaramz.com/icons/dataofcd.png',
        width: 1200,
        height: 630,
        alt: '클래식 듣는 다람쥐 - 클래식 음악 커뮤니티',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '클래식 듣는 다람쥐 - 클래식 음악 커뮤니티',
    description: '작곡가별 토크룸, 클래식 큐레이션, 자유 토크룸을 통해 클래식 음악 애호가들과 소통하는 공간',
    images: ['https://www.classicaldaramz.com/icons/dataofcd.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            {/* GA4 측정 ID: G-YCN22QPX50
                - GoogleAnalytics 컴포넌트는 내부적으로 Script 컴포넌트를 최적화해서 로드합니다.
                - 레이아웃 하단에 배치하여 페이지 로딩 성능에 영향을 주지 않도록 합니다.
            */}
            <body className="min-h-screen bg-gray-100 flex justify-center">
                {/* 메인 컨테이너: iPhone mini 사이즈(375px) 기준 모바일 UI 최적화 */}
                <div className="w-full max-w-[375px] min-h-screen flex flex-col bg-white shadow-lg relative">
                    {/* 페이지 콘텐츠 (children): 
                        main 태그에 flex-1을 주어 콘텐츠가 적어도 전체 높이를 차지하게 합니다. 
                    */}
                    <main className="w-full flex-1">
                        {children}
                    </main>
                    
                    {/* 상단 이동 버튼 */}
                    <ScrollButton />
                </div>

                {/* Google Analytics 연동
                    - gaId 속성에 전달받은 측정 ID를 입력합니다.
                    - body 태그가 닫히기 직전에 위치하는 것이 관례입니다.
                */}
                <GoogleAnalytics gaId="G-YCN22QPX50" />
            </body>
        </html>
    );
}