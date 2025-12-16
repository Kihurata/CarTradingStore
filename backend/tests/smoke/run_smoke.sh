#!/bin/bash

BACKEND_HEALTH_URL="http://localhost:4000/health"
FRONTEND_URL="http://localhost:3000"

MAX_RETRIES=30
SLEEP_TIME=2

echo "⏳ Đang chờ các services khởi động..."

# --- HÀM KIỂM TRA ---
check_url() {
  local url=$1
  local name=$2
  local count=0

  while [ $count -lt $MAX_RETRIES ]; do
    # Lấy HTTP Code
    status=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$status" -eq 200 ]; then
      echo "✅ $name IS UP (Status 200)"
      return 0
    fi
    
    echo "Waiting for $name... (Status: $status)"
    sleep $SLEEP_TIME
    count=$((count + 1))
  done

  echo "❌ $name FAILED to start after $((MAX_RETRIES * SLEEP_TIME)) seconds."
  return 1
}

# --- CHẠY TEST ---

# 1. Kiểm tra Backend (Gọi /health -> Query DB -> Trả về 200)
if ! check_url $BACKEND_HEALTH_URL "Backend & DB"; then
  exit 1
fi

# 2. Kiểm tra Frontend (Gọi trang chủ)
if ! check_url $FRONTEND_URL "Frontend"; then
  exit 1
fi

echo "🚀 SMOKE TEST PASSED! Ready to deploy."
exit 0