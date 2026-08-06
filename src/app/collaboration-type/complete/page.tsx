import Link from "next/link";

export default function CollaborationTypeCompletePage() {
  return (
    <main>
      <h1>협업 유형 검사 완료</h1>
      <p>15문제 답변이 모두 끝난 뒤 보여줄 완료 화면입니다.</p>
      <Link href="/collaboration-type/result-loading">결과 확인하기</Link>
    </main>
  );
}
