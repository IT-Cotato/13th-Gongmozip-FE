import { notFound } from "next/navigation";

import {
  COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE,
  COLLABORATION_RESULT_TYPES,
  getCollaborationResultByRouteParam,
} from "../../_data/collaborationTest";
import CollaborationTypeResultPageContent from "./CollaborationTypeResultPageContent";

type CollaborationTypeResultPageProps = {
  params: Promise<{
    resultType: string;
  }>;
};

export function generateStaticParams() {
  return [
    ...COLLABORATION_RESULT_TYPES.map((result) => ({
      resultType: result.characterType,
    })),
    ...Object.keys(COLLABORATION_CHARACTER_TYPE_TO_RESULT_TYPE).map((characterType) => ({
      resultType: characterType,
    })),
    ...COLLABORATION_RESULT_TYPES.map((result) => ({
      resultType: result.id,
    })),
  ];
}

export default async function CollaborationTypeResultPage({
  params,
}: CollaborationTypeResultPageProps) {
  const { resultType } = await params;
  const result = getCollaborationResultByRouteParam(resultType);

  if (!result) {
    notFound();
  }

  return <CollaborationTypeResultPageContent result={result} />;
}
