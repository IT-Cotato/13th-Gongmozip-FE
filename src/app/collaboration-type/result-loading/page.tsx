import Link from "next/link";

import { COLLABORATION_RESULT_TYPES } from "../_data/collaborationTest";

export default function CollaborationTypeResultLoadingPage() {
  return (
    <main>
      <h1>협업 유형 결과 확인 중</h1>
      <p>백엔드 API 응답을 기다리는 동안 보여줄 화면입니다.</p>
      <ul>
        {COLLABORATION_RESULT_TYPES.map((resultType) => (
          <li key={resultType.id}>
            <Link href={`/collaboration-type/results/${resultType.id}`}>
              {resultType.name} 결과 보기
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
