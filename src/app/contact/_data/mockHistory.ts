export type ContactHistoryStatus = "answered" | "processing";

export type ContactHistoryAnswer = {
  date: string;
  time: string;
  body: string;
};

export type ContactHistoryItem = {
  id: string;
  status: ContactHistoryStatus;
  title: string;
  content: string;
  email: string;
  date: string;
  time: string;
  answer?: ContactHistoryAnswer;
};

// TODO(backend): 문의 내역 조회 API 연동 전까지 사용하는 임시 목데이터
export const MOCK_CONTACT_HISTORY: ContactHistoryItem[] = [
  {
    id: "1",
    status: "answered",
    title: "문의제목은이십자까지입력가능합니다. 문의",
    content:
      "문의내용미리보기는 두줄까지로생각하고있습니다. 문의내용미리보기는 두줄까지로생각하고있습니다. 문의내용미리보기는 두줄까지로생각하고있습니다. 문의내용미리보기는 두줄까지로생각하고있습니다.",
    email: "example@domain.com",
    date: "2026.06.26",
    time: "17:08:01",
    answer: {
      date: "2026.06.26",
      time: "17:08:01",
      body: "고객님의 문의에 대한 답변입니다.\n어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고 어쩌고저쩌고\n해결이 되셨으면 좋겠습니다^^",
    },
  },
  {
    id: "2",
    status: "processing",
    title: "팀 매칭 관련 문의드립니다.",
    content: "팀 매칭이 이상합니다.",
    email: "example@domain.com",
    date: "2026.06.26",
    time: "17:08:01",
  },
  {
    id: "3",
    status: "answered",
    title: "결제 오류 문의합니다.",
    content:
      "결제가 진행되지 않아 확인 부탁드립니다.결제가 진행되지 않아 확인 부탁드립니다.결제가 진행되지 않아 확인 부탁드립니다.결제가 진행되지 않아 확인 부탁드립니다.",
    email: "example@domain.com",
    date: "2026.06.27",
    time: "09:15:42",
    answer: {
      date: "2026.06.27",
      time: "11:20:10",
      body: "결제 오류 확인해보니 카드사 승인 지연 문제였습니다.\n현재는 정상적으로 결제가 진행되며, 불편을 드려 죄송합니다.",
    },
  },
  {
    id: "4",
    status: "processing",
    title: "앱 사용 중 버그 발견",
    content: "앱 실행 시 간헐적으로 화면이 멈춥니다.",
    email: "example@domain.com",
    date: "2026.06.27",
    time: "10:33:58",
  },
];

export function getMockContactHistoryById(id: string) {
  return MOCK_CONTACT_HISTORY.find((item) => item.id === id);
}
