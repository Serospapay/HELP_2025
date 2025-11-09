@echo off
REM ===============================================================
REM  Платформа волонтерських проєктів — запуск середовища
REM  Виконання: подвійний клік або запуск через PowerShell/CMD
REM ===============================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"

REM -- Перемикаємо консоль у UTF-8, зберігаючи попередню кодову сторінку
for /f "tokens=2 delims=:." %%A in ('chcp') do set "ORIG_CODEPAGE=%%A"
chcp 65001 >nul

echo.
echo ===============================================
echo   Ініціалізація середовища платформи волонтерів
echo ===============================================
echo.

set "INFRA_ENV=infra\.env"
set "INFRA_ENV_TEMPLATE=infra\.env.example"

IF NOT EXIST "%INFRA_ENV%" (
    if EXIST "%INFRA_ENV_TEMPLATE%" (
        echo [info] Файл %INFRA_ENV% не знайдено. Копіюю з %INFRA_ENV_TEMPLATE%...
        copy "%INFRA_ENV_TEMPLATE%" "%INFRA_ENV%" >nul
    ) ELSE (
        echo [warn] Шаблон %INFRA_ENV_TEMPLATE% відсутній — пропускаю крок копіювання.
    )
) ELSE (
    echo [info] Використовую наявний %INFRA_ENV%
)

echo.
echo [step] Перевіряю наявність Docker CLI...
docker --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [error] Docker CLI не знайдено. Встановіть Docker Desktop та повторіть спробу.
    goto :cleanup
)

echo [step] Перевіряю стан Docker Engine...
docker info >nul 2>&1
IF ERRORLEVEL 1 (
    echo [error] Docker Desktop працює некоректно або ще не запущений.
    echo         Запустіть Docker Desktop, дочекайтеся статусу "Running" і повторіть спробу.
    goto :cleanup
)

echo [step] Запускаю docker compose up --build
echo [hint] Натисніть CTRL+C для зупинки контейнерів.
echo.

docker compose up --build

echo.
echo [done] Docker-сервіси зупинено.

:cleanup
if defined ORIG_CODEPAGE chcp %ORIG_CODEPAGE% >nul
echo.
pause

