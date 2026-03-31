"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ScoreKey = "O" | "C" | "F" | "I" | "A" | "E" | "S" | "V";
type Scores = Record<ScoreKey, number>;

interface ScoreEntry {
  key: ScoreKey;
  amount: number;
}

interface Question {
  coverImg: string;
  answerAImg: string;
  answerBImg: string;
  aScores: ScoreEntry[];
  bScores: ScoreEntry[];
}

const QUESTIONS: Question[] = [
  {
    coverImg: "/icons/classignul/2. Q1 표지.webp",
    answerAImg: "/icons/classignul/2-1. Q1 A답변.webp",
    answerBImg: "/icons/classignul/2-2. Q1 B답변.webp",
    aScores: [{ key: "O", amount: 2 }],
    bScores: [{ key: "C", amount: 2 }],
  },
  {
    coverImg: "/icons/classignul/3. Q2 표지.webp",
    answerAImg: "/icons/classignul/3-1. Q2 A답변.webp",
    answerBImg: "/icons/classignul/3-2. Q2 B답변.webp",
    aScores: [{ key: "F", amount: 2 }],
    bScores: [{ key: "I", amount: 2 }],
  },
  {
    coverImg: "/icons/classignul/4. Q3 표지.webp",
    answerAImg: "/icons/classignul/4-1. Q3 A답변.webp",
    answerBImg: "/icons/classignul/4-2. Q3 B답변.webp",
    aScores: [{ key: "A", amount: 2 }],
    bScores: [{ key: "E", amount: 2 }],
  },
  {
    coverImg: "/icons/classignul/5. Q4 표지.webp",
    answerAImg: "/icons/classignul/5-1. Q4 A답변.webp",
    answerBImg: "/icons/classignul/5-2. Q4 B답변.webp",
    aScores: [{ key: "S", amount: 2 }],
    bScores: [{ key: "V", amount: 2 }],
  },
  {
    coverImg: "/icons/classignul/6. Q5 표지.webp",
    answerAImg: "/icons/classignul/6-1. Q5 A답변.webp",
    answerBImg: "/icons/classignul/6-2. Q5 B답변.webp",
    aScores: [{ key: "F", amount: 1 }, { key: "A", amount: 1 }],
    bScores: [{ key: "I", amount: 1 }, { key: "E", amount: 1 }],
  },
  {
    coverImg: "/icons/classignul/7. Q6 표지.webp",
    answerAImg: "/icons/classignul/7-1. Q6 A답변.webp",
    answerBImg: "/icons/classignul/7-2. Q6 B답변.webp",
    aScores: [{ key: "O", amount: 1 }, { key: "V", amount: 1 }],
    bScores: [{ key: "C", amount: 1 }, { key: "S", amount: 1 }],
  },
];

const RESULT_IMAGES: Record<string, string> = {
  CIAS: "/icons/classignul/8. rCIAS.webp",
  CIAV: "/icons/classignul/9. rCIAV.webp",
  OIAS: "/icons/classignul/10. rOIAS.webp",
  OIAV: "/icons/classignul/11. rOIAV.webp",
  CIES: "/icons/classignul/12. rCIES.webp",
  CIEV: "/icons/classignul/13. rCIEV.webp",
  OIES: "/icons/classignul/14. rOIES.webp",
  OIEV: "/icons/classignul/15. rOIEV.webp",
  CFAS: "/icons/classignul/16. rCFAS.webp",
  CFES: "/icons/classignul/17. rCFES.webp",
  OFAS: "/icons/classignul/18. rOFAS.webp",
  OFES: "/icons/classignul/19. rOFES.webp",
  CFAV: "/icons/classignul/20. rCFAV.webp",
  CFEV: "/icons/classignul/21. rCFEV.webp",
  OFAV: "/icons/classignul/22. rOFAV.webp",
  OFEV: "/icons/classignul/23. rOFEV.webp",
};

function calcResult(scores: Scores): string {
  const dim1 = scores.C >= scores.O ? "C" : "O";
  const dim2 = scores.I >= scores.F ? "I" : "F";
  const dim3 = scores.A >= scores.E ? "A" : "E";
  const dim4 = scores.S >= scores.V ? "S" : "V";
  return dim1 + dim2 + dim3 + dim4;
}

type Step = "start" | "question" | "loading" | "result";

export default function ClassignulPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({
    O: 0, C: 0, F: 0, I: 0, A: 0, E: 0, S: 0, V: 0,
  });
  const [resultCode, setResultCode] = useState<string>("");
  const [isSharedView, setIsSharedView] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 공유 링크로 접속 시 결과 코드 읽기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("result");
    if (code && RESULT_IMAGES[code]) {
      setResultCode(code);
      setStep("result");
      setIsSharedView(true);
    }
  }, []);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  function handleAnswer(entries: ScoreEntry[]) {
    const newScores = { ...scores };
    entries.forEach(({ key, amount }) => { newScores[key] += amount; });
    setScores(newScores);

    const nextIndex = questionIndex + 1;
    if (nextIndex < QUESTIONS.length) {
      setQuestionIndex(nextIndex);
    } else {
      const code = calcResult(newScores);
      setResultCode(code);
      setStep("loading");
      loadingTimerRef.current = setTimeout(() => setStep("result"), 2200);
    }
  }

  function handleRestart() {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setScores({ O: 0, C: 0, F: 0, I: 0, A: 0, E: 0, S: 0, V: 0 });
    setQuestionIndex(0);
    setResultCode("");
    setIsSharedView(false);
    setStep("start");
    router.replace("/classignul");
  }

  const currentQuestion = QUESTIONS[questionIndex];
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/classignul?result=${resultCode}`;

  return (
    <div className="relative w-full h-screen bg-white font-['Pretendard'] flex flex-col">
      {/* Status Bar Placeholder */}
      <div className="h-[21px] bg-white" />

      {/* Header */}
      <div className="w-full bg-white border-b border-[#f4f5f7]">
        <div className="px-[20px] py-[12px]">
          <div className="flex items-center gap-[4px] h-[30px]">
            <button
              type="button"
              onClick={() => {
                if (step === "start") router.back();
                else if (step === "question") setStep("start");
                else if (step === "loading") { /* 로딩 중엔 뒤로가기 무시 */ }
                else handleRestart();
              }}
              className="flex w-[24px] h-[24px] items-center justify-center p-0 flex-shrink-0"
              aria-label="뒤로가기"
            >
              <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
            </button>
            <h1 className="text-[16px] font-semibold text-[#1a1a1a] flex-1 text-center">
              클래시그널
            </h1>
            <div className="w-[24px] h-[24px]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 시작 화면 */}
        {step === "start" && (
          <div className="relative flex-1">
            <Image
              src="/icons/classignul/KakaoTalk_20260324_104838173.webp"
              alt="클래시그널 시작"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center translate-y-[40%]">
              <button
                onClick={() => setStep("question")}
                className="w-[260px] active:opacity-70 transition-opacity"
              >
                <Image
                  src="/icons/classignul/1-1. 시작하기 버튼.webp"
                  alt="시작하기"
                  width={260}
                  height={80}
                  className="w-full h-auto"
                  priority
                />
              </button>
            </div>
          </div>
        )}

        {/* 질문 화면 */}
        {step === "question" && (
          <div className="relative flex-1">
            <Image
              src={currentQuestion.coverImg}
              alt={`Q${questionIndex + 1} 표지`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 translate-y-[15%]">
              <button
                onClick={() => handleAnswer(currentQuestion.aScores)}
                className="w-full active:opacity-70 transition-opacity"
              >
                <Image
                  src={currentQuestion.answerAImg}
                  alt="A 답변"
                  width={335}
                  height={80}
                  className="w-full h-auto"
                />
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.bScores)}
                className="w-full active:opacity-70 transition-opacity"
              >
                <Image
                  src={currentQuestion.answerBImg}
                  alt="B 답변"
                  width={335}
                  height={80}
                  className="w-full h-auto"
                />
              </button>
            </div>
          </div>
        )}

        {/* 결과 로딩 화면 */}
        {step === "loading" && (
          <div className="relative flex-1">
            <Image
              src="/icons/classignul/0-1. 결과 로딩.webp"
              alt="결과 분석 중"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 결과 화면 */}
        {step === "result" && RESULT_IMAGES[resultCode] && (
          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              <Image
                src={RESULT_IMAGES[resultCode]}
                alt={`${resultCode} 결과`}
                width={375}
                height={800}
                className="w-full h-auto"
                priority
              />

              {/* 결과 이미지 하단에서 120px 위에 버튼 배치 */}
              <div className="absolute bottom-[75px] inset-x-0 flex flex-col items-center gap-3 px-5 -translate-x-[0px]">
                {/* 결과 공유하기 버튼 - 항상 표시 */}
                <button
                  onClick={async () => {
                    const shareData = {
                      title: "클래시그널",
                      text: `나의 클래시그널 유형을 알려줄게. 너도 어떤 유형인지 테스트해봐!`,
                      url: shareUrl,
                    };
                    if (navigator.share) {
                      await navigator.share(shareData);
                    } else {
                      await navigator.clipboard.writeText(shareUrl);
                      alert("링크가 복사되었습니다!");
                    }
                  }}
                  className="active:opacity-70 transition-opacity"
                >
                  <Image
                    src="/icons/classignul/24-1. 결과 공유하기 버튼.webp"
                    alt="결과 공유하기"
                    width={200}
                    height={60}
                    className="w-[187px] h-auto"
                  />
                </button>

                {/* 테스트 참여하기 버튼 - 공유 링크로 접속한 경우만 표시 */}
                {isSharedView && (
                  <button
                    onClick={handleRestart}
                    className="active:opacity-70 transition-opacity"
                  >
                    <Image
                      src="/icons/classignul/24-2. 테스트 참여하기 버튼.webp"
                      alt="테스트 참여하기"
                      width={200}
                      height={60}
                      className="w-[187px] h-auto"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
