@echo off
chcp 65001 >nul
echo.
echo  Запускаю 3X Media Cloud...
echo.

:: Проверить что БД запущена
docker start 3xmedia-db >nul 2>&1

:: Запустить бэкенд в отдельном окне
start "3xMedia — Сервер :3001" cmd /k "cd /d %~dp0server && npm run dev"

:: Подождать пока сервер поднимется
timeout /t 3 /nobreak >nul

:: Запустить фронтенд в отдельном окне
start "3xMedia — Фронт :5173" cmd /k "cd /d %~dp0 && npm run dev"

:: Подождать и открыть браузер
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo  Открыто два окна:
echo   - Сервер  → http://localhost:3001
echo   - Фронтенд → http://localhost:5173
echo.
echo  Закрой оба окна чтобы остановить.
echo.
pause
