'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white">
        <div className="h-[21px]" /> {/* Status bar space */}
        <div className="px-5 pb-3 flex items-center gap-1">
          <Link href="/my-page" className="w-5 h-5 flex items-center justify-center">
            <Image src="/icons/back.svg" alt="뒤로가기" width={20} height={20} />
          </Link>
          <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold">
            개인정보처리방침
          </h1>
        </div>
      </header>

      {/* Divider */}
      <div className="h-2.5 bg-[#f4f5f7]" />

      {/* Content */}
      <div className="px-5 pt-[15px]">
        <div className="flex flex-col gap-2.5">
          {/* Title */}
          <h2 className="text-[#4c4c4c] text-sm font-semibold">
            개인정보처리방침
          </h2>

          {/* Content Box */}
          <div className="bg-[#f4f5f7] rounded-md p-3.5">
            <p className="text-[#a6a6a6] text-xs font-medium leading-normal whitespace-pre-line">
              {`제1조 (목적)
본 개인정보 처리방침은 <클래식 듣는 다람쥐> 서비스(이하 "서비스")를 이용하는 회원의 개인정보를 보호하고, 이를 적절히 처리하는 방법을 안내하기 위해 마련되었습니다.

제2조 (수집하는 개인정보 항목)
회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집할 수 있습니다. 

1. 회원가입 시: 성명, 생년월일, 이메일, 비밀번호, 닉네임 등
2. 서비스 이용 시: 기기 정보, 접속 로그, 쿠키 등
3. 고객 문의 시: 이름, 연락처, 문의 내용 등
4. 커뮤니티 활동: 게시글, 댓글, 프로필 사진 등 회원이 제공한 정보

제3조 (개인정보의 이용 목적)
수집된 개인정보는 다음과 같은 목적으로 이용됩니다.

1. 회원가입 및 본인 확인, 서비스 이용 관리
2. 서비스 제공 및 맞춤형 콘텐츠 제공
3. 고객 문의 및 불만 처리, 서비스 개선
4. 법률상 의무 이행 및 분쟁 해결

제4조 (개인정보의 보관 및 파기)

1. 회원 탈퇴 또는 이용 목적이 달성된 경우 지체 없이 개인정보를 파기합니다. 단, 이용약관 위반에 따른 제재 회피 및 부정이용 방지를 위하여 아래와 같이 특정 정보를 일정 기간 동안 안전하게 보관될 수 있습니다.
    - 보관 항목: 가입 이메일 주소, 탈퇴 일시, 서비스 이용 기록(징계 기록 등)
    - 보관 목적: 탈퇴 후 재가입 제한 기간 적용 및 중복 가입 확인
    - 보관 기간: 회원 탈퇴일로부터 31일간
2. 법령에 따라 별도로 보관해야 할 경우 해당 기간 동안 안전하게 보관합니다.
3. 전자적 파일 형태의 개인정보는 복구 불가능한 방법으로 안전하게 삭제합니다.
4. 파기 절차 및 방법은 내부 정책에 따라 체계적으로 실시합니다.

제5조 (개인정보 제공 및 위탁)

1. 회원 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
2. 서비스 운영을 위해 일부 업무(예: 서버 관리, 고객 상담 등)를 신뢰할 수 있는 외부 전문 업체에 위탁할 수 있으며, 위탁 시 회원에게 사전 고지합니다.

제6조 (회원의 권리 및 행사 방법)

1. 회원은 언제든지 자신의 개인정보를 열람, 수정, 삭제할 수 있습니다.
2. 개인정보 삭제 요청 시 법령상 의무 보존 대상 정보를 제외하고 즉시 처리합니다.
3. 개인정보 관련 권리 행사는 서비스 내 ‘개인정보 관리’ 메뉴 또는 ‘직접 문의하기’를 통해 가능합니다.

제7조 (개인정보 보호를 위한 기술적 및 관리적 조치)
회사는 개인정보 보호를 위해 다음과 같은 조치를 시행합니다.

1. 개인정보 암호화 및 접근 권한 제한
2. 정기적인 보안 점검
3. 개인정보 보호 교육 시행

제8조 (문의처)
개인정보와 관련한 문의는 아래 연락처로 문의해 주세요.

- <메일입력>

본 개인정보 처리방침은 2025년 2월 21일부터 적용됩니다.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
