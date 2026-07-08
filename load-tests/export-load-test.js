import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";

export const options = {
  scenarios: {
    ten_users: { executor: "constant-vus", vus: 10, duration: "2m" },
    fifty_users: { executor: "constant-vus", vus: 50, duration: "3m", startTime: "2m" },
    hundred_users: { executor: "constant-vus", vus: 100, duration: "3m", startTime: "5m" },
    spike: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 500 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 0 },
      ],
      startTime: "8m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<8000", "p(99)<15000"],
  },
};

function makeSyncResult(count = Number(__ENV.EXPORT_CONTACTS || "250")) {
  const contacts = Array.from({ length: count }, (_, index) => ({
    name: `Load Test ${index}`,
    email: `load-test-${index}@example.com`,
    sourceFolder: "INBOX",
    sourceType: "Direct Email",
    forwardedBy: "",
    originalSender: "",
    subject: `Message ${index}`,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    emailCount: 1,
  }));

  return {
    folders: [{ folderPath: "INBOX", displayName: "INBOX", contacts, totalMessagesScanned: count }],
    allContacts: contacts,
    duplicatesAcrossFolders: [],
  };
}

function headers() {
  return {
    "Content-Type": "application/json",
    ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
  };
}

export default function () {
  const body = JSON.stringify({ syncResult: makeSyncResult(), filter: { mode: "all" } });

  const excel = http.post(`${BASE_URL}/api/export/excel`, body, {
    headers: headers(),
    timeout: "65s",
  });
  check(excel, { "excel export accepted": (res) => [200, 401, 413, 429, 504].includes(res.status) });

  const kit = http.post(
    `${BASE_URL}/api/kit/sync`,
    JSON.stringify({ syncResult: makeSyncResult(50), folderTagMappings: [] }),
    { headers: headers(), timeout: "125s" },
  );
  check(kit, { "kit sync accepted": (res) => [200, 400, 401, 429, 504].includes(res.status) });

  sleep(Math.random() * 5 + 2);
}
