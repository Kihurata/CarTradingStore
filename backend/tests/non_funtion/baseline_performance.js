import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://cartrading-frontend.onrender.com/";

// ✅ Sửa lại path theo hệ thống của bạn
const PATHS = {
  home: "/",
  list: "/listings?page=1",
  detail: "/listings/1", // nếu không có id=1 thì sửa
  health: "/health",     // nếu không có thì đổi thành "/api/health" hoặc bỏ
};

export const options = {
  scenarios: {
    baseline: {
      executor: "constant-vus",
      vus: 3,
      duration: "1m",
      gracefulStop: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],     // < 1% lỗi
    http_req_duration: ["p(95)<1200"],  // p95 < 1.2s
  },
};

function hitGet(name, path) {
  const res = http.get(`${BASE_URL}${path}`, {
    tags: { name },
  });

  check(res, {
    [`${name} status 2xx/3xx`]: (r) => r.status >= 200 && r.status < 400,
  });

  return res;
}

export default function () {
  hitGet("HOME", PATHS.home);
  sleep(1);

  hitGet("LIST", PATHS.list);
  sleep(1);

  hitGet("DETAIL", PATHS.detail);
  sleep(1);

}
