@echo off
set FFMPEG_PATH=node_modules\ffmpeg-static\ffmpeg.exe
%FFMPEG_PATH% -loop 1 -i "C:\Users\ABIR\.gemini\antigravity\brain\9510152c-cb2e-4587-9cee-7c9300c94d20\cargo_ship_hero_1788278869306.jpg" -vf "zoompan=z='min(zoom+0.0015,1.5)':d=180:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1600x900" -vframes 180 "public\frames\desktop\frame_%%04d.webp" -y
copy /Y "public\frames\desktop\frame_0001.webp" "public\frames\poster.webp"
