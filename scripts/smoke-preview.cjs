#!/usr/bin/env node
/* eslint-disable no-console */

const baseArg = process.argv[2] || process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const baseUrl = baseArg.replace(/\/+$/, "");

const coreRoutes = [
  "/",
  "/about",
  "/properties",
  "/regions",
  "/blog",
  "/guides",
  "/premium",
  "/contact",
  "/process",
  "/faq",
  "/api/content",
  "/api/public-articles",
];

const apiExpectations = [
  { method: "GET", path: "/api/payments/session", expected: [400] },
  { method: "GET", path: "/api/payments/download", expected: [400] },
  { method: "GET", path: "/api/payments/checkout", expected: [405] },
  { method: "GET", path: "/api/free-pdf/upsell", expected: [405] },
  { method: "POST", path: "/api/free-pdf/upsell", expected: [200], body: "{}" },
  { method: "GET", path: "/api/marketing-consent", expected: [405] },
  { method: "POST", path: "/api/marketing-consent", expected: [401], body: "{}" },
  { method: "GET", path: "/api/public-articles/non-existent-slug-test", expected: [404] },
  { method: "GET", path: "/api/cron/alerts", expected: [401] },
  { method: "GET", path: "/api/cron/follow-up", expected: [401] },
];

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, options);
  return { status: res.status, url, res };
}

function print(kind, status, url, note = "") {
  if (note) {
    console.log(`${kind}\t${status}\t${url}\t${note}`);
    return;
  }
  console.log(`${kind}\t${status}\t${url}`);
}

async function run() {
  let failures = 0;
  console.log(`SMOKE_BASE\t${baseUrl}`);

  for (const path of coreRoutes) {
    try {
      const { status, url } = await request(path);
      if (status === 200) {
        print("OK", status, url);
      } else {
        failures += 1;
        print("FAIL", status, url, "expected 200");
      }
    } catch (error) {
      failures += 1;
      print("ERROR", "-", `${baseUrl}${path}`, error.message);
    }
  }

  for (const t of apiExpectations) {
    try {
      const options = { method: t.method };
      if (t.method === "POST") {
        options.headers = { "content-type": "application/json" };
        options.body = t.body || "{}";
      }
      const { status, url } = await request(t.path, options);
      if (t.expected.includes(status)) {
        print("OK", status, url, `expected ${t.expected.join("|")}`);
      } else {
        failures += 1;
        print("FAIL", status, url, `expected ${t.expected.join("|")}`);
      }
    } catch (error) {
      failures += 1;
      print("ERROR", "-", `${baseUrl}${t.path}`, error.message);
    }
  }

  try {
    const contentResp = await request("/api/content");
    if (contentResp.status === 200) {
      const json = await contentResp.res.json();
      const rawSlug = json?.properties?.[0]?.slug;
      const propertySlug =
        typeof rawSlug === "string" ? rawSlug : rawSlug && typeof rawSlug.current === "string" ? rawSlug.current : null;
      if (propertySlug) {
        const propertyResp = await request(`/properties/${propertySlug}`);
        if (propertyResp.status === 200) {
          print("OK", propertyResp.status, propertyResp.url, "dynamic property route");
        } else {
          failures += 1;
          print("FAIL", propertyResp.status, propertyResp.url, "expected 200 dynamic property route");
        }
      } else {
        print("WARN", "-", `${baseUrl}/api/content`, "no property slug found for dynamic route check");
      }
    } else {
      failures += 1;
      print("FAIL", contentResp.status, contentResp.url, "cannot resolve dynamic route seed");
    }
  } catch (error) {
    failures += 1;
    print("ERROR", "-", `${baseUrl}/api/content`, `dynamic route check failed: ${error.message}`);
  }

  if (failures > 0) {
    console.log(`SMOKE_SUMMARY\tFAIL\tfailures=${failures}`);
    process.exit(1);
  }

  console.log("SMOKE_SUMMARY\tPASS\tfailures=0");
}

run().catch((error) => {
  console.error(`SMOKE_FATAL\t${error.message}`);
  process.exit(1);
});
