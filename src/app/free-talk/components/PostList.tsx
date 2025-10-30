'use client';

import PostItem from './PostItem';

const samplePosts = [
  {
    id: 1,
    title: "베토벤 교향곡 9번 '합창' 후기",
    content: "오늘 처음으로 베토벤 9번 교향곡을 끝까지 들어봤는데, 마지막 합창 부분에서 소름이 돋았어요. 클래식 초보인데도 이런 감동을 느낄 수 있다니...",
    tags: ["베토벤", "교향곡9번", "클래식입문"],
    likes: 15,
    comments: 4,
    timeAgo: "10분 전",
    author: "클래식새내기",
    hasImage: true
  },
  {
    id: 2,
    title: "요즘 자주 듣는 쇼팽 녹턴 추천합니다.",
    content: "밤에 일기 쓰거나 책 읽을 때 쇼팽 녹턴을 자주 들어요. 특히 2번이랑 20번은 마음이 편안해지는 느낌이라 좋아요. 다른 분들은 어떤 곡 좋아하세요?",
    tags: ["쇼팽", "녹턴", "피아노"],
    likes: 22,
    comments: 8,
    timeAgo: "1시간 전",
    author: "감성다람쥐",
    hasImage: true
  },
  {
    id: 3,
    title: "클래식 공연 같이 갈 친구 구해요!",
    content: "이번 주말에 예술의전당에서 하는 오케스트라 공연 예매했는데 같이 갈 친구가 갑자기 약속을 취소했네요. 클래식 좋아하는 분 중에 같이 가실 분 있을까요?",
    tags: ["공연", "예술의전당", "친구구함"],
    likes: 5,
    comments: 12,
    timeAgo: "3시간 전",
    author: "공연메이트",
    hasImage: false
  },
  {
    id: 4,
    title: "다들 클래식 입문 어떤 곡으로 하셨나요?",
    content: "저는 비발디의 '사계'로 클래식에 처음 입문했어요. 각 계절을 음악으로 표현한 게 너무 신기하고 재미있더라고요. 다른 분들의 입문곡도 궁금해요!",
    tags: ["입문곡", "비발디", "사계"],
    likes: 31,
    comments: 15,
    timeAgo: "5시간 전",
    author: "궁금한도토리",
    hasImage: true
  }
];

export default function PostList({ searchTerm }: { searchTerm?: string }) {
  const filteredPosts = samplePosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
    post.content.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  );

  return (
    <div className="self-stretch bg-white flex flex-col justify-start items-center">
      {filteredPosts.map((post) => (
        <PostItem
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
          tags={post.tags}
          likes={post.likes}
          comments={post.comments}
          timeAgo={post.timeAgo}
          author={post.author}
          hasImage={post.hasImage}
        />
      ))}
    </div>
  );
}
