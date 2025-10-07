# Authentication API - Frontend Developer Guide

## 개요

이 문서는 프론트엔드 개발자가 인증 API를 쉽게 사용할 수 있도록 작성되었습니다.

### 주요 특징

- **JWT 기반 인증**: Access Token (1시간) + Refresh Token (1주일)
- **자동 쿠키 관리**: HttpOnly 쿠키로 토큰이 자동 전송됩니다
- **Refresh Token Rotation**: 토큰 재사용 공격 방지 (한 번 사용된 토큰은 무효화)
- **Token Versioning**: 전체 기기 로그아웃 지원
- **일관된 응답 형식**: 모든 API가 동일한 형식을 사용합니다

---

## 시작하기

### Base URL

```
http://localhost:8080
```

Production: `https://your-production-url.com`

### 응답 형식

모든 API는 동일한 응답 형식을 사용합니다:

**성공 응답:**

```json
{
  "success": true,
  "data": {
    /* 실제 데이터 */
  },
  "timestamp": 1759858261023
}
```

**에러 응답:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      /* 추가 정보 (선택) */
    }
  },
  "timestamp": 1759858261023
}
```

---

## 인증 플로우

### 1. 회원가입 → 로그인

```
1. POST /users (회원가입)
2. POST /auth/login (로그인)
   → 브라우저에 Authentication, refreshToken 쿠키 저장됨
3. 이제 인증이 필요한 API 호출 가능
```

### 2. 인증된 요청

```
GET /users
→ 브라우저가 자동으로 Authentication 쿠키 전송
→ 서버에서 자동 검증
```

### 3. 토큰 갱신 (Access Token 만료 시)

```
POST /auth/refresh
→ 브라우저가 자동으로 refreshToken 쿠키 전송
→ 새로운 Access Token + Refresh Token 발급
→ 자동으로 쿠키 갱신
```

**중요:** Refresh Token Rotation이 적용되어 있습니다.

- 한 번 사용된 refresh token은 즉시 무효화됩니다
- 새로운 refresh token이 자동으로 발급됩니다
- 동일한 토큰을 재사용하면 401 에러가 발생합니다

### 4. 로그아웃

```
POST /auth/revoke
→ 모든 Refresh Token 무효화
→ 모든 기기에서 로그아웃
```

---

## API 엔드포인트

### 1. 회원가입

**`POST /users`**

새로운 사용자를 등록합니다.

**Request:**

```typescript
{
  email: string;      // 이메일 형식
  password: string;   // 최소 8자, 대소문자, 숫자, 특수문자 포함
  name?: string;      // 선택 사항
  role: "USER" | "ADMIN";  // 기본값: USER
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "홍길동",
    "role": "USER"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "name": "홍길동",
    "role": "USER",
    "isEmailVerified": false,
    "tokenVersion": 0,
    "createdAt": "2025-10-07T16:04:22.884Z",
    "updatedAt": "2025-10-07T16:04:22.884Z"
  },
  "timestamp": 1759853062894
}
```

**Errors:**

- `409 EMAIL_ALREADY_EXISTS`: 이메일이 이미 존재합니다
- `400 INVALID_PARAMETER`: 요청 데이터가 유효하지 않습니다

---

### 2. 로그인

**`POST /auth/login`**

사용자 로그인 및 JWT 토큰 발급.

**Request:**

```typescript
{
  email: string;
  password: string;
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Login successful"
  },
  "timestamp": 1759853086581
}
```

**Set-Cookie 헤더:**

- `Authentication`: Access Token (HttpOnly, 1시간)
- `refreshToken`: Refresh Token (HttpOnly, 1주일)

**Errors:**

- `401 INVALID_CREDENTIALS`: 이메일 또는 비밀번호가 잘못되었습니다

**프론트엔드 구현:**

```typescript
// fetch 예시
const response = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // 🔥 쿠키를 자동으로 저장하려면 필수
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
```

```typescript
// axios 예시
import axios from 'axios';

const { data } = await axios.post(
  'http://localhost:8080/auth/login',
  { email, password },
  { withCredentials: true } // 🔥 쿠키를 자동으로 저장하려면 필수
);
```

---

### 3. 사용자 정보 조회

**`GET /users`**

인증된 사용자의 정보를 조회합니다.

**Authentication:** Required (쿠키 자동 전송)

**Example:**

```bash
curl -X GET http://localhost:8080/users \
  -b cookies.txt
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "name": "홍길동",
    "role": "USER",
    "isEmailVerified": false,
    "tokenVersion": 0,
    "createdAt": "2025-10-07T16:04:22.884Z",
    "updatedAt": "2025-10-07T16:04:22.884Z"
  },
  "timestamp": 1759853110493
}
```

**Errors:**

- `401 Unauthorized`: 인증 정보가 없거나 유효하지 않습니다

**프론트엔드 구현:**

```typescript
// fetch 예시
const response = await fetch('http://localhost:8080/users', {
  credentials: 'include', // 🔥 쿠키를 자동으로 전송하려면 필수
});
```

```typescript
// axios 예시 - 전역 설정
axios.defaults.withCredentials = true;

// 이제 모든 요청에서 쿠키가 자동 전송됨
const { data } = await axios.get('http://localhost:8080/users');
```

---

### 4. 토큰 갱신

**`POST /auth/refresh`**

Access Token이 만료되었을 때 Refresh Token으로 새로운 토큰을 발급받습니다.

**Authentication:** Refresh Token (쿠키 자동 전송)

**Example:**

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Token refreshed"
  },
  "timestamp": 1759853125649
}
```

**Set-Cookie 헤더:**

- `Authentication`: 새로운 Access Token (1시간)
- `refreshToken`: 새로운 Refresh Token (1주일) ← 🔥 Rotation 적용

**Errors:**

- `401 INVALID_TOKEN`: Refresh Token이 DB에 없습니다 (이미 사용되었거나 삭제됨)
- `401 TOKEN_EXPIRED`: Refresh Token이 만료되었습니다
- `401 TOKEN_REVOKED`: Token이 무효화되었습니다 (tokenVersion 불일치)

**프론트엔드 구현 - Axios Interceptor:**

```typescript
import axios from 'axios';

// 응답 인터셉터로 401 에러 자동 처리
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청이면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 토큰 갱신
        await axios.post(
          'http://localhost:8080/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        // 원래 요청 재시도
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh도 실패하면 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**중요한 점:**

- Refresh Token Rotation이 적용되어 있습니다
- `/auth/refresh` 호출 시 기존 refresh token은 무효화되고 새로운 토큰이 발급됩니다
- 동일한 refresh token을 재사용하면 `INVALID_TOKEN` 에러가 발생합니다
- 이는 토큰 탈취 공격을 방지하기 위한 보안 기능입니다

---

### 5. 전체 로그아웃

**`POST /auth/revoke`**

모든 기기에서 로그아웃합니다. (모든 Refresh Token 무효화)

**Authentication:** Required (쿠키 자동 전송)

**Example:**

```bash
curl -X POST http://localhost:8080/auth/revoke \
  -b cookies.txt
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "All refresh tokens revoked"
  },
  "timestamp": 1759853140540
}
```

**동작 방식:**

1. User의 `tokenVersion`이 1 증가
2. DB의 모든 Refresh Token 삭제
3. 기존 Access Token은 만료 시간(최대 1시간)까지는 유효

**사용 사례:**

- "모든 기기에서 로그아웃" 기능
- 비밀번호 변경 시
- 의심스러운 접근 감지 시

**프론트엔드 구현:**

```typescript
const logout = async () => {
  try {
    await axios.post(
      'http://localhost:8080/auth/revoke',
      {},
      {
        withCredentials: true,
      }
    );

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

---

## 에러 코드

프론트엔드에서 처리해야 하는 주요 에러 코드입니다.

| 에러 코드              | HTTP Status | 설명                        | 프론트엔드 처리                              |
| ---------------------- | ----------- | --------------------------- | -------------------------------------------- |
| `EMAIL_ALREADY_EXISTS` | 409         | 이메일이 이미 존재합니다    | "이미 사용 중인 이메일입니다" 표시           |
| `INVALID_CREDENTIALS`  | 401         | 이메일/비밀번호가 잘못됨    | "이메일 또는 비밀번호가 잘못되었습니다" 표시 |
| `INVALID_TOKEN`        | 401         | 토큰이 유효하지 않음        | 로그인 페이지로 리다이렉트                   |
| `TOKEN_EXPIRED`        | 401         | 토큰이 만료됨               | `/auth/refresh` 자동 호출                    |
| `TOKEN_REVOKED`        | 401         | 토큰이 무효화됨             | 로그인 페이지로 리다이렉트                   |
| `INVALID_PARAMETER`    | 400         | 요청 데이터가 유효하지 않음 | 입력 폼 검증 메시지 표시                     |

**에러 처리 예시:**

```typescript
try {
  const response = await axios.post('/auth/login', { email, password });
  // 성공 처리
} catch (error) {
  if (axios.isAxiosError(error)) {
    const errorCode = error.response?.data?.error?.code;

    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        alert('이메일 또는 비밀번호가 잘못되었습니다');
        break;
      case 'EMAIL_ALREADY_EXISTS':
        alert('이미 사용 중인 이메일입니다');
        break;
      default:
        alert('오류가 발생했습니다. 다시 시도해주세요');
    }
  }
}
```

---

## 프론트엔드 구현 가이드

### 1. Axios 전역 설정

모든 요청에서 쿠키를 자동으로 전송하도록 설정:

```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 🔥 모든 요청에 쿠키 포함
});

export default api;
```

### 2. 인증 상태 관리 (React + Context API)

```typescript
// AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import api from './api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/users');
        setUser(data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });

    // 로그인 후 사용자 정보 로드
    const userResponse = await api.get('/users');
    setUser(userResponse.data.data);
  };

  const logout = async () => {
    await api.post('/auth/revoke');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Axios Interceptor로 자동 토큰 갱신

```typescript
// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// 401 에러 발생 시 자동으로 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 갱신
        await api.post('/auth/refresh');

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh 실패 시 로그인 페이지로
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 4. Protected Route (React Router)

```typescript
// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};
```

---

## 보안 고려사항

### ✅ 자동으로 처리되는 것

1. **HttpOnly Cookie**: JavaScript로 토큰에 접근할 수 없습니다 (XSS 방지)
2. **Secure Cookie**: Production에서는 HTTPS로만 전송됩니다
3. **Token Rotation**: Refresh token이 자동으로 교체됩니다
4. **Token Versioning**: 모든 기기에서 로그아웃 가능

### ⚠️ 프론트엔드에서 주의할 점

1. **CORS 설정 확인**

   - `credentials: 'include'` 또는 `withCredentials: true` 필수
   - 백엔드에서 `Access-Control-Allow-Credentials: true` 설정 필요

2. **HTTPS 사용** (Production)

   - HTTP에서는 쿠키가 전송되지 않을 수 있습니다
   - 브라우저가 Secure 쿠키를 차단할 수 있습니다

3. **401 에러 처리**

   - Access Token 만료 시 자동으로 `/auth/refresh` 호출
   - Refresh Token도 만료되면 로그인 페이지로 리다이렉트

4. **민감한 정보 저장 금지**

   - 토큰을 LocalStorage나 SessionStorage에 저장하지 마세요
   - 모든 토큰은 HttpOnly 쿠키로 자동 관리됩니다

5. **로그아웃 시 페이지 리다이렉트**
   - `/auth/revoke` 호출 후 반드시 로그인 페이지로 이동
   - 메모리에 남아있는 사용자 상태도 초기화

---

## 테스트 시나리오

### 시나리오 1: 회원가입 → 로그인 → 정보 조회

```bash
# 1. 회원가입
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"홍길동","role":"USER"}'

# 2. 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# 3. 사용자 정보 조회
curl -X GET http://localhost:8080/users -b cookies.txt
```

### 시나리오 2: 토큰 갱신

```bash
# 1. 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# 2. 토큰 갱신 (첫 번째)
curl -X POST http://localhost:8080/auth/refresh -b cookies.txt -c cookies.txt

# 3. 토큰 갱신 (두 번째) - 새로운 토큰으로 갱신됨
curl -X POST http://localhost:8080/auth/refresh -b cookies.txt -c cookies.txt
```

### 시나리오 3: Refresh Token Rotation 검증

```bash
# 1. 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# 2. 첫 번째 refresh token 백업
cp cookies.txt cookies_backup.txt

# 3. 토큰 갱신 (성공)
curl -X POST http://localhost:8080/auth/refresh -b cookies.txt -c cookies.txt

# 4. 백업한 토큰으로 재시도 (실패 - 401 Unauthorized)
curl -X POST http://localhost:8080/auth/refresh -b cookies_backup.txt
# → {"success":false,"error":{"code":"INVALID_TOKEN"}}
```

### 시나리오 4: 전체 로그아웃

```bash
# 1. 로그인
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# 2. 전체 로그아웃
curl -X POST http://localhost:8080/auth/revoke -b cookies.txt

# 3. 사용자 정보 조회 (실패 - 401 TOKEN_REVOKED)
curl -X GET http://localhost:8080/users -b cookies.txt
# → {"success":false,"error":{"code":"TOKEN_REVOKED"}}
```

---

## 자주 묻는 질문 (FAQ)

### Q1: 토큰을 어디에 저장하나요?

**A:** 토큰은 HttpOnly 쿠키에 자동으로 저장됩니다. 프론트엔드에서 직접 저장할 필요가 없습니다.

### Q2: Access Token이 만료되면 어떻게 하나요?

**A:** 401 에러가 발생하면 자동으로 `/auth/refresh`를 호출하여 새 토큰을 받아옵니다. Axios Interceptor를 사용하면 자동화할 수 있습니다.

### Q3: Refresh Token도 만료되면 어떻게 하나요?

**A:** 사용자를 로그인 페이지로 리다이렉트합니다.

### Q4: CORS 에러가 발생합니다.

**A:**

1. 요청에 `credentials: 'include'` (fetch) 또는 `withCredentials: true` (axios) 설정
2. 백엔드에서 `Access-Control-Allow-Credentials: true` 설정
3. 백엔드에서 `Access-Control-Allow-Origin`에 와일드카드(`*`) 대신 특정 도메인 지정

### Q5: LocalStorage에 토큰을 저장하면 안 되나요?

**A:** 안 됩니다. LocalStorage는 JavaScript로 접근 가능하여 XSS 공격에 취약합니다. HttpOnly 쿠키를 사용하세요.

### Q6: 같은 refresh token을 여러 번 사용하면 어떻게 되나요?

**A:** Refresh Token Rotation이 적용되어 있어서, 한 번 사용된 토큰을 재사용하면 `INVALID_TOKEN` 에러가 발생합니다.

### Q7: 여러 탭에서 로그인하면 어떻게 되나요?

**A:** 쿠키는 모든 탭에서 공유되므로, 한 탭에서 로그인하면 다른 탭에서도 인증 상태가 유지됩니다.

### Q8: 로그아웃하면 모든 탭에서 로그아웃되나요?

**A:** `/auth/revoke`를 호출하면 모든 기기의 refresh token이 무효화됩니다. 하지만 access token은 만료 시간(최대 1시간)까지는 유효할 수 있습니다.

---

## 요약

### 필수 구현 사항

1. **모든 요청에 `withCredentials: true` 설정**
2. **401 에러 발생 시 `/auth/refresh` 자동 호출**
3. **Refresh 실패 시 로그인 페이지로 리다이렉트**
4. **로그아웃 시 `/auth/revoke` 호출 후 상태 초기화**

### 핵심 포인트

- ✅ 토큰은 HttpOnly 쿠키로 자동 관리
- ✅ Refresh Token Rotation으로 보안 강화
- ✅ Token Versioning으로 모든 기기 로그아웃 지원
- ✅ 일관된 API 응답 형식
- ✅ 명확한 에러 코드

---

**문의사항이나 개선 제안이 있으시면 백엔드 팀에 문의해주세요.**
