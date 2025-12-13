import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://cartrading-frontend.onrender.com/"; //url deploy, thay đổi nếu test local

const PATHS = {
  home: "/",
  list: "/listings?page=1",
  detail: "/listings/1", // load listingspage detail 1 or 2 đều được
};

export const options = {
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 10 },
        { duration: "2m", target: 30 },
        { duration: "3m", target: 50 }, // tải dự kiến
        { duration: "2m", target: 50 }, // giữ tải
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"], // load nhẹ hơn baseline_performance
  },
};

function hitGet(name, path) {
  const res = http.get(`${BASE_URL}${path}`, { tags: { name } });

  check(res, {
    [`${name} status 2xx/3xx`]: (r) => r.status >= 200 && r.status < 400,
  });

  return res;
}

export default function () {
  hitGet("HOME", PATHS.home);
  sleep(1);

  hitGet("LIST", PATHS.list);
  sleep(2);

  hitGet("DETAIL", PATHS.detail);
  sleep(2);
}
