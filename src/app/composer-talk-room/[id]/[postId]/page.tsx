import Image from 'next/image';
import Link from 'next/link';
import CommentList from './comment-list';
import { ReportButton } from './report-button';

// Mock Data
const mockPostData = {
    composer: '라흐마니노프',
    author: 'Username',
    timestamp: '25/08/28 14:26',
    category: '라흐마니노프 이야기',
    postType: '자유글',
    title: '제목이 들어갈 자리입니다',
    content: '글 내용이 들어갈 자리입니다. 글자수는 아 이게몇개냐\n가나다라마바사아자차카타파하가나다라마바사아자차카타파하\n28자입니다 최대',
    tags: ['#태그01', '#태그02', '#태그03'],
    images: ['/images/placeholder-1.png', '/images/placeholder-2.png', '/images/placeholder-3.png'],
    likes: 12,
    scraps: 3,
};

export const mockComments = [
    { id: 1, author: 'Username', timestamp: '25/08/28 14:26', content: '댓글내용을 입력하는 곳입니다. 최대는 마찬가지로 28자 근데 띄어쓰기랑 문장부호는 어떻게 세나요?', isHeartSelected: false, isReply: false },
    { id: 2, author: 'Username', timestamp: '25/08/28 14:26', content: '댓글내용을 입력하는 곳입니다. 최대는 마찬가지로 28자 근데 띄어쓰기랑 문장부호는 어떻게 세나요?', isHeartSelected: true, isReply: true },
    { id: 3, author: 'Username', timestamp: '25/08/28 14:26', content: '댓글내용을 입력하는 곳입니다. 최대는 마찬가지로 28자 근데 띄어쓰기랑 문장부호는 어떻게 세나요?', isHeartSelected: true, isReply: false },
    { id: 4, author: 'Username', timestamp: '25/08/28 14:26', content: '댓글내용을 입력하는 곳입니다. 최대는 마찬가지로 28자 근데 띄어쓰기랑 문장부호는 어떻게 세나요?', isHeartSelected: false, isReply: false },
    { id: 5, author: 'Username', timestamp: '25/08/28 14:26', content: '추가 댓글입니다. 스크롤을 내려 확인해보세요.', isHeartSelected: false, isReply: false },
    { id: 6, author: 'Username', timestamp: '25/08/28 14:27', content: '새로운 댓글이 로드되었습니다.', isHeartSelected: false, isReply: false },
    { id: 7, author: 'Username', timestamp: '25/08/28 14:28', content: '무한 스크롤 테스트 중입니다.', isHeartSelected: false, isReply: true },
    { id: 8, author: 'Username', timestamp: '25/08/28 14:29', content: '여기까지 보인다면 성공입니다.', isHeartSelected: false, isReply: false },
    { id: 9, author: 'Username', timestamp: '25/08/28 14:30', content: '마지막 댓글입니다.', isHeartSelected: false, isReply: false },
];

export type Comment = (typeof mockComments)[0];


type PostDetailPageProps = {
  params: Promise<{
    id: string;
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id: composerId, postId } = await params;

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      <div className="bg-white w-[375px] mx-auto">
        {/* Post Content */}
        <div className="px-5 pb-5 pt-4">
            <div className="flex items-start gap-2 mb-4">
                <div className="w-[31px] h-[31px] bg-zinc-300 rounded-md" />
                <div className="flex-1">
                    <p className="font-semibold text-sm text-zinc-700">{mockPostData.author}</p>
                    <p className="text-xs text-zinc-400">{mockPostData.timestamp} · {mockPostData.category}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold">
                        <Image src="/icons/talkIcon.svg" alt="" width={12} height={12} />
                        <span>{mockPostData.postType}</span>
                    </div>
                    <ReportButton postId={postId} composerId={composerId} />
                </div>
            </div>

            <div className="mb-2">
                <h2 className="text-sm font-semibold text-zinc-900">{mockPostData.title}</h2>
            </div>

            <div className="text-sm text-zinc-500 mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                {mockPostData.content}
            </div>

            <div className="flex gap-1 text-sm text-zinc-400 mb-4">
                {mockPostData.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <div className="flex gap-1.5 mb-4">
                {mockPostData.images.map((src, index) => (
                    <div key={index} className="w-[151px] h-[151px] bg-zinc-300 rounded-lg" />
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Image src="/icons/heart.svg" alt="likes" width={24} height={24} />
                        <span>좋아요</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Image src="/icons/logo.svg" alt="scraps" width={24} height={24} />
                        <span>스크랩</span>
                    </div>
                </div>
                <button>
                    <Image src="/icons/music.svg" alt="share" width={24} height={24} />
                </button>
            </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-1.5 flex flex-col gap-1.5 w-[375px] mx-auto">
        <CommentList composerId={composerId} initialComments={mockComments} />
      </div>
    </div>
  );
}