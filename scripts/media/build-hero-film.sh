#!/bin/bash
# Rebuilds the homepage film (public/hero/film-1080.mp4 and film-720.mp4) from its source clips:
# a 25-second cut of Weatherhaven's brand films. Two-pass H.264 sized for the web: about 2.4 MB at
# 1080p and 1.1 MB at 720p. Run from the repo root: bash scripts/media/build-hero-film.sh
set -e
H=public/hero/hero.mp4; I=public/hero/iron-patience.mp4; W=public/products/runway-threshold.mp4
FC="[0:v]trim=7.0:10.5,setpts=PTS-STARTPTS[s1];[0:v]trim=3.65:6.8,setpts=PTS-STARTPTS[s2];[1:v]trim=0.1:2.6,setpts=PTS-STARTPTS[s3];[0:v]trim=15.1:17.9,setpts=PTS-STARTPTS[s4];[0:v]trim=18.1:20.9,setpts=PTS-STARTPTS[s5];[2:v]trim=2.05:5.0,setpts=PTS-STARTPTS[s6];[1:v]trim=7.0:9.5,setpts=PTS-STARTPTS[s7];[0:v]trim=21.05:23.45,setpts=PTS-STARTPTS[s8];[0:v]trim=23.6:26.0,setpts=PTS-STARTPTS[s9];[s1][s2][s3][s4][s5][s6][s7][s8][s9]concat=n=9:v=1:a=0,fps=24,format=yuv420p"
TMP=$(mktemp -d)
enc() { # output, width, bitrate, maxrate, bufsize
  for pass in 1 2; do
    out=/dev/null; extra=(-f mp4)
    [ $pass = 2 ] && out=$1 && extra=(-profile:v high -movflags +faststart)
    ffmpeg -y -v error -i $H -i $I -i $W -filter_complex "$FC,scale=$2:-2:flags=lanczos[v]" -map "[v]" -an \
      -c:v libx264 -preset veryfast -b:v $3 -maxrate $4 -bufsize $5 -g 48 -pass $pass -passlogfile "$TMP/pl$2" "${extra[@]}" $out
  done
}
enc public/hero/film-1080.mp4 1920 780k 1500k 3000k
enc public/hero/film-720.mp4 1280 340k 700k 1400k
rm -rf "$TMP"
