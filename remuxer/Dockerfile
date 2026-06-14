from rust:1.94.1-slim as plugin-builder

run apt update && apt install -y git libssl-dev pkg-config libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
run cargo install cargo-c

run git clone https://github.com/GStreamer/gst-plugins-rs.git && cd gst-plugins-rs && git checkout -b 0.15.1
run cd gst-plugins-rs && cargo cbuild -p gst-plugin-aws && cargo cinstall -p gst-plugin-aws --prefix=/out

from rust:1.94.1-slim as builder

ENV GST_PLUGIN_PATH=/gst-plugins
copy --from=plugin-builder /out /gst-plugins
run apt update && apt install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav libssl-dev

run cargo install cargo-watch

copy Cargo.toml /source/Cargo.toml
copy Cargo.lock /source/Cargo.lock
copy src /source/src

run cd /source && cargo build --release

expose 1935
cmd cd /source && cargo watch -x run

from debian:stable-slim 

run apt update && apt install -y libgstreamer1.0 libgstreamer-plugins-base1.0 gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav

ENV GST_PLUGIN_PATH=/gst-plugins
copy --from=plugin-builder /out /gst-plugins
copy --from=builder /source/target/release /app

expose 1935
cmd cd /app && ./remuxer
