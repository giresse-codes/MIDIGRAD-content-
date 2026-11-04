#!/usr/bin/env bash
# v5.1 : nouvelle voix du pasteur Emmanuel. On garde les images déjà rendues jusqu'à l'entrée d'Emmanuel
# (coupe au plan « table des pasteurs », image 6119 = 203,967 s) et on ne rend que la suite, puis on assemble.
# Pré-requis : renders/chunks/c0..c3.mp4 de la v5 (rendus par src/render_all.sh).
set -u
cd "$(dirname "$0")/.."
export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
D=renders/chunks; CUT=6119
DUR=$(python3 -c "import json;print(json.loads(open('assets/data.js').read().split('=',1)[1].rstrip().rstrip(';'))['dur'])")
END=$(python3 -c "print(round($DUR*30))")
B1=$(( CUT + (END - CUT) / 3 )); B2=$(( CUT + 2 * (END - CUT) / 3 ))
t() { python3 -c "print($1/30)"; }
node src/render.mjs chunk 1 720 $D/n0.mp4 $(t $CUT) $(t $B1) > $D/n0.log 2>&1 &
node src/render.mjs chunk 1 720 $D/n1.mp4 $(t $B1) $(t $B2) > $D/n1.log 2>&1 &
node src/render.mjs chunk 1 720 $D/n2.mp4 $(t $B2) $DUR > $D/n2.log 2>&1 &
wait
for k in n0 n1 n2; do grep -q "^fini" $D/$k.log || { echo "ÉCHEC $k"; tail -5 $D/$k.log; exit 1; }; done
# début conservé : c0, c1, c2 + les (CUT - 5400) premières images de c3
ffmpeg -v error -y -i $D/c3.mp4 -frames:v $(( CUT - 5400 )) -c:v libx264 -preset medium -crf 14 -pix_fmt yuv420p $D/c3a.mp4
printf "file '%s.mp4'\n" c0 c1 c2 c3a n0 n1 n2 > $D/list51.txt
OUT="renders/$(date +%Y-%m-%d)_motion_ma-part-suffit-annabelle-partie-3-v5.1_9-16.mp4"
ffmpeg -v error -y -f concat -safe 0 -i $D/list51.txt -i assets/audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart "$OUT" && echo "fini final $OUT"
