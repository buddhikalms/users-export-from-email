import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";
const SAVED_ACCOUNT_ID = __ENV.SAVED_ACCOUNT_ID || "";
const FOLDERS = (__ENV.IMAP_FOLDERS || "INBOX").split(",").map((folder) => folder.trim());

export const options = {
  scenarios: {
    ten_users: { executor: "constant-vus", vus: 10, duration: "2m" },
    stress: {
      executor: "ramping-vus",
      startTime: "2m",
      stages: [
        { duration: "1m", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "1m", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<10000"],
  },
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
  };
}

export default function () {
  const accountPayload = SAVED_ACCOUNT_ID
    ? { savedAccountId: SAVED_ACCOUNT_ID }
    : {
        settings: {
          email: __ENV.IMAP_EMAIL,
          host: __ENV.IMAP_HOST || "outlook.office365.com",
          port: Number(__ENV.IMAP_PORT || "993"),
          security: __ENV.IMAP_SECURITY || "ssl_tls",
          username: __ENV.IMAP_USERNAME,
          password: __ENV.IMAP_PASSWORD,
          rememberPassword: false,
        },
      };

  const folders = http.post(
    `${BASE_URL}/api/imap/folders`,
    JSON.stringify(accountPayload),
    { headers: authHeaders(), timeout: "35s" },
  );
  check(folders, { "folders accepted": (res) => [200, 400, 401, 429].includes(res.status) });

  const sync = http.post(
    `${BASE_URL}/api/imap/sync`,
    JSON.stringify({ ...accountPayload, folders: FOLDERS }),
    { headers: authHeaders(), timeout: "125s" },
  );
  check(sync, { "sync accepted": (res) => [200, 400, 401, 429, 504].includes(res.status) });

  sleep(5);
}
