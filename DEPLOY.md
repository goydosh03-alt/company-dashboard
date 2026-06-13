# Pin-Up Guide — деплой на Vercel + тест Upload

Мінімальний проєкт: статична сторінка (`index.html`) + дві serverless-функції
(`api/upload.js`, `api/plugins.js`) + Vercel Blob як сховище ZIP-файлів і метаданих.
Без акаунтів — заливати може будь-хто з команди.

## Крок 1. Залити код у GitHub

```bash
cd pin-up-guide
git init
git add .
git commit -m "Pin-Up guide: dashboard + upload"
git branch -M main
git remote add origin https://github.com/<твій-юзер>/pin-up-guide.git
git push -u origin main
```

## Крок 2. Імпортувати в Vercel

1. Відкрий **vercel.com** → **Add New… → Project**.
2. Імпортуй репозиторій `pin-up-guide`.
3. Framework Preset: **Other** (нічого не міняй). Натисни **Deploy**.
4. Отримаєш URL виду `https://pin-up-guide.vercel.app`.

> На цьому етапі сторінка вже відкривається, але Upload ще НЕ працює —
> немає сховища. Далі підключаємо Blob.

## Крок 3. Підключити Vercel Blob (сховище)

1. У проєкті на Vercel → вкладка **Storage** → **Create Database** → **Blob**.
2. Назви (напр. `pinup-plugins`) → **Create**.
3. **Connect to Project** → обери цей проєкт.
   Vercel автоматично додасть змінну `BLOB_READ_WRITE_TOKEN` у проєкт.
4. Вкладка **Deployments** → у останнього деплою **⋯ → Redeploy**
   (щоб функції побачили новий токен).

## Крок 4. Тест

1. Відкрий URL проєкту.
2. Натисни **Upload** (на Home або на сторінці Plugins).
3. Вкинь будь-який `.zip`, впиши назву + ім'я → **Upload**.
4. Онови сторінку (F5) — плагін має лишитись (читається з Blob через `/api/plugins`).
5. Відкрий URL з телефit/іншого браузера — той самий список, файл качається. ✅

Якщо щось не так — у Vercel **Logs** функції `/api/upload` покажуть помилку.

## Локальний запуск (необов'язково)

```bash
npm i -g vercel
cd pin-up-guide
vercel link          # прив'язати до проєкту
vercel env pull      # підтягнути BLOB_READ_WRITE_TOKEN локально
vercel dev           # http://localhost:3000
```

## Що далі

- Перенести це в **Astro Starlight** (повноцінні розділи, Markdown-гайдлайни, токени).
- Додати **soft-delete** (ховати, не видаляти) і фільтри категорій на бекенді.
