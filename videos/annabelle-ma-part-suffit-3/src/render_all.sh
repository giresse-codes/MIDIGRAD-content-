#!/usr/bin/env bash
# Rendu complet par morceaux de ~60 s puis assemblage final (1080×1920, 30 i/s, H.264 CRF 18, yuv420p, AAC 192 kb/s, +faststart).
# Usage : bash src/render_all.sh [morceaux déjà lancés à attendre…]   (scène 3D en 720×1280, textes en 1080×1920)
set -u
cd "$(dirname "$0")/.."
export NODE_PATH=${NODE_PATH:-/opt/node-tools/node_modules}
D=renders/chunks; mkdir -p "$D"
DUR=$(python3 -c "import json;print(json.loads(open('assets/data.js').read().split('=',1)[1].rstrip().rstrip(';'))['dur'])")
CH=("0 0 60" "1 60 120" "2 120 180" "3 180 221" "4 221 262" "5 262 $DUR")
done_ok() { grep -q "^fini" "$D/c$1.log" 2>/dev/null; }
run() { set -- $1; node src/render.mjs chunk 1 720 "$D/c$1.mp4" "$2" "$3" > "$D/c$1.log" 2>&1; }
# au plus 3 morceaux à la fois ; les morceaux déjà en cours (passés en argument) comptent dans les 3
busy() { local n=0 k; for k in "$@"; do grep -qE "^fini|Error|ERREUR" "$D/c$k.log" 2>/dev/null || n=$((n + 1)); done; echo $n; }
RUNNING=("$@")
for c in "${CH[@]}"; do set -- $c; k=$1
  if done_ok "$k" || printf '%s\n' "${RUNNING[@]}" | grep -qx "$k"; then continue; fi
  until [ "$(busy "${RUNNING[@]}")" -lt 3 ]; do sleep 15; done
  : > "$D/c$k.log"; run "$c" & RUNNING+=("$k"); sleep 5
done
until [ "$(busy "${RUNNING[@]}")" -eq 0 ]; do sleep 15; done
for c in "${CH[@]}"; do set -- $c; done_ok "$1" || { echo "ÉCHEC morceau c$1"; tail -5 "$D/c$1.log"; exit 1; }; done
printf "file 'c%s.mp4'\n" 0 1 2 3 4 5 > "$D/list.txt"
OUT="renders/$(date +%Y-%m-%d)_motion_ma-part-suffit-annabelle-partie-3-v5_9-16.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$D/list.txt" -i assets/audio.wav -map 0:v -map 1:a \
  -vf "scale=1080:1920:flags=lanczos,fps=30" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart "$OUT" && echo "fini final $OUT"
