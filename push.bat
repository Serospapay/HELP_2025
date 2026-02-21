@echo off
cd /d "%~dp0"
git add -A
git status
git commit -m "chore: cleanup repo, role features"
git push origin main
pause
