# 프로젝트 모노레포

Turborepo 기반 NestJS API + Next.js 웹 애플리케이션 모노레포 프로젝트입니다.

## 프로젝트 구조

```
.
├── apps/
│   ├── api/          # NestJS API 서버
│   └── web/          # Next.js 웹 애플리케이션
├── packages/
│   ├── jest-config/      # 공유 Jest 설정
│   ├── types/           # 공유 TypeScript 타입
│   └── typescript-config/ # 공유 TypeScript 설정
└── docker-compose.yml   # Docker Compose 설정
```

## 초기 세팅 완료 항목

### 개발 도구

- **Biome**: ESLint와 Prettier를 대체하는 올인원 린터/포맷터
  - 세미콜론 제거 (`semicolons: "asNeeded"`)
  - 더블 쿼트 사용 (`quoteStyle: "double"`)
  - Trailing commas 자동 추가
  - 자동 import 정리

- **Commitlint**: 커밋 메시지 규칙 적용
  - Conventional Commits 형식 강제
  - 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
  - 한/영 혼용 커밋 메시지 허용

- **Simple Git Hooks**: Git 훅 관리
  - pre-commit: lint-staged 실행

- **Lint-staged**: 스테이징된 파일만 린트/포맷 실행

### 빌드 도구

- **Turborepo**: 모노레포 빌드 시스템
- **TypeScript**: 타입 체크
- **Jest**: 테스트 프레임워크 (NestJS, Next.js 각각 설정)

### Docker

- Docker Compose로 API와 Web 앱 동시 실행 가능
- 헬스체크 설정 완료
- 개발 환경 Hot Reload 지원

## 시작하기

### 의존성 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
# 전체 앱 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=api   # API 서버만
pnpm dev --filter=web   # Web 앱만
```

### Docker로 실행

```bash
docker-compose up
```

- API: http://localhost:8080
- Web: http://localhost:3000

### 빌드

```bash
# 전체 빌드
pnpm build

# 특정 앱만 빌드
pnpm build --filter=api
pnpm build --filter=web
```

### 테스트

```bash
# 전체 테스트
pnpm test

# 특정 앱만 테스트
pnpm test --filter=api
```

### 린트 & 포맷

```bash
# 전체 린트
pnpm lint

# 포맷팅
pnpm format
```

## 중요 유의사항

### 1. 커밋 메시지 규칙

모든 커밋은 Conventional Commits 형식을 따라야 합니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

예시:
```
feat(api): 상품 생성 API 추가

상품 이름과 가격을 받아 새로운 상품을 생성하는 API를 추가했습니다.
```

### 2. 코드 스타일

- **세미콜론 사용 안 함**: Biome 설정에 따라 세미콜론은 자동으로 제거됩니다
- **더블 쿼트 사용**: 문자열은 항상 더블 쿼트(`"`)를 사용합니다
- **Trailing commas**: 객체/배열 마지막 항목에 콤마를 추가합니다

### 3. Import 순서

Biome가 자동으로 import를 정리합니다:
1. 외부 라이브러리
2. 내부 패키지
3. 상대 경로

### 4. 공유 패키지 사용

공유 타입이나 설정을 사용할 때:

```typescript
// 타입 import
import type { Product } from "@repo/types"

// Jest 설정 사용
import { nestConfig } from "@repo/jest-config"
```

### 5. Git Hooks

커밋 전에 자동으로 실행됩니다:
- Biome 린트 & 포맷 체크
- 타입 체크
- 커밋 메시지 검증

### 6. 패키지 관리

- **pnpm만 사용**: workspace 기능을 위해 pnpm을 사용합니다
- npm이나 yarn 사용 시 `.npmrc`에 의해 차단됩니다

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm test` | 테스트 실행 |
| `pnpm lint` | 린트 실행 |
| `pnpm format` | 코드 포맷팅 |
| `pnpm check-types` | 타입 체크 |

## Turborepo 원격 캐싱 (선택사항)

팀과 빌드 캐시를 공유하려면:

```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

자세한 내용은 [Turborepo 문서](https://turborepo.com/docs/core-concepts/remote-caching)를 참고하세요.
