import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";

export const options = {
  vus: 1,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

function headers() {
  return SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {};
}

export default function () {
  for (const path of ["/", "/dashboard", "/api/health"]) {
    const response = http.get(`${BASE_URL}${path}`, { headers: headers() });
    check(response, {
      [`${path} responded`]: (res) => res.status < 500,
    });
    sleep(1);
  }
}
