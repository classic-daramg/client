'use server';

import { NextResponse } from 'next/server';

// 간단한 인메모리 저장 (개발/Mock 용). 서버 재시작 시 초기화됨.
// 실제 서비스에서는 DB (Prisma / Drizzle 등) 로 대체.
interface Comment {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  isHeartSelected: boolean;
  isReply: boolean;
  parentId: number | null;
}

const commentStore: Record<string, Comment[]> = {};

// NOTE (Next.js 15): context.params is now async in route handlers for dynamic segments.
// You must await it before accessing properties, otherwise you'll see the
// warning: "`params` should be awaited before using its properties."
export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  try {
    const body = await req.json();
    const { content, parentId, author = '익명다람쥐' } = body || {};
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: '내용이 비어있습니다.' }, { status: 400 });
    }
    const list = commentStore[postId] || [];
    const newComment = {
      id: list.length ? list[list.length - 1].id + 1 : 1,
      author,
      timestamp: new Date().toISOString(),
      content,
      isHeartSelected: false,
      isReply: !!parentId,
      parentId: parentId ?? null
    };
    commentStore[postId] = [...list, newComment];
    return NextResponse.json({ ok: true, comment: newComment }, { status: 201 });
  } catch (e) {
    console.error('Comment POST error', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const list = commentStore[postId] || [];
  return NextResponse.json({ comments: list }, { status: 200 });
}
