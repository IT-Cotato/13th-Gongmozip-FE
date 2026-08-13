# 채팅방 API 정리

백엔드 API export를 기준으로 채팅방과 채팅방 안에서 진행되는 팀장 선출, 공모전 선택, 진행 상황, 팀원 리뷰 API를 정리한 문서입니다.

구현 상태는 현재 프론트엔드 코드 기준입니다. `완료`는 API 호출 함수와 실제 화면 연결이 모두 확인된 항목이고, `부분 완료`는 호출 함수/훅은 있으나 사용 화면이 없거나 일부 동작만 연결된 항목입니다.

## 공통

- REST API는 `src/lib/http.ts`의 `apiFetch`를 사용합니다.
- 서버 공통 응답 포맷은 `{ status, code, message, data }`이며, `apiFetch`는 `data`를 반환하는 구조입니다.
- 채팅방 식별자는 현재 FE 라우트에서 `roomId`로 다루지만, API path에서는 `teamId`를 사용합니다. 현재 구현은 `roomId` 값을 `teamId`로 전달합니다.
- WebSocket은 STOMP 클라이언트(`@stomp/stompjs`)를 사용합니다.
- WebSocket base URL은 `NEXT_PUBLIC_WS_BASE_URL`이 있으면 우선 사용하고, 없으면 `NEXT_PUBLIC_API_BASE_URL` 기반으로 `ws/wss` URL을 만듭니다.
- 메시지 조회는 먼저 REST로 최근/이전 메시지를 채운 뒤, WebSocket 구독으로 새 메시지를 반영합니다.

## 구현 상태 요약

| 구분 | 이름 | Method | Path / Destination | 서버 문서 상태 | FE 구현 상태 |
| --- | --- | --- | --- | --- | --- |
| 채팅 | 채팅방 목록 조회 | GET | `/api/teams` | 완료 | 완료 |
| 채팅 | 대화상대 조회 | GET | `/api/teams/{teamId}/members` | 완료 | 완료 |
| 채팅 | 채팅방 나가기 | DELETE | `/api/teams/{teamId}/members/me` | 완료 | 완료 |
| 채팅 | 챗봇 추가/삭제 | PATCH | `/api/teams/{teamId}/chatbot` | 완료 | 완료 |
| 채팅 | 메시지 목록 조회 | GET | `/api/teams/{teamId}/messages` | 완료 | 완료 |
| 채팅 | 채팅방 읽음 처리 | PATCH | `/api/teams/{teamId}/read` | 완료 | 완료 |
| 채팅 | 사용자 신고 | POST | `/api/reports` | 완료 | 완료 |
| 채팅 | 메시지 전송 | WS SEND | `/app/teams/{teamId}/messages` | 완료 | 완료 |
| 채팅 | 팀 채팅방 실시간 구독 | WS SUBSCRIBE | `/topic/teams/{teamId}` | 완료 | 완료 |
| 채팅 | 개인 에러 큐 구독 | WS SUBSCRIBE | `/user/queue/errors` | 완료 | 완료 |
| 팀장선출 | 팀장 여부 투표 | PATCH | `/api/teams/{teamId}/leader-candidacy` | 완료 | 완료 |
| 팀장선출 | 팀장 투표 | POST | `/api/teams/{teamId}/leader-votes` | 완료 | 완료 |
| 팀장선출 | 동률 시 AI 추천 수락 | POST | `/api/teams/{teamId}/leader-votes/ai-recommendation/accept` | 완료 | 완료 |
| 팀장선출 | 동률 시 재투표 요청 | POST | `/api/teams/{teamId}/leader-votes/revote` | 완료 | 완료 |
| 공모전 | 후보 공모전 추가 | POST | `/api/teams/{teamId}/contest-candidates` | 완료 | 완료 |
| 공모전 | 후보 공모전 리스트 조회 | GET | `/api/teams/{teamId}/contest-candidates` | 완료 | 완료 |
| 공모전 | 후보 공모전 삭제 | DELETE | `/api/teams/{teamId}/contest-candidates/{contestCandidateId}` | 완료 | 완료 |
| 공모전 | 공모전 투표 | POST | `/api/teams/{teamId}/contest-candidates/votes` | 완료 | 완료 |
| 공모전 | 공모전 투표 진행 상황 조회 | GET | `/api/teams/{teamId}/contest-candidates/votes` | 완료 | 완료 |
| 공모전 | 공모전 채팅방 공유 | POST | `/api/teams/{teamId}/contest-shares` | 완료 | 부분 완료 |
| 진행상황 | 중간점검 진행률 응답 | PATCH | `/api/teams/{teamId}/progress` | 완료 | 완료 |
| 진행상황 | 공모전 제출 여부 확인 | PATCH | `/api/teams/{teamId}/submission` | 완료 | 완료 |
| 팀원리뷰 | 리뷰 대상 팀원 목록 조회 | GET | `/api/teams/{teamId}/reviews/targets` | 완료 | 완료 |
| 팀원리뷰 | 팀원 리뷰 작성 | POST | `/api/teams/{teamId}/reviews` | 완료 | 완료 |

## 채팅 API

### CHAT-01 채팅방 목록 조회

- Method: `GET`
- Path: `/api/teams`
- 설명: 내가 활성 상태로 속한 팀, 즉 채팅방 목록을 조회합니다.
- 주요 응답: `teamId`, `teamName/title`, `memberCount`, `lastMessage`, `lastMessageAt`, `unreadCount`, `profileImageUrls`
- FE 구현: 완료
- 코드: `fetchChatTeams`, `useChatTeamsQuery`, `ChatListShell`

### CHAT-02 대화상대 조회

- Method: `GET`
- Path: `/api/teams/{teamId}/members`
- 설명: 팀 참여자 목록과 현재 팀 상태에 필요한 마감 시각을 조회합니다.
- 주요 응답: `members`, `chatbotEnabled`, `leaderSelectionDeadlineAt`, `myTeamMemberId`
- FE 구현: 완료
- 코드: `fetchChatTeamMembers`, `useChatTeamMembersQuery`, 채팅방/메뉴 화면

### CHAT-03 채팅방 나가기

- Method: `DELETE`
- Path: `/api/teams/{teamId}/members/me`
- 설명: 현재 사용자가 채팅방을 나갑니다. 서버에서 중도 이탈 협업거리 감점과 진행 중인 투표/완료 조건 재계산을 처리합니다.
- FE 구현: 완료
- 코드: `leaveChatTeam`, `useLeaveChatTeamMutation`, 채팅방 메뉴 나가기 버튼

### CHAT-04 챗봇 추가/삭제

- Method: `PATCH`
- Path: `/api/teams/{teamId}/chatbot`
- Request:

```json
{
  "enabled": true
}
```

- 설명: `Team.chatbotEnabled`를 토글합니다.
- FE 구현: 완료
- 코드: `updateChatbotStatus`, `useUpdateChatbotStatusMutation`, 채팅방 메뉴 챗봇 토글

### CHAT-05 메시지 목록 조회

- Method: `GET`
- Path: `/api/teams/{teamId}/messages?size=50&cursor={cursor}`
- 설명: cursor가 없으면 최근 50건, cursor가 있으면 이전 50건을 조회합니다.
- 주요 응답: `messages`, `nextCursor` 또는 `previousCursor`, `hasNext` 또는 `hasPrevious`
- FE 구현: 완료
- 코드: `fetchChatTeamMessages`, `useChatTeamMessagesQuery`

### CHAT-06 채팅방 읽음 처리

- Method: `PATCH`
- Path: `/api/teams/{teamId}/read`
- 설명: 호출자의 `lastReadAt`을 갱신하고 서버가 읽음 갱신 이벤트를 브로드캐스트합니다.
- FE 구현: 완료
- 코드: `markChatTeamAsRead`, `useMarkChatTeamAsReadMutation`, 채팅방 진입 후 메시지 조회 성공 시 호출

### CHAT-07 사용자 신고

- Method: `POST`
- Path: `/api/reports`
- Request:

```json
{
  "reportedMemberId": 1,
  "teamId": 1,
  "reasonCode": "OTHER",
  "customReasonText": "신고 사유"
}
```

- 설명: 사용자를 신고합니다. 서버는 `reasonCode` enum 검증, 기타 사유 필수 여부, 본인 신고 금지를 처리합니다.
- FE 구현: 완료
- 코드: `reportUser`, `useReportUserMutation`, 채팅방 메뉴 신고 다이얼로그

## WebSocket

### 연결

- STOMP broker URL: FE 기준 `getWebSocketUrl("/ws")`
- 인증: access token이 있으면 STOMP connect header에 `Authorization: Bearer {token}` 전달
- FE 구현: 완료
- 코드: `useChatRealtime`

### CHAT-08 메시지 전송

- Direction: client -> server
- Destination: `/app/teams/{teamId}/messages`
- Body:

```json
{
  "content": "메시지 내용"
}
```

- 설명: 서버가 메시지를 저장하고 `/topic/teams/{teamId}`로 브로드캐스트합니다. 인사 단계 진행, `@챗봇` 응답 처리는 서버에서 함께 처리합니다.
- FE 구현: 완료
- 코드: `useChatRealtime.sendMessage`, `ChatInputBar`

### CHAT-09 팀 채팅방 실시간 구독

- Direction: server -> client
- Destination: `/topic/teams/{teamId}`
- 설명: 팀원/챗봇/시스템 메시지와 읽음 갱신 이벤트가 들어옵니다.
- FE 구현: 완료
- 코드: `useChatRealtime`에서 구독 후 메시지 이벤트를 TanStack Query cache에 append

### CHAT-10 개인 에러 큐 구독

- Direction: server -> client
- Destination: `/user/queue/errors`
- 설명: 메시지 처리 중 발생한 에러를 본인에게만 전달합니다.
- FE 구현: 완료
- 코드: `useChatRealtime`에서 구독 후 `errorMessage` 상태로 노출

## 메시지 렌더링 기준

메시지는 `messageType`, `senderType`, `metadata`를 기준으로 분기합니다.

| messageType / 조건 | FE 처리 상태 |
| --- | --- |
| `TALK`, `TEXT`, messageType 없음 | 완료 |
| `SYSTEM` 또는 `senderType=SYSTEM` | 완료 |
| `BOT` 또는 `senderType=CHATBOT` | 완료 |
| `LEADER_NOMINATION_CARD` | 완료 |
| `LEADER_VOTE_CARD` | 완료 |
| `LEADER_RESULT_CARD` | 완료 |
| 기타 `LEADER_` prefix | 완료, fallback 카드 |
| `CONTEST_RECOMMEND_CARD` | 완료 |
| `CONTEST_SHARE_CARD` | 완료 |
| `CONTEST_VOTE_REMINDER_CARD` | 완료 |
| `CONTEST_VOTE_CARD` | 완료 |
| `CONTEST_RESULT_CARD` | 완료 |
| 기타 `CONTEST_` prefix | 완료, fallback 카드 |

## 팀장 선출 API

### LEADER-01 팀장 여부 투표

- Method: `PATCH`
- Path: `/api/teams/{teamId}/leader-candidacy`
- Request:

```json
{
  "wants": true
}
```

- 설명: `OPEN_NOMINATION` 케이스에서 팀장 희망 여부를 응답합니다.
- FE 구현: 완료
- 코드: `updateLeaderCandidacy`, `useUpdateLeaderCandidacyMutation`, `LEADER_NOMINATION_CARD`

### LEADER-02 팀장 투표

- Method: `POST`
- Path: `/api/teams/{teamId}/leader-votes`
- Request:

```json
{
  "candidateTeamMemberId": 1
}
```

- 설명: 후보 중 팀장을 투표합니다. 전원이 투표하면 서버가 단독 1위 확정 또는 동률 재투표 카드를 발행합니다.
- FE 구현: 완료
- 코드: `voteLeader`, `useVoteLeaderMutation`, `LEADER_VOTE_CARD`

### LEADER-03 동률 시 AI 추천 수락

- Method: `POST`
- Path: `/api/teams/{teamId}/leader-votes/ai-recommendation/accept`
- Request body: 없음
- 설명: 동률 상황에서 서버가 카드에 담은 AI 추천 후보를 팀장으로 확정합니다.
- FE 구현: 완료
- 코드: `acceptLeaderAiRecommendation`, `useAcceptLeaderAiRecommendationMutation`

### LEADER-04 동률 시 재투표 요청

- Method: `POST`
- Path: `/api/teams/{teamId}/leader-votes/revote`
- Request body: 없음
- 설명: 상태 변경 없이 동률 후보 목록으로 재투표 시작 안내 카드를 재발행합니다.
- FE 구현: 완료
- 코드: `requestLeaderRevote`, `useRequestLeaderRevoteMutation`

## 공모전 API

### CONTEST-01 후보 공모전 추가

- Method: `POST`
- Path: `/api/teams/{teamId}/contest-candidates`
- Request:

```json
{
  "contestId": 1
}
```

- 설명: 팀이 공모전 선택 상태일 때 후보 공모전을 추가합니다.
- FE 구현: 완료
- 코드: `addContestCandidate`, `useAddContestCandidateMutation`, 공모전 추천/공유 카드의 추가 액션

### CONTEST-02 후보 공모전 리스트 조회

- Method: `GET`
- Path: `/api/teams/{teamId}/contest-candidates`
- 설명: 현재 등록된 후보 공모전 목록을 조회합니다.
- FE 구현: 완료
- 코드: `fetchContestCandidates`, `useContestCandidatesQuery`

### CONTEST-03 후보 공모전 삭제

- Method: `DELETE`
- Path: `/api/teams/{teamId}/contest-candidates/{contestCandidateId}`
- 설명: 후보 공모전을 삭제합니다.
- FE 구현: 완료
- 코드: `deleteContestCandidate`, `useDeleteContestCandidateMutation`

### CONTEST-04 공모전 투표

- Method: `POST`
- Path: `/api/teams/{teamId}/contest-candidates/votes`
- Request:

```json
{
  "contestCandidateIds": [1, 2]
}
```

- 설명: 후보 공모전에 투표합니다. 최대 2개까지 선택 가능합니다.
- FE 구현: 완료
- 코드: `voteContestCandidates`, `useVoteContestCandidatesMutation`

### CONTEST-05 공모전 투표 진행 상황 조회

- Method: `GET`
- Path: `/api/teams/{teamId}/contest-candidates/votes`
- 설명: 현재 라운드 참여 인원과 후보별 득표수를 조회합니다.
- FE 구현: 완료
- 코드: `fetchContestVoteStatus`, `useContestVoteStatusQuery`

### CONTEST-06 공모전 채팅방 공유

- Method: `POST`
- Path: `/api/teams/{teamId}/contest-shares`
- Request:

```json
{
  "contestId": 1
}
```

- 설명: 후보 등록과 별개로 `CONTEST_SHARE_CARD` 메시지만 발행합니다.
- FE 구현: 부분 완료
- 확인 내용: `shareContestToChat`, `useShareContestToChatMutation` 함수는 있으나, 공모전 상세의 공유 모달은 현재 mock 채팅방 목록과 로컬 완료 처리만 사용합니다.

## 진행 상황 API

### PROGRESS-01 중간점검 진행률 응답

- Method: `PATCH`
- Path: `/api/teams/{teamId}/progress`
- Request:

```json
{
  "progressPercent": 50
}
```

- 설명: 팀장 전용 중간점검 진행률 응답입니다. 최초 1회 보상은 서버가 멱등 처리합니다.
- FE 구현: 완료
- 코드: `updateTeamProgress`, `useUpdateTeamProgressMutation`

### PROGRESS-02 공모전 제출 여부 확인

- Method: `PATCH`
- Path: `/api/teams/{teamId}/submission`
- Request:

```json
{
  "completed": true
}
```

- 설명: 팀장 전용 제출 여부 확인입니다. `completed=true`면 제출 상태로 전이하고, `false`면 재알림을 예약합니다.
- FE 구현: 완료
- 코드: `updateTeamSubmission`, `useUpdateTeamSubmissionMutation`

## 팀원 리뷰 API

### REVIEW-01 리뷰 대상 팀원 목록 조회

- Method: `GET`
- Path: `/api/teams/{teamId}/reviews/targets`
- 설명: 나를 제외한 활성 팀원 목록과 이미 리뷰한 대상 여부를 조회합니다.
- FE 구현: 완료
- 코드: `fetchReviewTargets`, `useReviewTargetsQuery`, `MemberReviewFlow`

### REVIEW-02 팀원 리뷰 작성

- Method: `POST`
- Path: `/api/teams/{teamId}/reviews`
- Request:

```json
{
  "revieweeTeamMemberId": 1,
  "communicationScore": "AGREE",
  "participationScore": "NEUTRAL",
  "keywords": ["RESPONSIBLE"]
}
```

- 설명: 팀원 리뷰를 작성합니다. 서버는 리뷰 가능 상태, 본인 제외, 대상별 1회 제한, 전체 리뷰 완료 시 팀 완료 전이를 처리합니다.
- FE 구현: 완료
- 코드: `submitTeamReview`, `useSubmitTeamReviewMutation`, `MemberReviewFlow`

## 추가 확인 필요

- `CONTEST-06`은 API 함수/훅은 있지만 실제 공모전 공유 모달이 mock 기반이라 실사용 연결이 필요합니다.
- 기존 일부 채팅 UI 문구와 문서(`채팅방.md`, 일부 TSX 문자열)에 한글 인코딩 깨짐이 남아 있습니다. API 연결 여부와 별개로 화면 QA 전에 정리가 필요합니다.
- WebSocket broker endpoint는 FE에서 `/ws`로 연결합니다. 백엔드 문서의 HTML 상세에 별도 endpoint가 있다면 `/ws`가 최종 경로인지 확인이 필요합니다.
