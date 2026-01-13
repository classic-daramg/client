type ComposerData = {
    composerId: number;
    koreanName: string;
    englishName: string;
    nativeName: string;
    nationality: string;
    gender: 'MALE' | 'FEMALE';
    birthYear: number;
    deathYear: number | null;
    bio: string;
    isLiked: boolean;
};

export default function ComposerProfile({ data }: { data: ComposerData }) {
    const genderText = data.gender === 'MALE' ? '남성' : '여성';
    const yearText = data.deathYear 
        ? `${data.birthYear}-${data.deathYear}` 
        : `${data.birthYear}-`;

    return (
        <div className="bg-white px-6 py-[34px] flex flex-col gap-[10px] border-t-[10px] border-b-[10px] border-[#f4f5f7]">
            <div className="flex items-center w-full">
                <p className="text-[#a6a6a6] text-[14px] font-semibold leading-normal">
                    {data.bio}
                </p>
            </div>
            <div className="flex items-start w-full">
                <h1 className="text-[#1a1a1a] text-[22px] font-semibold leading-normal flex-grow">
                    {data.koreanName}
                </h1>
            </div>
            <div className="flex items-center justify-end w-full">
                <div className="flex flex-col gap-[2px] flex-grow text-[#d9d9d9] text-[12px] font-medium leading-normal">
                    <p>{data.englishName}</p>
                    <p>{data.nationality} · {genderText} · {yearText}</p>
                </div>
            </div>
        </div>
    );
}