#!/usr/bin/env bash
# v5.1 : nouvelle voix du pasteur Emmanuel. On garde les images déjà rendues jusqu'à l'entrée d'Emmanuel
# (coupe au plan « table des pasteurs », image 6119 = 203,967 s) et on ne rend que la suite, puis on assemble.
# Pré-requis : renders/chunks/c0..c3.mp4 de la v5. Reprise : les morceaux nXa.mp4 (images déjà sauvées) sont gardés,
# seul le reste (nXb.mkv, format qui survit à une coupure) est rendu.
set -u
cd "$(dirname "$0")/.."
export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
D=renders/chunks; CUT=6119
DUR=$(python3 -c "import json;print(json.loads(open('assets/data.js').read().split('=',1)[1].rstrip().rstrip(';'))['dur'])")
END=$(python3 -c "print(round($DUR*30))")
B1=$(( CUT + (END - CUT) / 3 )); B2=$(( CUT + 2 * (END - CUT) / 3 ))
nf() { [ -f "$1" ] && ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$1" || echo 0; }
t() { python3 -c "print($1/30)"; }
seg() { local k=$1 a=$2 b=$3 done; done=$(nf $D/${k}a.mp4); local s=$(( a + done ))
  [ $s -lt $b ] && node src/render.mjs chunk 1 720 $D/${k}b.mkv $(t $s) $(t $b) > $D/${k}b.log 2>&1 || echo "fini (rien à rendre)" > $D/${k}b.log; }
seg n0 $CUT $B1 & seg n1 $B1 $B2 & seg n2 $B2 $END &
wait
for k in n0b n1b n2b; do grep -q "^fini" $D/$k.log || { echo "ÉCHEC $k"; tail -5 $D/$k.log; exit 1; }; done
[ -f $D/c3a.mp4 ] || ffmpeg -v error -y -i $D/c3.mp4 -frames:v $(( CUT - 5400 )) -c:v libx264 -preset medium -crf 14 -pix_fmt yuv420p $D/c3a.mp4
: > $D/list51.txt
for f in c0.mp4 c1.mp4 c2.mp4 c3a.mp4 n0a.mp4 n0b.mkv n1a.mp4 n1b.mkv n2a.mp4 n2b.mkv; do [ -f $D/$f ] && echo "file '$f'" >> $D/list51.txt; done
OUT="renders/$(date +%Y-%m-%d)_motion_ma-part-suffit-annabelle-partie-3-v5.1_9-16.mp4"
ffmpeg -v error -y -f concat -safe 0 -i $D/list51.txt -i assets/audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart "$OUT" && echo "fini final $OUT"
