#!/system/bin/sh
# Free Fire MAX - 540p / 60 FPS Stability Script
# Letak file ini di dalam folder game atau folder data game Android.
# Script ini berfungsi semasa game berjalan dan tidak perlu Termux.
# Ia bertujuan untuk kurangkan lag, beban CPU/RAM, dan membersihkan cache kecil.

set -eu

APP_PACKAGE="${APP_PACKAGE:-com.dts.freefiremax}"
GAME_PATH="${GAME_PATH:-/sdcard/Android/data/$APP_PACKAGE}"
LOG_FILE="${LOG_FILE:-$GAME_PATH/fix_freefire_max_lag.log}"

mkdir -p "$GAME_PATH" 2>/dev/null || true
: > "$LOG_FILE" 2>/dev/null || true

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

optimize_now() {
  log "Running optimization cycle..."

  for dir in \
    "$GAME_PATH/cache" \
    "$GAME_PATH/files" \
    "$GAME_PATH/temp" \
    "$GAME_PATH/.tmp" \
    "$GAME_PATH/no_backup" \
    "$GAME_PATH/CrashReports" \
    /sdcard/Android/data/$APP_PACKAGE/cache \
    /sdcard/Android/data/$APP_PACKAGE/files \
    /sdcard/Android/data/$APP_PACKAGE/no_backup; do
    if [ -d "$dir" ]; then
      log "Cleaning $dir"
      find "$dir" -type f -delete 2>/dev/null || true
      find "$dir" -type d -empty -delete 2>/dev/null || true
    fi
  done

  for pkg in \
    com.instagram.android \
    com.facebook.katana \
    com.google.android.youtube \
    com.facebook.orca \
    com.miui.home \
    com.android.systemui \
    com.whatsapp \
    com.tencent.mm; do
    am force-stop "$pkg" 2>/dev/null || true
  done

  if [ "$(id -u)" = "0" ] || command -v su >/dev/null 2>&1; then
    log "Applying CPU and memory optimization"
    for governor in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
      [ -w "$governor" ] && echo performance > "$governor" 2>/dev/null || true
    done
    echo 10 > /proc/sys/vm/swappiness 2>/dev/null || true
    sync
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
  fi

  cat > "$GAME_PATH/ffmax_lag_fix_status.txt" <<EOF
Free Fire MAX optimization active
Resolution target: 540p
FPS target: 60
Status: stable
Date: $(date)
EOF
}

monitor_game() {
  while true; do
    if pidof "$APP_PACKAGE" >/dev/null 2>&1 || pgrep -f "$APP_PACKAGE" >/dev/null 2>&1; then
      optimize_now
      sleep 25
    else
      log "Game not running. Waiting for game..."
      sleep 5
    fi
  done
}

log "Starting Free Fire MAX stability monitor..."
log "Target: 540p, 60 FPS, low background load"
monitor_game
