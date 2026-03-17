const fs = require("fs");

const QA_URL = "http://127.0.0.1:4173/";
const DEBUG_VERSION_URL = "http://127.0.0.1:9222/json/version";
const SCREENSHOTS = [390, 520, 680, 920, 1440];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function once(target, event) {
  return new Promise((resolve) => target.addEventListener(event, resolve, { once: true }));
}

async function main() {
  const version = await fetch(DEBUG_VERSION_URL).then((response) => response.json());
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await once(ws, "open");

  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data.toString());

    if (msg.id) {
      const callbacks = pending.get(msg.id);
      if (!callbacks) {
        return;
      }

      pending.delete(msg.id);

      if (msg.error) {
        callbacks.reject(new Error(msg.error.message));
      } else {
        callbacks.resolve(msg.result || {});
      }

      return;
    }

    const key = `${msg.sessionId || "browser"}:${msg.method}`;
    const waiters = listeners.get(key);

    if (waiters?.length) {
      const waiter = waiters.shift();
      waiter(msg.params || {});
    }
  });

  function send(method, params = {}, sessionId) {
    const payload = { id: ++nextId, method, params };

    if (sessionId) {
      payload.sessionId = sessionId;
    }

    ws.send(JSON.stringify(payload));

    return new Promise((resolve, reject) => {
      pending.set(payload.id, { resolve, reject });
    });
  }

  function waitFor(method, sessionId, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const key = `${sessionId || "browser"}:${method}`;
      const waiters = listeners.get(key) || [];
      listeners.set(key, waiters);

      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${key}`));
      }, timeout);

      waiters.push((params) => {
        clearTimeout(timer);
        resolve(params);
      });
    });
  }

  async function evaluate(expression, sessionId) {
    const { result } = await send(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
      sessionId
    );

    return result.value;
  }

  async function setViewport(width, height, sessionId) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width <= 520,
        screenWidth: width,
        screenHeight: height
      },
      sessionId
    );
  }

  async function navigate(url, sessionId) {
    const loaded = waitFor("Page.loadEventFired", sessionId, 15000);
    await send("Page.navigate", { url }, sessionId);
    await loaded;
    await delay(700);
  }

  async function capture(name, sessionId) {
    const { data } = await send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true, fromSurface: true },
      sessionId
    );
    const file = `/tmp/${name}.png`;
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    return file;
  }

  async function pressKey(key, codeName, keyCode, sessionId) {
    await send(
      "Input.dispatchKeyEvent",
      { type: "rawKeyDown", key, code: codeName, windowsVirtualKeyCode: keyCode },
      sessionId
    );
    await send(
      "Input.dispatchKeyEvent",
      { type: "keyUp", key, code: codeName, windowsVirtualKeyCode: keyCode },
      sessionId
    );
    await delay(120);
  }

  async function pressTab(times, sessionId) {
    for (let index = 0; index < times; index += 1) {
      await pressKey("Tab", "Tab", 9, sessionId);
    }
  }

  async function activeSummary(sessionId) {
    return evaluate(
      `(() => {
        const el = document.activeElement;
        if (!el) return null;
        return {
          tag: el.tagName,
          id: el.id || null,
          className: typeof el.className === "string" ? el.className : null,
          href: el.getAttribute("href"),
          ariaLabel: el.getAttribute("aria-label"),
          text: (el.innerText || el.textContent || "")
            .trim()
            .replace(/\\s+/g, " ")
            .slice(0, 120)
        };
      })()`,
      sessionId
    );
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("DOM.enable", {}, sessionId);

  const report = { responsive: [], keyboard: {} };

  for (const width of SCREENSHOTS) {
    const height = width >= 1440 ? 2600 : 2200;
    await setViewport(width, height, sessionId);
    await navigate(QA_URL, sessionId);
    const screenshot = await capture(`landing-${width}`, sessionId);
    const layout = await evaluate(
      `(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        menuToggleVisible:
          getComputedStyle(document.querySelector(".site-header__menu-toggle")).display !== "none",
        resultsTabsWraps: (() => {
          const el = document.querySelector(".results-tabs");
          return el ? el.scrollWidth > el.clientWidth + 1 : null;
        })()
      }))()`,
      sessionId
    );

    report.responsive.push({ width, screenshot, ...layout });
  }

  await setViewport(390, 844, sessionId);
  await navigate(QA_URL, sessionId);
  report.keyboard.mobileTabOrder = [];

  await pressTab(1, sessionId);
  report.keyboard.mobileTabOrder.push(await activeSummary(sessionId));
  await pressTab(1, sessionId);
  report.keyboard.mobileTabOrder.push(await activeSummary(sessionId));
  await pressTab(1, sessionId);
  report.keyboard.mobileTabOrder.push(await activeSummary(sessionId));

  await pressKey("Enter", "Enter", 13, sessionId);
  report.keyboard.mobileMenuOpened = await evaluate(
    `(() => ({
      expanded: document.querySelector(".site-header__menu-toggle")?.getAttribute("aria-expanded"),
      hidden: document.getElementById("siteHeaderMenu")?.getAttribute("aria-hidden")
    }))()`,
    sessionId
  );

  await pressTab(1, sessionId);
  report.keyboard.mobileMenuFirstLink = await activeSummary(sessionId);

  await pressKey("Escape", "Escape", 27, sessionId);
  report.keyboard.mobileMenuClosed = await evaluate(
    `(() => ({
      expanded: document.querySelector(".site-header__menu-toggle")?.getAttribute("aria-expanded"),
      hidden: document.getElementById("siteHeaderMenu")?.getAttribute("aria-hidden"),
      activeClass: document.activeElement?.className || null
    }))()`,
    sessionId
  );

  await setViewport(1440, 1200, sessionId);
  await navigate(QA_URL, sessionId);
  report.keyboard.heroCtaSequence = [];

  for (let index = 0; index < 12; index += 1) {
    await pressTab(1, sessionId);
    const active = await activeSummary(sessionId);
    report.keyboard.heroCtaSequence.push(active);

    if (active?.className?.includes("hero__cta")) {
      break;
    }
  }

  await evaluate(`document.querySelector('a[href="#results"]')?.focus()`, sessionId);
  await pressKey("Enter", "Enter", 13, sessionId);
  await delay(300);
  report.keyboard.anchorNavigation = await evaluate(
    `(() => {
      const section = document.getElementById("results");
      return {
        hash: location.hash,
        top: section ? Math.round(section.getBoundingClientRect().top) : null
      };
    })()`,
    sessionId
  );

  await evaluate(`document.getElementById("resultsTab-cream")?.focus()`, sessionId);
  report.keyboard.resultsBefore = await evaluate(
    `(() => ({
      activeId: document.activeElement?.id || null,
      selected: document.querySelector('.results-tab[aria-selected="true"]')?.id || null,
      labelledBy: document.getElementById("resultsTabPanel")?.getAttribute("aria-labelledby") || null,
      score: document.getElementById("resultsScoreValue")?.textContent?.trim() || null
    }))()`,
    sessionId
  );

  await pressKey("ArrowRight", "ArrowRight", 39, sessionId);
  report.keyboard.resultsAfterArrow = await evaluate(
    `(() => ({
      activeId: document.activeElement?.id || null,
      selected: document.querySelector('.results-tab[aria-selected="true"]')?.id || null,
      labelledBy: document.getElementById("resultsTabPanel")?.getAttribute("aria-labelledby") || null,
      score: document.getElementById("resultsScoreValue")?.textContent?.trim() || null
    }))()`,
    sessionId
  );

  await evaluate(`window.scrollTo({ top: 2200, behavior: "instant" })`, sessionId);
  await delay(300);
  report.keyboard.floatingCta = await evaluate(
    `(() => {
      const wrap = document.querySelector(".floating-telegram");
      const link = document.querySelector(".floating-telegram__link");
      const style = wrap ? getComputedStyle(wrap) : null;
      return {
        ariaHidden: wrap?.getAttribute("aria-hidden") || null,
        opacity: style?.opacity || null,
        pointerEvents: style?.pointerEvents || null,
        tabIndex: link?.tabIndex ?? null,
        text: (link?.innerText || link?.textContent || "")
          .trim()
          .replace(/\\s+/g, " ")
      };
    })()`,
    sessionId
  );

  fs.writeFileSync("/tmp/landing-qa-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  await send("Target.closeTarget", { targetId });
  ws.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
