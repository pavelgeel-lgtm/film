@echo off
chcp 65001 >nul
echo.
echo  ██████  ██╗  ██╗███╗   ███╗███████╗██████╗ ██╗ █████╗
echo  ╚════██╗╚██╗██╔╝████╗ ████║██╔════╝██╔══██╗██║██╔══██╗
echo   █████╔╝ ╚███╔╝ ██╔████╔██║█████╗  ██║  ██║██║███████║
echo   ╚═══██╗ ██╔██╗ ██║╚██╔╝██║██╔══╝  ██║  ██║██║██╔══██║
echo  ██████╔╝██╔╝ ██╗██║ ╚═╝ ██║███████╗██████╔╝██║██║  ██║
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝
echo.
echo  Setup Script — подготовка проекта
echo  ====================================
echo.

:: ── Проверка Node.js ─────────────────────────────────────────────────────
echo [1/6] Проверяю Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  ОШИБКА: Node.js не установлен.
    echo  Скачай здесь: https://nodejs.org
    pause & exit /b 1
)
echo  OK

:: ── Проверка Docker ──────────────────────────────────────────────────────
echo [2/6] Проверяю Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  ОШИБКА: Docker не запущен или не установлен.
    echo  Скачай: https://docker.com/products/docker-desktop
    echo  После установки открой Docker Desktop и запусти его.
    pause & exit /b 1
)
echo  OK

:: ── Создать .env если нет ────────────────────────────────────────────────
echo [3/6] Создаю .env...
if not exist .env (
    copy .env.example .env >nul
    powershell -Command "(Get-Content .env) -replace 'замени_на_длинную_случайную_строку_минимум_64_символа', ([System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))) | Set-Content .env"
    echo  OK — создан .env с автоматическим JWT_SECRET
) else (
    echo  OK — .env уже существует
)

:: ── Запустить PostgreSQL в Docker ────────────────────────────────────────
echo [4/6] Запускаю PostgreSQL...
docker ps --filter "name=3xmedia-db" --format "{{.Names}}" | findstr "3xmedia-db" >nul 2>&1
if %errorlevel% equ 0 (
    echo  OK — уже запущен
) else (
    docker run -d --name 3xmedia-db ^
        -e POSTGRES_DB=3xmedia ^
        -e POSTGRES_USER=3xmedia ^
        -e POSTGRES_PASSWORD=secret123 ^
        -p 5432:5432 ^
        --restart unless-stopped ^
        postgres:16-alpine >nul
    echo  Жду запуска базы данных...
    timeout /t 5 /nobreak >nul
    echo  OK
)

:: ── Накатить схему БД ────────────────────────────────────────────────────
echo [5/6] Создаю таблицы в базе данных...
docker exec -i 3xmedia-db psql -U 3xmedia -d 3xmedia < server\db\schema.sql >nul 2>&1
echo  OK

:: ── Установить зависимости ───────────────────────────────────────────────
echo [6/6] Устанавливаю зависимости...
call npm install --silent
cd server && call npm install --silent && cd ..
echo  OK

:: ── Создать первого пользователя ─────────────────────────────────────────
echo.
echo  Создаю администратора...
node -e "fetch('http://localhost:3001/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Администратор',email:'admin@3xmedia.ru',password:'admin123',pin:'1234',role:'admin'})}).then(r=>r.json()).then(d=>console.log(d.user?'  Готово! email: admin@3xmedia.ru / пароль: admin123 / PIN: 1234':'  Пользователь уже существует')).catch(()=>console.log('  Сервер ещё не запущен — запусти dev.bat и создай пользователя вручную'))" 2>nul

echo.
echo  ====================================
echo   Установка завершена!
echo   Запусти: dev.bat
echo  ====================================
echo.
pause
