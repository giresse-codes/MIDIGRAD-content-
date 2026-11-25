#!/bin/bash
set -e
D=$(python3 -c "import json;print(json.load(open('timeline.json'))['duration'])")
for fmt in youtube tiktok; do
  python3 - "$D" > chunks_$fmt.txt <<'PY'
import sys; D=float(sys.argv[1]); n=4
b=[round(round(D*k/n*30)/30,4) for k in range(n+1)]
for i in range(n): print(b[i], b[i+1])
PY
  i=0
  while read a b; do python3 render.py timeline.json $fmt $a $b part_${fmt}_$i.mp4 & i=$((i+1)); done < chunks_$fmt.txt
  wait
  rm -f list_$fmt.txt; for k in 0 1 2 3; do echo "file 'part_${fmt}_$k.mp4'" >> list_$fmt.txt; done
  ffmpeg -v error -y -f concat -safe 0 -i list_$fmt.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart episode1-$fmt.mp4
  echo "FIN $fmt $(date)"
done
