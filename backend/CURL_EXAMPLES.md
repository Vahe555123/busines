# cURL — тесты API

Базовый URL: `http://localhost:3001` (запустите сервер: `npm run dev`).

---

## 1. Health и общее API

```bash
curl http://localhost:3001/health
```

```bash
curl http://localhost:3001/api
```

---

## 2. Регистрация

Подставьте свой email (на него придёт код подтверждения).

```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

**PowerShell:**
```powershell
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}'
```

---

## 3. Подтверждение почты

Код приходит на email. Подставьте `CODE_FROM_EMAIL` (6 цифр).

```bash
curl -X POST http://localhost:3001/api/auth/verify-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"code\":\"123456\"}"
```

**PowerShell:**
```powershell
curl -X POST http://localhost:3001/api/auth/verify-email -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"code\":\"123456\"}'
```

---

## 4. Повторная отправка кода

```bash
curl -X POST http://localhost:3001/api/auth/resend-code ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
```

**PowerShell:**
```powershell
curl -X POST http://localhost:3001/api/auth/resend-code -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\"}'
```

---

## 5. Вход (логин)

В ответе будет `token` — сохраните его для запроса ниже.

```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**PowerShell:**
```powershell
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

---

## 6. Текущий пользователь (по токену)

Подставьте вместо `YOUR_TOKEN` значение `token` из ответа логина.

```bash
curl http://localhost:3001/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PowerShell:**
```powershell
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

**Пример с переменной (PowerShell):**
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer $token"
```

---

## 7. Список пользователей

```bash
curl http://localhost:3001/api/users
```

---

## Порядок проверки по сценарию

1. `GET /health` — сервер жив.
2. `POST /api/auth/register` — регистрация (email + пароль + имя).
3. Проверить почту, взять 6-значный код.
4. `POST /api/auth/verify-email` — ввести email и код.
5. `POST /api/auth/login` — войти, скопировать `token`.
6. `GET /api/auth/me` — запрос с заголовком `Authorization: Bearer <token>`.
7. `GET /api/users` — список пользователей (без авторизации).

При ошибках ответ будет в формате `{ "error": "текст ошибки" }` с соответствующим HTTP-кодом.
