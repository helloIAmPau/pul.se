gst-launch-1.0 -v flvmux name=mux streamable=true ! rtmpsink location="rtmp://localhost/fdcae395-a464-4e2d-a117-842400c39d2c/55545476-9a50-4ac8-93aa-6356e9f252e8" \
    videotestsrc is-live=true ! video/x-raw,width=1280,height=720,framerate=30/1 ! \
    x264enc bitrate=2500 speed-preset=veryfast tune=zerolatency key-int-max=60 ! video/x-h264,profile=main ! queue ! mux. \
    audiotestsrc is-live=true wave=sine freq=440 ! audio/x-raw,rate=44100,channels=2 ! \
    avenc_aac bitrate=128000 ! aacparse ! queue ! mux.
