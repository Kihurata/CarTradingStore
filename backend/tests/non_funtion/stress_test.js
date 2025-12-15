import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://cartrading-frontend.onrender.com/";

const PATHS = {
  home: "/",
  list: "/listings?page=1",
  detail: "/listings/1",
  health: "/health",
};

export const options = {
  scenarios: {
    stress_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 },
        { duration: "1m", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 150 }, // vượt tải
        { duration: "1m", target: 200 }, // cực đoan hơn
        { duration: "1m", target: 0 },   // giảm để xem có phục hồi không
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    // Stress: thường chấp nhận fail cao hơn, mục tiêu là quan sát phản ứng
    http_req_failed: ["rate<0.10"],     // < 10% (có thể hạ/tăng)
    http_req_duration: ["p(95)<3000"],  // p95 < 3s (ngưỡng nhóm tự đề xuất)
  },
};

function hitGet(name, path) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { name } });

  check(res, {
    [`${name} status not 5xx (preferred)`]: (r) => r.status < 500, // stress vẫn cố hạn chế 5xx
  });

  return res;
}

export default function () {
  hitGet("HOME", PATHS.home);
  sleep(0.5);

  hitGet("LIST", PATHS.list);
  sleep(0.5);

  hitGet("DETAIL", PATHS.detail);
  sleep(0.5);

}
