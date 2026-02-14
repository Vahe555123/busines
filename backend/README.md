# Backend — TypeScript + Node + Express + Mongoose

## Структура проекта

```
backend/
├── src/
│   ├── index.ts          # Точка входа, запуск сервера и подключение к БД
│   ├── app.ts            # Создание Express-приложения, middleware, роуты
│   ├── config/
│   │   ├── database.ts   # Подключение Mongoose
│   │   └── env.ts        # Переменные окружения
│   ├── controllers/      # Обработчики запросов (логика)
│   ├── middleware/       # errorHandler, notFound, auth и т.д.
│   ├── models/           # Схемы и модели Mongoose
│   ├── routes/           # Маршруты API (привязка к контроллерам)
│   ├── types/            # Общие типы TypeScript
│   └── utils/            # Вспомогательные функции
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Запуск

1. Установка зависимостей:
   ```bash
   cd backend && npm install
   ```

2. Создайте файл `.env` из примера:
   ```bash
   cp .env.example .env
   ```
   Укажите `MONGODB_URI` (локальный MongoDB или MongoDB Atlas).

3. Режим разработки (с hot-reload):
   ```bash
   npm run dev
   ```

4. Сборка и продакшен:
   ```bash
   npm run build
   npm start
   ```

## API

- `GET /health` — проверка работы сервера
- `GET /api` — информация об API

### Регистрация, вход и профиль

- `POST /api/auth/register` — регистрация (body: `{ "email", "password", "name?" }`). На почту отправляется 6-значный код.
- `POST /api/auth/verify-email` — подтверждение почты (body: `{ "email", "code" }`).
- `POST /api/auth/resend-code` — повторная отправка кода (body: `{ "email" }`).
- `POST /api/auth/login` — вход (body: `{ "email", "password" }`). В ответе — `token` и `user`.
- `GET /api/auth/me` — данные текущего пользователя (в т.ч. `role`). Заголовок: `Authorization: Bearer <token>`.

### Роли и статус пользователя

- **client** — клиент (по умолчанию при регистрации).
- **manager** — менеджер.
- **admin** — администратор. Только админ может управлять тарифами и пользователями.
- **Статус:** `active` | `blocked`. Заблокированные не могут войти (403).

Назначить админа вручную (MongoDB):
```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Пользователи (только admin)

- `GET /api/users` — список пользователей (с числом покупок).
- `GET /api/users/:id` — пользователь и его покупки.
- `POST /api/users` — создать пользователя. Body: `{ "email", "password", "name?", "role?" }`.
- `PATCH /api/users/:id` — изменить (name, role, status).
- `DELETE /api/users/:id` — удалить (и все его покупки).

### Покупки (Purchases)

- `POST /api/purchases` — оформить покупку без оплаты (авторизованный пользователь). Body: `{ "pricingId" }`.
- `POST /api/purchases/create-payment` — создать платёж ЮKassa. Body: `{ "pricingId" }`. Ответ: `{ paymentId, confirmationUrl }`. Редирект пользователя на `confirmationUrl`, после оплаты ЮKassa редиректит на фронт `/payment/return?paymentId=...`.
- `GET /api/purchases/check-payment/:paymentId` — статус платежа (pending / succeeded / cancelled).
- `POST /api/purchases/yoo-webhook` — вебхук ЮKassa (настроить в личном кабинете ЮKassa, событие `payment.succeeded`). При успехе создаётся запись в Purchases, письмо и Telegram; по сокету отправляется `payment_succeeded`.
- `GET /api/purchases/me` — моя история покупок.
- `GET /api/purchases/user/:userId` — история покупок пользователя (только admin).
- `PATCH /api/purchases/:id/status` — изменить статус покупки (только admin). Body: `{ "status": "pending" | "completed" | "cancelled" }`.

**ЮKassa:** в `.env` задать `YOO_SHOP_ID`, `YOO_SECRET_KEY`, `FRONTEND_URL` (для return_url и CORS сокетов). Webhook URL: `https://ваш-домен/api/purchases/yoo-webhook`. Для локальной разработки можно использовать ngrok.

### Тарифы (Pricing) — только админ может добавлять/изменять/удалять

- `GET /api/pricing` — список тарифов (доступно всем).
- `GET /api/pricing/:id` — один тариф.
- `POST /api/pricing` — создать (только **admin**). Body: `{ "title", "description", "price", "order?", "features?", "isPopular?" }`.
- `PUT /api/pricing/:id` — изменить (только **admin**).
- `DELETE /api/pricing/:id` — удалить (только **admin**).

### Кейсы (Cases) — только **admin** (не manager) может создавать/редактировать/удалять

- `GET /api/cases` — список опубликованных кейсов (доступно всем).
- `GET /api/cases/:id` — один кейс по `_id` или по `slug`.
- `GET /api/cases/admin/list` — все кейсы (только **admin**).
- `GET /api/cases/admin/:id` — один кейс для редактирования (только **admin**).
- `POST /api/cases` — создать кейс (только **admin**). Body: `{ "title", "slug", "category", "shortDescription", "content", "problem?", "solution?", "results?", "techStack?", "imageUrl?", "gallery?", "order?", "isPublished?" }`.
- `PUT /api/cases/:id` — изменить (только **admin**).
- `DELETE /api/cases/:id` — удалить (только **admin**).

Заявка с формы контактов может содержать `caseId` (заказ услуги по кейсу). В чат при отправке можно передать `caseId` — тогда ответы AI учитывают контекст этого кейса.

### AI-чат

- Переписка сохраняется по **cookie** (sessionId) для гостей или по **userId** для авторизованных.
- `GET /api/chat/history` — получить/создать диалог и историю. Query: `sessionId` (для гостя) или заголовок `Authorization` (для пользователя).
- `POST /api/chat/send` — отправить сообщение. Body: `{ "conversationId?", "content?", "imageUrls?", "sessionId?", "caseId?" }`. Если передан `caseId`, ответы строятся с учётом кейса.
- `POST /api/chat/upload` — загрузка изображения (multipart, поле `image`). Ответ: `{ "url" }`.
- **Админ:** `GET /api/chat/admin/conversations` — список всех диалогов; `GET /api/chat/admin/conversations/:id` — одна переписка с сообщениями.

ИИ: **Groq** (бесплатный tier). В `.env`: `GROQ_API_KEY` (ключ с [console.groq.com](https://console.groq.com)), опционально `GROQ_CHAT_MODEL` (по умолчанию `llama-3.1-8b-instant`), `API_BASE_URL` для ссылок на загруженные файлы.

В `.env`: `SMTP_*` для почты, `JWT_SECRET` и опционально `JWT_EXPIRES_IN` (по умолчанию `7d`) для токенов. Код подтверждения действует 15 минут.

При покупке тарифа: клиенту на email уходит письмо «Поздравляем с покупкой, наши специалисты свяжутся с вами»; в Telegram — лог о заказе (если заданы `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`).

### Cloudinary — хранение всех картинок

В `.env` задайте (без этих переменных картинки чата сохраняются в папку `uploads/`):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

После этого:

- **Чат** (`POST /api/chat/upload`): загруженные в диалог изображения сохраняются в Cloudinary (папка `busines/chat`), в ответе приходит `secure_url`.
- **Кейсы и админка**: `POST /api/upload` (multipart, поле `image`, только **admin**) — загрузка в Cloudinary (папка `busines/cases`). Ответ: `{ "url": "https://res.cloudinary.com/..." }`. Этим URL можно заполнять `imageUrl` и галерею кейсов.

**Важно:** не коммитьте `.env` с реальными ключами. Если секрет Cloudinary когда-либо попадал в лог или в чат — смените его в [Cloudinary Dashboard](https://console.cloudinary.com/) (Settings → API Keys).

---

## Примеры curl для добавления данных

Базовый URL: `http://localhost:3001` (или ваш `API_BASE`).

### 1. Вход (получить токен админа для следующих запросов)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"yourpassword\"}"
```

В ответе будет `token` — подставь его в `YOUR_ADMIN_TOKEN` ниже.

### 2. Добавить тариф (Pricing) — нужен токен admin

```bash
curl -X POST http://localhost:3001/api/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": { \"en\": \"Starter\", \"ru\": \"Старт\", \"hy\": \"Ստարտ\" },
    \"description\": { \"en\": \"For small projects\", \"ru\": \"Для небольших проектов\", \"hy\": \"Փոքր նախագծերի համար\" },
    \"features\": { \"en\": [\"Consultation\", \"1 report\"], \"ru\": [\"Консультация\", \"1 отчёт\"], \"hy\": [\"Խորհրդատվություն\", \"1 հաշվետվություն\"] },
    \"price\": 50000,
    \"order\": 0,
    \"isPopular\": false
  }"
```

### 3. Добавить кейсы (Case) — нужен токен admin. Картинки: Unsplash (бесплатно, можно подставлять свои URL)

Получить токен: сначала выполни запрос из пункта 1 (Login), подставь `YOUR_ADMIN_TOKEN`.

**Кейс 1 — AI в банке (финтех)**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"AI-ассистент для банка\",
    \"slug\": \"ai-assistant-bank\",
    \"category\": \"Финтех\",
    \"shortDescription\": \"Внедрили интеллектуального ассистента для обработки обращений клиентов.\",
    \"content\": \"<p>Крупный банк столкнулся с ростом обращений в поддержку. Мы внедрили голосового и чат-ассистента на базе NLP, который обрабатывает типовые запросы и передаёт сложные операторам.</p>\",
    \"problem\": \"Рост нагрузки на колл-центр и поддержку, длинные очереди.\",
    \"solution\": \"Голосовой и чат-бот с распознаванием намерений и интеграцией в CRM.\",
    \"results\": \"-60% времени обработки обращений, снижение нагрузки на операторов.\",
    \"techStack\": [\"Python\", \"NLP\", \"FastAPI\", \"Speech-to-Text\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80\",
    \"order\": 0,
    \"isPublished\": true
  }"
```

**Кейс 2 — автоматизация склада**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"Автоматизация склада\",
    \"slug\": \"warehouse-automation\",
    \"category\": \"Автоматизация\",
    \"shortDescription\": \"Система предиктивной аналитики для оптимизации запасов и логистики.\",
    \"content\": \"<p>Сеть магазинов нуждалась в прогнозе спроса по точкам. Мы построили модель, которая учитывает сезонность, промо и внешние данные.</p>\",
    \"problem\": \"Переполнение складов в одних регионах и нехватка в других.\",
    \"solution\": \"ML-модель прогноза спроса и рекомендации по перераспределению товара.\",
    \"results\": \"+35% эффективности складов, меньше списаний и упущенной выгоды.\",
    \"techStack\": [\"Python\", \"scikit-learn\", \"pandas\", \"API интеграции\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80\",
    \"order\": 1,
    \"isPublished\": true
  }"
```

**Кейс 3 — персонализация в e-commerce**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"Персонализация в e-commerce\",
    \"slug\": \"ecommerce-personalization\",
    \"category\": \"E-commerce\",
    \"shortDescription\": \"Рекомендательная система на базе AI увеличила конверсию и средний чек.\",
    \"content\": \"<p>Интернет-магазин хотел показывать релевантные товары каждому пользователю. Мы внедрили рекомендации на основе истории просмотров и покупок.</p>\",
    \"problem\": \"Низкая конверсия, пользователи не находили подходящие товары.\",
    \"solution\": \"Recommendation engine (collaborative filtering + контентные признаки).\",
    \"results\": \"+45% к конверсии, рост среднего чека на 20%.\",
    \"techStack\": [\"Python\", \"TensorFlow\", \"Recommendations\", \"Redis\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80\",
    \"order\": 2,
    \"isPublished\": true
  }"
```

**Кейс 4 — голосовой бот доставки**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"Голосовой бот доставки\",
    \"slug\": \"voice-bot-delivery\",
    \"category\": \"AI-ассистенты\",
    \"shortDescription\": \"Входящие звонки по заказам обрабатывает голосовой бот — 80% без участия оператора.\",
    \"content\": \"<p>Служба доставки получала тысячи звонков «где мой заказ?». Мы запустили голосового бота с распознаванием речи и интеграцией в систему доставки.</p>\",
    \"problem\": \"Перегрузка колл-центра, долгое ожидание ответа.\",
    \"solution\": \"Голосовой AI с STT/TTS и доступом к статусам заказов в реальном времени.\",
    \"results\": \"80% обращений обработано ботом, время ответа — секунды.\",
    \"techStack\": [\"Speech-to-Text\", \"TTS\", \"Python\", \"WebSocket\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80\",
    \"order\": 3,
    \"isPublished\": true
  }"
```

**Кейс 5 — предиктивная аналитика**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"Предиктивная аналитика для ритейла\",
    \"slug\": \"predictive-analytics-retail\",
    \"category\": \"Аналитика\",
    \"shortDescription\": \"Модель прогнозирования спроса для сети магазинов — меньше списаний, точнее закупки.\",
    \"content\": \"<p>Сеть супермаркетов страдала от избыточных закупок скоропорта. Мы обучили модель на истории продаж, погоде и праздниках.</p>\",
    \"problem\": \"-40% товаров списывалось из-за истечения срока годности.\",
    \"solution\": \"Временные ряды + градиентный бустинг, интеграция с системой закупок.\",
    \"results\": \"-40% списаний, оптимизация остатков по категориям.\",
    \"techStack\": [\"Python\", \"XGBoost\", \"pandas\", \"Apache Airflow\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80\",
    \"order\": 4,
    \"isPublished\": true
  }"
```

**Кейс 6 — автоматизация документов**

```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{
    \"title\": \"Распознавание и автоматизация документов\",
    \"slug\": \"document-automation\",
    \"category\": \"Автоматизация\",
    \"shortDescription\": \"Входящие договоры и акты извлекаются и разносятся по полям без ручного ввода.\",
    \"content\": \"<p>Юридический отдел обрабатывал сотни сканов договоров вручную. Внедрили OCR + извлечение полей и загрузку в 1С.</p>\",
    \"problem\": \"Ручной ввод данных из документов, ошибки и задержки.\",
    \"solution\": \"OCR (в т.ч. рукопись), NER для полей, валидация и загрузка в учётную систему.\",
    \"results\": \"95% точность распознавания, в 10 раз быстрее обработка папки документов.\",
    \"techStack\": [\"OCR\", \"Python\", \"Computer Vision\", \"1C API\"],
    \"imageUrl\": \"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80\",
    \"order\": 5,
    \"isPublished\": true
  }"
```

**Где брать картинки для своих кейсов**

- **Unsplash** (бесплатно, без обязательной атрибуции): https://unsplash.com — ищи по темам (finance, warehouse, analytics, delivery, documents). URL картинки: «Share» → «Copy link» → подставь в `imageUrl` (можно добавить `?w=800&q=80` для размера и качества).
- **Pexels**: https://www.pexels.com — тоже бесплатные фото, копируй URL изображения в `imageUrl`.
- Свои файлы: залей картинку на свой хостинг или в облако (S3, Cloudinary и т.п.) и подставь итоговый URL в `imageUrl`.

### 4. Заявка с формы контактов (без авторизации)

```bash
curl -X POST http://localhost:3001/api/contact-requests \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Иван Петров\",
    \"email\": \"ivan@company.ru\",
    \"company\": \"ООО Рога и копыта\",
    \"phone\": \"+7 999 123-45-67\",
    \"message\": \"Хотим обсудить внедрение AI в службу поддержки.\"
  }"
```

С опциональным `caseId` (заказ услуги по кейсу):

```bash
curl -X POST http://localhost:3001/api/contact-requests \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Мария\",
    \"email\": \"maria@test.ru\",
    \"message\": \"Хочу заказать такую же услугу, как в кейсе AI-ассистент для банка\",
    \"caseId\": \"ID_КЕЙСА_ИЗ_GET_/api/cases\"
  }"
```

### 5. Добавить пользователя (admin) — нужен токен admin

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{\"email\":\"manager@example.com\",\"password\":\"securepass\",\"name\":\"Менеджер\",\"role\":\"manager\"}"
```

### 6. Регистрация нового клиента (без токена)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"client@example.com\",\"password\":\"password123\",\"name\":\"Клиент\"}"
```
