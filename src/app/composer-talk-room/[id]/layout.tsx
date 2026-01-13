import React from 'react';

export default function ComposerTalkLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-8">
            <main className="w-[375px] flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}