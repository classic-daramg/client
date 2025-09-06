import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, composerId, reason, comment } = body;

    // 필수 필드 검증
    if (!postId || !composerId || !reason) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스에 신고 내용 저장
    const reportData = {
      postId,
      composerId,
      reason,
      comment: comment || '',
      reportedAt: new Date().toISOString(),
      status: 'pending', // pending, reviewed, resolved
    };

    // 임시로 콘솔에 로그 출력 (실제로는 DB에 저장)
    console.log('신고 접수:', reportData);

    // 실제 구현 시:
    // const report = await db.reports.create({ data: reportData });
    
    return NextResponse.json(
      { 
        message: '신고가 접수되었습니다.',
        reportId: `temp-${Date.now()}` // 임시 ID
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('신고 처리 오류:', error);
    return NextResponse.json(
      { error: '신고 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}