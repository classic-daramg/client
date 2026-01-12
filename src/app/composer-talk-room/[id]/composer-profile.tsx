type ComposerData = {
    composerId: number;
    koreanName: string;
    bio: string;
    isLiked: boolean;
};

export default function ComposerProfile({ data }: { data: ComposerData }) {
    return (
        <div className="mb-4 bg-white rounded-2xl shadow-[0px_0px_7px_-3px_rgba(0,0,0,0.15)] border border-zinc-200 p-5 flex flex-col gap-3">
            <p className="text-neutral-400 text-xs font-medium">{data.bio}</p>
            <div className="flex flex-col gap-2">
                <h1 className="text-zinc-900 text-2xl font-semibold">{data.koreanName}</h1>
            </div>
        </div>
    );
}