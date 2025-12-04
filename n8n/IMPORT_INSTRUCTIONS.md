# Инструкции за импортиране на n8n workflow

## Стъпка 1: Отворете n8n
Отидете на: https://n8n.simeontsvetanovn8nworkflows.site

## Стъпка 2: Деактивирайте старите workflows
1. Отидете на Workflows
2. За всеки активен workflow:
   - Кликнете върху него
   - Кликнете на toggle бутона (Active) за да го деактивирате
   - Или изтрийте workflow-а ако не ви трябва

## Стъпка 3: Импортирайте новия workflow
1. Кликнете на "Create new workflow" или "Import from file"
2. Изберете файла: `n8n/wardrobe-unified-backend.json`
3. Или копирайте съдържанието на файла и го поставете с Import from URL/JSON

## Стъпка 4: Активирайте workflow-a
1. След импортиране, кликнете на toggle бутона (Inactive → Active)
2. Потвърдете активирането

## Стъпка 5: Тествайте
След активиране, опитайте:
```
curl -X POST https://n8n.simeontsvetanovn8nworkflows.site/webhook/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Трябва да получите JSON отговор с user, accessToken и refreshToken.

## Важно!
- Новият workflow съдържа ВСИЧКИ endpoints в един файл
- Трябва само ЕДИН workflow да е активен
- Всички POST и GET endpoints са конфигурирани с responseMode: "responseNode"

## Endpoints в новия workflow:
- POST /webhook/auth/register
- POST /webhook/auth/login  
- GET /webhook/auth/me
- GET /webhook/garments
- POST /webhook/garments
- GET /webhook/outfits
- POST /webhook/outfits
- POST /webhook/ai/chat
- POST /webhook/ai/suggest-outfit
