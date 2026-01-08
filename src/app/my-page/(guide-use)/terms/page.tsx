'use client';

import React from 'react';

const backIcon = '/icons/back.svg';

export default function Terms() {
	return (
		<div className="relative w-[375px] min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<div className="flex gap-[4px] items-center w-full">
					<div className="relative w-6 h-6 flex items-center justify-center">
						<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
					</div>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>이용약관</p>
					</div>
				</div>
			</div>

			{/* Terms Content */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				<div className="flex flex-col gap-4">
					{/* Article 1 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제1조 (목적)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							이 약관은 클래식듣는다람쥐(이하 &quot;회사&quot;)가 제공하는 서비스의 이용조건 및 절차, 회사와
							회원의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
						</p>
					</div>

					{/* Article 2 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제2조 (정의)</h3>
						<div className="flex flex-col gap-2">
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									1. &quot;서비스&quot;라 함은 회사가 제공하는 모든 서비스를 의미합니다.
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									2. &quot;회원&quot;이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을
									체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
								</p>
							</div>
						</div>
					</div>

					{/* Article 3 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제3조 (약관 외 준칙)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							이 약관에서 규정하지 않는 사항에 대하여는 전자상거래등에서의 소비자보호에 관한 법률, 개인정보보호법
							등 관련 법령 또는 상관례에 따릅니다.
						</p>
					</div>

					{/* Article 4 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제4조 (서비스의 제공)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							회사는 회원에게 다음과 같은 서비스를 제공합니다. 회사는 서비스의 내용을 변경하거나 서비스를 중단할 수
							있으며, 변경 및 중단 시에는 사전에 공지합니다.
						</p>
					</div>

					{/* Article 5 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제5조 (이용계약의 체결)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							회원이 되고자 하는 자는 회사가 정한 양식에 따라 회원가입을 신청하고, 회사가 이를 승낙함으로써 이용계약이
							성립됩니다.
						</p>
					</div>

					{/* Article 6 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제6조 (회원의 의무)</h3>
						<div className="flex flex-col gap-2">
							<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
								회원은 다음의 행위를 하여서는 안 됩니다.
							</p>
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									1. 타인의 개인정보 수집 또는 이용
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									2. 저작권 등 지적 재산권 침해
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									3. 명예훼손 또는 모욕
								</p>
							</div>
							<div>
								<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
									4. 도배, 스팸, 사기 등 부정행위
								</p>
							</div>
						</div>
					</div>

					{/* Article 7 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제7조 (책임 제한)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							회사는 회원 간 분쟁, 서버 오류, 네트워크 오류 등으로 인한 손해에 대해 책임을 지지 않습니다.
						</p>
					</div>

					{/* Article 8 */}
					<div>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">제8조 (약관의 변경)</h3>
						<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
							회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력을 발생합니다.
						</p>
					</div>
				</div>
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
