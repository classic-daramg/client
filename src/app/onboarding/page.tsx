"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OnboardingPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-5 h-[54px] flex items-center">
                <button
                    onClick={handleBack}
                    className="w-6 h-6 flex items-center justify-center -ml-1"
                    aria-label="뒤로가기"
                >
                    <Image
                        src="/icons/back.svg"
                        alt="뒤로가기"
                        width={24}
                        height={24}
                    />
                </button>
                {/* Optional Title can go here if needed, keeping it clean for now */}
            </header>

            {/* Main Content */}
            <main className="w-full pt-[54px] pb-10 px-5 flex flex-col items-center gap-6">
                <div className="w-full max-w-[500px] flex flex-col gap-4">
                    <div className="relative w-full shadow-sm rounded-[20px] overflow-hidden">
                        <Image
                            src="/icons/onboarding_image.png"
                            alt="Onboarding Guide"
                            width={600}
                            height={1200}
                            className="w-full h-auto object-contain"
                            priority
                            unoptimized // Optional: if image is large/external, but local usually fine. using standard optimization.
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
