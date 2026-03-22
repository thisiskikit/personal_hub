# Personal Hub (OpsRoom)

실사용 전환을 목표로 구성한 `React + TypeScript + Vite` 기반 운영 대시보드 UI입니다.

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4 (`@tailwindcss/vite`)
- React Router
- TanStack Query
- Vitest + Testing Library

## Run

```bash
npm install
npm run dev
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment

`.env.example`:

```env
VITE_DATA_PROVIDER=mock
```

- `mock`: 내장 Mock provider 사용 (기본값)
- `api`: 현재 미구현, 자동으로 `mock` fallback

## Architecture

```text
src/
  app/         # 앱 엔트리, 라우터, provider
  pages/       # 라우트 단위 화면
  widgets/     # 레이아웃/패널 조합
  features/    # 기능 단위 UI/로직
  entities/    # 도메인 타입
  shared/      # 공통 UI, 유틸, API 추상화, 스타일 토큰
  test/        # 테스트 setup
```

## Route + Query Contract

- routes: `/dashboard`, `/finance`, `/calendar`, `/notes`, `/automation`
- query:
  - `item=<id>`
  - `filter=<all|task|finance|event|memo>`
  - `tab=<details|ai|chat>`
  - `density=<comfortable|compact>`
