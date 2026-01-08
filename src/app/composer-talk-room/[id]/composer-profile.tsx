export default function ComposerProfile() {
    return (
        <div className="mb-4 bg-white rounded-2xl shadow-[0px_0px_7px_-3px_rgba(0,0,0,0.15)] border border-zinc-200 p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <h1 className="text-zinc-900 text-xl font-semibold">세르게이 라흐마니노프</h1>
                    <button className="h-6 px-2 py-1 bg-blue-900 rounded-full flex justify-center items-center gap-0.5 text-neutral-100 text-xs font-medium">
                        연주회 정보
                    </button>
                </div>
                <p className="text-neutral-400 text-xs font-medium">남성 | 러시아 | 1873 - 1943</p>
                <p className="text-zinc-400 text-xs font-medium whitespace-pre-line">
                    Sergei Vasil&apos;evich Rachmaninov{'\n'}Сергей Васильевич Рахманинов
                </p>
            </div>
        </div>
    );
}