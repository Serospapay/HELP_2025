#!/bin/sh
set -e
echo "[entrypoint] Чекаємо PostgreSQL..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  python manage.py migrate --noinput 2>/dev/null && break
  echo "[entrypoint] Очікування бази... ($i/15)"
  sleep 2
done
echo "[entrypoint] Застосовуємо міграції..."
python manage.py migrate --noinput
echo "[entrypoint] Заповнюємо демо-даними (ідемпотентно)..."
python manage.py seed_demo_data 2>/dev/null || true
echo "[entrypoint] Запускаємо сервер..."
exec python manage.py runserver 0.0.0.0:8000
