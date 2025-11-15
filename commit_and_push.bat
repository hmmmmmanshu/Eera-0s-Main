@echo off
git add .
git commit -m "fix: Implement dynamic icon loading to prevent bundler circular dependencies"
git push
echo Done!
pause

