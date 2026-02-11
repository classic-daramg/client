import { Suspense } from 'react';
import { WritePageInner } from './write-page-inner';

export default function WritePage() {
    return (
        <Suspense fallback={<div className="bg-[#f4f5f7] min-h-screen" />}>
            <WritePageInner />
        </Suspense>
    );
}
