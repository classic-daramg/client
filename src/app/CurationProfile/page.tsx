'use client';

import React from 'react';
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  comments: number;
  likes: number;
  time: string;
}

interface CurationProfileProps {
  user?: {
    nickname: string;
    bio: string;
    following: number;
    followers: number;
    profileImage?: string;
  };
  posts?: Post[];
  onBack?: () => void;
  onFriendRequest?: () => void;
  onTitleList?: () => void;
  onPostClick?: (postId: number) => void;
}

const CurationProfile: React.FC<CurationProfileProps> = ({
  user = {
    nickname: "사용자닉네임",
    bio: "BIO는 최대 20자로 합시다",
    following: 3,
    followers: 24
  },
  posts = [
    {
      id: 1,
      title: "제목이 들어갈 자리입니다",
      content: "글 내용이 들어갈 자리입니다.  dfaklsfjsalk;fjsaklfjal;ksdfjaskld jasd;klfjasd;lk fjasdlk;fajsd;kl ajsdl;k fasjd;lf",
      tags: ["#태그01", "#태그02", "#태그03"],
      comments: 3,
      likes: 5,
      time: "3초전"
    },
    {
      id: 2,
      title: "제목이 들어갈 자리입니다",
      content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
      tags: ["#태그01", "#태그02", "#태그03"],
      comments: 3,
      likes: 5,
      time: "3초전"
    },
    {
      id: 3,
      title: "제목이 들어갈 자리입니다",
      content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
      tags: ["#태그01", "#태그02", "#태그03"],
      comments: 3,
      likes: 5,
      time: "3초전"
    },
    {
      id: 4,
      title: "제목이 들어갈 자리입니다",
      content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
      tags: ["#태그01", "#태그02", "#태그03"],
      comments: 3,
      likes: 5,
      time: "3초전"
    }
  ],
  onBack,
  onFriendRequest,
  onTitleList,
  onPostClick
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  return (
    <div className="w-full max-w-[375px] h-screen bg-gray-100 mx-auto relative overflow-hidden">
      {/* Status Bar - iOS Safe Area */}
      <div className="h-[env(safe-area-inset-top,21px)] bg-white" />
      
      {/* Header */}
      <header className="bg-white px-5 py-3 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleBack}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <Image 
              src="/icons/back.svg" 
              alt="" 
              width={16} 
              height={16}
              priority
            />
          </button>
          <h1 className="flex-1 text-gray-900 font-semibold text-base">
            큐레이션 프로필
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <section className="bg-white p-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            {/* Profile Image */}
            <div className="relative w-[68px] h-[68px]">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={`${user.nickname} 프로필`}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-full" />
              )}
            </div>
            
            {/* Profile Details */}
            <div className="flex-1 space-y-1.5">
              <div className="space-y-0.5">
                <h2 className="text-gray-900 font-semibold text-xl">
                  {user.nickname}
                </h2>
                <p className="text-gray-400 font-medium text-[11px]">
                  {user.bio}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-blue-800 font-semibold">팔로잉</span>
                <span className="text-blue-800 font-semibold">{user.following}</span>
                <span className="text-blue-800 font-medium">·</span>
                <span className="text-blue-800 font-semibold">팔로워</span>
                <span className="text-blue-800 font-semibold">{user.followers}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={onFriendRequest}
                className="bg-blue-800 text-gray-100 font-semibold text-xs px-3 py-1.5 rounded-full h-[26px] flex items-center justify-center gap-1 hover:bg-blue-900 transition-colors"
              >
                친구맺기
                <Image 
                  src="/icons/back.svg" 
                  alt=""
                  width={8} 
                  height={8}
                  className="rotate-180"
                />
              </button>
              <button 
                onClick={onTitleList}
                className="bg-white text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-full border border-gray-400 h-[26px] flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
              >
                칭호 목록
                <Image 
                  src="/icons/back.svg" 
                  alt="" 
                  width={8} 
                  height={8}
                  className="rotate-180"
                />
              </button>
            </div>
          </div>
        </section>

        {/* Posts Section */}
        <section className="bg-white">
          {posts.map((post, index) => (
            <article 
              key={post.id} 
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                index > 0 ? 'border-t border-gray-100' : ''
              }`}
              onClick={() => handlePostClick(post.id)}
            >
              <div className="flex gap-3">
                {/* Post Content */}
                <div className="flex-1 space-y-2">
                  {/* Post Label */}
                  <div className="flex items-center gap-1">
                    <Image 
                      src="/icons/curation.svg" 
                      alt="" 
                      width={12} 
                      height={12} 
                    />
                    <span className="text-gray-400 font-semibold text-[11px]">
                      큐레이션글
                    </span>
                  </div>
                  
                  {/* Post Main Content */}
                  <div className="space-y-1">
                    <h3 className="text-gray-900 font-semibold text-sm line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 font-medium text-xs line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  
                  {/* Post Meta */}
                  <div className="space-y-1">
                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="text-gray-400 font-medium text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Image 
                          src="/icons/icons_comment.svg" 
                          alt="댓글" 
                          width={12} 
                          height={12} 
                        />
                        <span className="text-blue-800 font-medium">
                          {post.comments}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image 
                          src="/icons/heart.svg" 
                          alt="좋아요" 
                          width={12} 
                          height={12} 
                        />
                        <span className="text-blue-800 font-medium">
                          {post.likes}
                        </span>
                      </div>
                      <time className="text-gray-400 font-medium">
                        {post.time}
                      </time>
                    </div>
                  </div>
                </div>
                
                {/* Post Thumbnail */}
                <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0" />
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Home Indicator - iOS Safe Area */}
      <div className="h-[env(safe-area-inset-bottom,34px)] relative">
        <div className="absolute w-36 h-[5px] bg-black rounded-full bottom-2 left-1/2 transform -translate-x-1/2" />
      </div>
    </div>
  );
};

export default function CurationProfilePage() {
  return <CurationProfile />;
}