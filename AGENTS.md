# AGENTS.md

## 프로젝트

Gongmozip FE는 Next.js App Router 기반 PWA 프론트엔드 프로젝트입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- pnpm
- Tailwind CSS
- Zustand
- TanStack Query
- PWA
- Git / GitHub
- Vercel

## 작업 규칙

- 패키지 매니저는 `pnpm`만 사용합니다.
- TypeScript strict mode 기준으로 작성합니다.
- 변경 범위는 요청받은 작업에 필요한 부분으로 제한합니다.
- 작업과 관련 없는 파일은 수정하지 않습니다.
- 기존 네이밍과 폴더 구조를 따릅니다.
- 반복되는 UI는 작고 재사용 가능한 컴포넌트로 분리합니다.

## 작업 절차 문서

- 반복 작업 절차는 루트의 `SKILLS.md`를 참고합니다.
- Figma 화면 구현, 채팅 기능 구현, API 연동, UI 검증, PR 준비 작업은 `SKILLS.md`의 해당 절차를 따릅니다.

## Git 브랜치 규칙

- `main`: 배포본 브랜치입니다.
- `develop`: 배포 전 기능을 통합하는 브랜치입니다.
- `feature/기능명`: 기능 개발 브랜치입니다. 예: `feature/login`, `feature/main`, `feature/auth-api`
- 기능 작업은 `develop`에서 `feature/기능명` 브랜치를 생성해 진행합니다.
- 기능 구현이 완료되면 `develop` 브랜치로 PR을 생성합니다.
- `develop`에서 통합 테스트 후 문제가 없으면 `main`으로 반영합니다.

## 명령어

- 설치: `pnpm install`
- 개발 서버: `pnpm dev`
- 린트: `pnpm lint`
- 빌드: `pnpm build`
- 포맷: `pnpm format`
- 포맷 확인: `pnpm format:check`

## 폴더 규칙

- App Router 라우트는 `src/app`에 둡니다.
- 전역 스타일은 `src/app/globals.css`에 둡니다.
- 공통 컴포넌트는 `src/components`에 둡니다.
- Zustand store는 `src/stores`에 둡니다.
- TanStack Query hook은 관련 기능 폴더 근처 또는 `src/queries`에 둡니다.
- 공통 유틸 함수는 `src/lib` 또는 `src/utils`에 둡니다.

## 스타일링

- Tailwind CSS를 사용합니다.
- className은 읽기 쉽도록 작성합니다.
- 일회성 스타일보다 프로젝트 전체 디자인 일관성을 우선합니다.

## 환경 변수

- 로컬 비밀값과 런타임 값은 `.env.local`을 사용합니다.
- 새 환경 변수를 추가할 때는 `.env.example`도 함께 업데이트합니다.

## 기능별 체크사항

기능 작업을 완료하기 전에 아래 항목을 확인합니다.

- 브랜치명이 `feature/기능명` 규칙을 따르는지 확인합니다.
- 작업 범위와 관련 없는 파일이 수정되지 않았는지 확인합니다.
- UI가 모바일과 데스크톱에서 깨지지 않는지 확인합니다.
- 로딩, 빈 상태, 에러 상태가 필요한 화면인지 확인합니다.
- API 연동이 있다면 요청/응답 타입과 실패 케이스를 확인합니다.
- 전역 상태가 필요할 때만 Zustand store를 사용합니다.
- 서버 상태 관리는 TanStack Query 사용을 우선합니다.
- 중복되는 UI나 로직이 있다면 재사용 가능한 컴포넌트 또는 함수로 분리합니다.
- 새 환경 변수가 있다면 `.env.example`에 추가합니다.
- PR 전 `pnpm lint`와 `pnpm build`를 실행해 확인합니다.
