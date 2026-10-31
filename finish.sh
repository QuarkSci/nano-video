#!/bin/bash
# finish.sh raw.mp4 audio.wav out.mp4 — film finish (grain + vignette + gentle grade) and mux audio
set -e
ffmpeg -v error -y -i "$1" -i "$2" \
  -filter_complex "[0:v]format=yuv444p,eq=contrast=1.04:saturation=1.06:gamma=0.98,vignette=angle=PI/4.6:mode=forward,noise=c0s=5:c0f=t+u:c1s=3:c1f=t+u:c2s=3:c2f=t+u,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 21 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$3"
echo done "$3"
