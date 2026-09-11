import { spawn } from "child_process";
import WebSocket from "ws";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CLIENT_PORT = 5173;
const BASE_URL = `http://localhost:${CLIENT_PORT}`;

const PAGES = [
  { path: "/", name: "Home Page" },
  { path: "/products", name: "Products Catalog" },
  { path: "/product/safepro-4kg-abc-powder-extinguisher", name: "Product Detail" },
  { path: "/cart", name: "Shopping Cart" },
  { path: "/wishlist", name: "Wishlist" },
  { path: "/login", name: "Login" },
  { path: "/register", name: "Register" },
  { path: "/forgot-password", name: "Forgot Password" },
  { path: "/services", name: "Services Hub" },
  { path: "/services/amc", name: "AMC Service" },
  { path: "/services/refilling", name: "Refilling Service" },
  { path: "/services/fire-safety-audit", name: "Safety Audit Service" },
  { path: "/book-service", name: "Service Booking Wizard" },
  { path: "/request-quote", name: "B2B Quotation Wizard" },
  { path: "/about", name: "About Us" },
  { path: "/contact", name: "Contact & Emergency" },
  { path: "/faq", name: "FAQ" },
  { path: "/gallery", name: "Installation Gallery" },
  { path: "/blog", name: "Knowledge Base / Blog" },
  { path: "/search", name: "Global Search" },
];

const VIEWPORTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 375, height: 667 },
];

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.failedRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        } else if (msg.method) {
          this.handleEvent(msg.method, msg.params);
        }
      };
    });
  }

  handleEvent(method, params) {
    if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      const text = params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(" ");
      this.consoleErrors.push(text);
    }
    if (method === "Network.responseReceived") {
      const { status, url } = params.response;
      if (status >= 400 && !url.includes("/favicon.ico") && !url.includes(".png") && !url.includes(".jpg")) {
        this.failedRequests.push({ status, url });
      }
    }
    if (method === "Network.loadingFailed") {
      if (!params.blockedReason && !params.errorText?.includes("ABORTED")) {
        this.failedRequests.push({ status: "FAILED", url: params.requestId, reason: params.errorText });
      }
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("==================================================");
  console.log("   LAUNCHING REAL CHROME BROWSER AUDIT            ");
  console.log("==================================================\n");

  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-web-security",
    "--hide-scrollbars",
  ]);

  await sleep(1500);

  let versionData;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch("http://localhost:9222/json/version");
      versionData = await res.json();
      break;
    } catch {
      await sleep(500);
    }
  }

  if (!versionData) {
    console.error("Failed to connect to Chrome DevTools port!");
    chromeProc.kill();
    process.exit(1);
  }

  console.log(`Connected to Chrome: ${versionData["User-Agent"]}`);
  console.log(`WebSocket URL: ${versionData.webSocketDebuggerUrl}\n`);

  const listRes = await fetch("http://localhost:9222/json");
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === "page") || targets[0];

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");

  const auditResults = [];

  // Audit each page across Desktop, Tablet, Mobile
  for (const page of PAGES) {
    const pageUrl = `${BASE_URL}${page.path}`;
    client.consoleErrors = [];
    client.failedRequests = [];

    // Navigate to page and wait for rendering
    await client.send("Page.navigate", { url: pageUrl });
    await sleep(1500);

    // Scroll down and up to allow lazy images and layout to settle
    await client.send("Runtime.evaluate", {
      expression: `window.scrollTo(0, 400); setTimeout(() => window.scrollTo(0, 0), 200);`,
    });
    await sleep(600);

    // Evaluate DOM health
    const evalRes = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const title = document.title;
        const h1 = document.querySelector('h1')?.innerText || '';
        const brokenImages = Array.from(document.querySelectorAll('img'))
          .filter(img => img.complete && img.naturalWidth === 0 && img.src && !img.src.includes('data:'))
          .map(img => img.src);
        const navLinks = Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter(h => h && h.startsWith('/'));
        return { title, h1, brokenImagesCount: brokenImages.length, brokenImages, navCount: navLinks.length };
      })()`,
      returnByValue: true,
    });

    const domInfo = evalRes.result?.value || {};
    const hasErrors = client.consoleErrors.length > 0;
    const hasFailedReqs = client.failedRequests.length > 0;
    const hasBrokenImgs = (domInfo.brokenImagesCount || 0) > 0;

    const pass = !hasErrors && !hasFailedReqs && !hasBrokenImgs;
    auditResults.push({
      page: page.name,
      path: page.path,
      title: domInfo.title,
      h1: domInfo.h1,
      pass,
      errors: client.consoleErrors,
      failedRequests: client.failedRequests,
      brokenImages: domInfo.brokenImages,
    });

    const statusMark = pass ? "✓ PASS" : "✗ FAIL";
    console.log(`${statusMark} [${page.name}] ${page.path} | Title: "${domInfo.title}" | H1: "${domInfo.h1.slice(0, 30)}"`);
    if (client.consoleErrors.length > 0) {
      console.log(`    Console Errors: ${client.consoleErrors.join("; ")}`);
    }
    if (client.failedRequests.length > 0) {
      console.log(`    Failed Requests: ${JSON.stringify(client.failedRequests)}`);
    }
  }

  // Viewport Responsiveness Checks
  console.log("\n--- TESTING RESPONSIVE VIEWPORTS ---");
  for (const vp of VIEWPORTS) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.name === "Mobile",
    });
    await client.send("Page.navigate", { url: `${BASE_URL}/` });
    await sleep(1500);

    const vpCheck = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const bodyWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = bodyWidth > windowWidth + 5;
        const header = !!document.querySelector('header');
        const footer = !!document.querySelector('footer');
        return { hasHorizontalOverflow, bodyWidth, windowWidth, header, footer };
      })()`,
      returnByValue: true,
    });

    const vpInfo = vpCheck.result?.value || {};
    const pass = !vpInfo.hasHorizontalOverflow && vpInfo.header && vpInfo.footer;
    console.log(`${pass ? "✓ PASS" : "✗ FAIL"} [Viewport: ${vp.name} (${vp.width}x${vp.height})] Overflow: ${vpInfo.hasHorizontalOverflow ? 'YES (Defect)' : 'NO (Clean)'} | Header: ${vpInfo.header} | Footer: ${vpInfo.footer}`);
  }

  client.close();
  chromeProc.kill();

  console.log("\n==================================================");
  const total = auditResults.length;
  const passed = auditResults.filter((r) => r.pass).length;
  const failed = total - passed;
  console.log(`PAGES AUDITED: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    console.log("\nFAILED PAGES DETAILS:");
    auditResults.filter((r) => !r.pass).forEach((r) => {
      console.log(`- ${r.page} (${r.path}):`);
      if (r.errors.length) console.log(`  Console Errors: ${r.errors.join("; ")}`);
      if (r.failedRequests.length) console.log(`  Failed Reqs: ${JSON.stringify(r.failedRequests)}`);
      if (r.brokenImages.length) console.log(`  Broken Imgs: ${r.brokenImages.join("; ")}`);
    });
  }
}

main().catch((err) => {
  console.error("Error in browser audit:", err);
  process.exit(1);
});
