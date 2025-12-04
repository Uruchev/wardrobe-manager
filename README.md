# 👔 Wardrobe Manager - AI Личен Стилист

AI-базиран личен стилист и организатор на гардероба.

## 🌐 Demo

**Frontend:** [https://uruchev.github.io/wardrobe-manager/](https://uruchev.github.io/wardrobe-manager/)

**Backend API:** n8n self-hosted

## ✨ Функции

- 📸 Добавяне на дрехи с описание
- 👔 Организация по категории, цветове и сезони
- 🤖 AI стилист с персонализирани препоръки
- 🌤️ Съобразяване с времето
- 📱 Mobile-first дизайн (PWA ready)

## 🛠️ Технологии

### Frontend
- Next.js 15 (Static Export за GitHub Pages)
- Tailwind CSS
- shadcn/ui
- Zustand (State management)
- React Query

### Backend (n8n)
- n8n self-hosted workflows
- OpenAI GPT-4 за AI препоръки
- Webhook-based API

## 🚀 Deployment

### Frontend (GitHub Pages)

Автоматичен deploy при push в main branch чрез GitHub Actions.

### Backend (n8n)

1. Импортирай `n8n/wardrobe-manager-backend.json` в твоя n8n
2. Конфигурирай OpenAI credentials
3. Активирай workflow-а

## 📁 Структура

```
├── frontend/           # Next.js приложение
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # UI компоненти
│   │   └── lib/       # Utilities
│   └── public/        # Static assets
├── n8n/               # n8n workflows
│   └── wardrobe-manager-backend.json
└── .github/
    └── workflows/     # GitHub Actions за deploy
```

## 📋 Документация

| Документ | Описание |
|----------|----------|
| [DEVELOPMENT_PLAN.md](./docs/DEVELOPMENT_PLAN.md) | Пълен план за разработка |
| [TECHNICAL_SPECS.md](./docs/TECHNICAL_SPECS.md) | Технически спецификации |
| [n8n/README.md](./n8n/README.md) | Документация за n8n workflows |

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-n8n-domain.com/webhook
```

## 📝 License

MIT

---

Направено с ❤️ за модерния гардероб
