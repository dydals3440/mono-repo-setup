import type { UserConfig } from "@commitlint/types"

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    // Header
    "header-max-length": [2, "always", 100],
    "subject-empty": [2, "never"],
    "subject-case": [0], // 한/영 혼용 허용
    "subject-full-stop": [2, "never", "."],

    // Type
    "type-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 변경
        "style", // 코드 포맷팅, 세미콜론 누락 등
        "refactor", // 코드 리팩토링
        "perf", // 성능 개선
        "test", // 테스트 추가/수정
        "build", // 빌드 시스템, 외부 종속성 변경
        "ci", // CI 설정 파일 및 스크립트 변경
        "chore", // 기타 변경사항
        "revert", // 이전 커밋 되돌리기
      ],
    ],

    // Scope (optional)
    "scope-case": [2, "always", "lower-case"],

    // Body
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],

    // Footer
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],
  },

  prompt: {
    messages: {
      skip: "건너뛰기",
      max: "최대 %d자",
      min: "최소 %d자",
      emptyWarning: "필수 입력",
      upperLimitWarning: "입력 길이 초과",
      lowerLimitWarning: "입력 길이 부족",
    },
    questions: {
      type: {
        description: "커밋 타입을 선택하세요",
        enum: {
          feat: {
            description: "새로운 기능 추가",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "버그 수정",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "문서 변경",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description: "코드 포맷팅, 세미콜론 누락 등",
            title: "Styles",
            emoji: "💎",
          },
          refactor: {
            description: "코드 리팩토링",
            title: "Code Refactoring",
            emoji: "📦",
          },
          perf: {
            description: "성능 개선",
            title: "Performance Improvements",
            emoji: "🚀",
          },
          test: {
            description: "테스트 추가/수정",
            title: "Tests",
            emoji: "🚨",
          },
          build: {
            description: "빌드 시스템, 외부 종속성 변경",
            title: "Builds",
            emoji: "🛠",
          },
          ci: {
            description: "CI 설정 파일 및 스크립트 변경",
            title: "Continuous Integrations",
            emoji: "⚙️",
          },
          chore: {
            description: "기타 변경사항",
            title: "Chores",
            emoji: "♻️",
          },
          revert: {
            description: "이전 커밋 되돌리기",
            title: "Reverts",
            emoji: "🗑",
          },
        },
      },
      scope: {
        description: "변경 범위 (컴포넌트, 파일명 등)",
      },
      subject: {
        description: "변경 사항을 간단히 요약하세요",
      },
      body: {
        description: "상세한 변경 내용 (선택사항)",
      },
      isBreaking: {
        description: "Breaking Change가 있나요?",
      },
      breakingBody: {
        description: "Breaking Change는 본문 설명이 필요합니다",
      },
      breaking: {
        description: "Breaking Change 내용을 설명하세요",
      },
      isIssueAffected: {
        description: "관련된 이슈가 있나요?",
      },
      issuesBody: {
        description: "이슈를 닫는 경우 본문 설명이 필요합니다",
      },
      issues: {
        description: '이슈 번호 (예: "fix #123", "re #123")',
      },
    },
  },
}

export default config
