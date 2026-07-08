import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";

export const options = {
  scenarios: {
    ten_users: { executor: "constant-vus", vus: 10, duration: "2m", startTime: "0s" },
    fifty_users: { executor: "constant-vus", vus: 50, duration: "3m", startTime: "2m" },
    hundred_users: { executor: "constant-vus", vus: 100, duration: "3m", startTime: "5m" },
    spike_500: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 500 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 25 },
      ],
      startTime: "8m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
  },
};

export default function () {
  const headers = SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {};
  const responses = http.batch([
    ["GET", `${BASE_URL}/`, null, { headers }],
    ["GET", `${BASE_URL}/dashboard`, null, { headers }],
    ["GET", `${BASE_URL}/contacts`, null, { headers }],
    ["GET", `${BASE_URL}/api/health`, null, { headers }],
  ]);

  for (const response of responses) {
    check(response, {
      "status is not server error": (res) => res.status < 500,
    });
  }

  sleep(Math.random() * 3 + 1);
}
