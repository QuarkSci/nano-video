#!/bin/bash
# assemble.sh <video prefix e.g. a_ch> <out.mp4> [voice.wav]
# concat chapter videos, concat chapter SFX, mix with music bed (ducked under voice if given), loudness -14 LUFS, film finish
set -e
P=$1; OUT=$2; VOICE=$3
cd "$(dirname "$0")"
printf "file '%s'\n" $(for i in 1 2 3 4 5 6; do echo "${P}${i}.mp4"; done) > out/concat_v.txt
sed -i "s#file '#file '$(pwd)/out/#" out/concat_v.txt
ffmpeg -v error -y -f concat -safe 0 -i out/concat_v.txt -c copy out/_v.mp4
if [ -f out/sfx_warped.wav ]; then cp out/sfx_warped.wav out/_sfx.wav; else
ffmpeg -v error -y -i out/sfx.wav -i out/sfx_ch2.wav -i out/sfx_ch3.wav -i out/sfx_ch4.wav -i out/sfx_ch5.wav -i out/sfx_ch6.wav \
  -filter_complex "[0][1][2][3][4][5]concat=n=6:v=0:a=1[a]" -map "[a]" out/_sfx.wav; fi
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/_v.mp4)
if [ -n "$VOICE" ]; then
  MIX="[1:a]volume=0.9[s];[2:a]volume=0.3[mu];[3:a]volume=1.0,asplit[vo][vk];[mu][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=400[mud];[s][mud][vo]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]"
  IN3="-i $VOICE"
else
  MIX="[1:a]volume=1.0[s];[2:a]volume=0.38[mu];[s][mu]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]"
  IN3=""
fi
ffmpeg -v error -y -i out/_v.mp4 -i out/_sfx.wav -i out/music.wav $IN3 \
  -filter_complex "[0:v]format=yuv444p,eq=contrast=1.04:saturation=1.06:gamma=0.98,vignette=angle=PI/4.6:mode=forward,noise=c0s=5:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u,format=yuv420p[v];$MIX" \
  -map "[v]" -map "[a]" -t "$DUR" -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k "$OUT"
echo done "$OUT" "$DUR"s
