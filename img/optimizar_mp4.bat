@echo off
for %%a in ("*.mp4") do (
    echo Procesando: %%a
    ffmpeg -i "%%a" -vf "scale=1280:-2" -preset slow -crf 23 -an "%%~na-opt.mp4"
)
echo ---
echo Proceso terminado.
pause
