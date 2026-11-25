#!/bin/bash
set -e
python3 render.py end_tl.json tiktok 0 2.6 endcard_v.mp4
SR=48000
# son de la carte de fin : magie-lumiere doux
ffmpeg -nostdin -v error -y -i /home/user/MIDIGRAD-content-/sons/magie-lumiere.mp3 -af "atrim=0:2.6,afade=t=in:d=0.05,afade=t=out:st=1.8:d=0.8,volume=-12dB,aresample=48000,aformat=channel_layouts=stereo" endcard_a.wav
ffmpeg -nostdin -v error -y -i endcard_v.mp4 -i endcard_a.wav -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest endcard.mp4
n=1
while read a b name; do
  # ouverture MIDIGRAD courte : 1,0–3,0 s du rendu (logo + EUD)
  ffmpeg -nostdin -v error -y -ss 1.0 -t 2.0 -i episode1-tiktok.mp4 -af "afade=t=in:d=0.1,afade=t=out:st=1.7:d=0.3" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 x_open.mp4
  d=$(python3 -c "print($b-$a)")
  ffmpeg -nostdin -v error -y -ss $a -t $d -i episode1-tiktok.mp4 -af "afade=t=in:d=0.3,afade=t=out:st=$(python3 -c "print($d-0.6)"):d=0.6" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 x_body.mp4
  printf "file 'x_open.mp4'\nfile 'x_body.mp4'\nfile 'endcard.mp4'\n" > x_list.txt
  ffmpeg -nostdin -v error -y -f concat -safe 0 -i x_list.txt -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -af "loudnorm=I=-13.2:TP=-1.0:LRA=11,alimiter=limit=0.74:level=false:attack=1:release=60" -movflags +faststart extrait$n-$name.mp4
  n=$((n+1))
done < xl.txt
