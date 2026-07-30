"use client";

import { COLLABORATION_TEST_TOTAL_QUESTION_COUNT } from "../_data/collaborationTest";
import { useCollaborationTestStore } from "@/stores/collaborationTestStore";

export default function CollaborationTypeResultLoadingPage() {
  const responses = useCollaborationTestStore((state) => state.responses);
  const responseEntries = Array.from(
    { length: COLLABORATION_TEST_TOTAL_QUESTION_COUNT },
    (_, index) => {
      const questionId = index + 1;

      return {
        questionId,
        selectedOption: responses[questionId] ?? null,
      };
    },
  );

  // TODO: 백엔드 API 연동 시 responseEntries를 요청 payload로 전달하고,
  // 응답으로 받은 단일 resultType으로 /collaboration-type/results/[resultType] 경로에 이동합니다.

  return (
    <main>
      <h1>협업 유형 결과 확인 중</h1>
      <p>백엔드 API 응답을 기다리는 동안 보여줄 화면입니다.</p>
      <ul aria-label="저장된 협업 유형 검사 응답">
        {responseEntries.map(({ questionId, selectedOption }) => (
          <li key={questionId}>
            Q{questionId}: {selectedOption ?? "미응답"}
          </li>
        ))}
      </ul>
    </main>
  );
}
