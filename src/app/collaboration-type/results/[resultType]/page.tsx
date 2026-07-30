import Image from "next/image";
import { notFound } from "next/navigation";

import { COLLABORATION_RESULT_TYPES } from "../../_data/collaborationTest";

type CollaborationTypeResultPageProps = {
  params: Promise<{
    resultType: string;
  }>;
};

export default async function CollaborationTypeResultPage({
  params,
}: CollaborationTypeResultPageProps) {
  const { resultType } = await params;
  const result = COLLABORATION_RESULT_TYPES.find((item) => item.id === resultType);

  if (!result) {
    notFound();
  }

  return (
    <main>
      <h1>협업 유형 결과</h1>
      <h2>{result.name}</h2>
      <Image alt={`${result.name} 결과 이미지`} height={240} src={result.imageSrc} width={240} />
    </main>
  );
}
