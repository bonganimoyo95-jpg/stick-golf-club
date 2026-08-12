import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

const root = import.meta.dirname;
const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const gameSource = await readFile(resolve(root, "game.js"), "utf8");

assert.match(html, /<meta property="og:image" content="https:\/\/stickgolf\.club\/assets\/stick-social-card\.jpg">/);
assert.match(html, /<meta property="og:image:width" content="1200">/);
assert.match(html, /<meta property="og:image:height" content="630">/);
assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
assert.match(html, /Want to play Augusta’s famous Amen Corner\?/);
assert.match(html, /id="swingMeter"/);
assert.match(html, /id="clubName"/);
assert.match(css, /@media \(max-width: 820px\)/);
assert.match(css, /\.game-frame\.is-open/);
assert.match(gameSource, /state\.phase = "power"/);
assert.match(gameSource, /state\.phase = "accuracy"/);
assert.match(gameSource, /club\.teeOnly/);

const localReferences = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)]
  .map(match => match[1])
  .filter(value => !/^(?:https?:|mailto:)/.test(value))
  .map(value => value.replace(/^\.\//, ""));

for (const reference of localReferences) {
  await access(resolve(root, reference));
}

const socialCard = await stat(resolve(root, "assets/stick-social-card.jpg"));
assert.ok(socialCard.size > 10_000, "social card should be a real 1200×630 image");
assert.equal((await readFile(resolve(root, "CNAME"), "utf8")).trim(), "stickgolf.club");

function boot(matchesMobile) {
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://stickgolf.club/",
    pretendToBeVisual: true
  });
  const { window } = dom;
  const gradient = { addColorStop() {} };
  const context = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === "createLinearGradient" || key === "createRadialGradient") return () => gradient;
      if (key === "measureText") return text => ({ width: String(text).length * 8 });
      return () => {};
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });

  window.HTMLCanvasElement.prototype.getContext = () => context;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.requestAnimationFrame = () => 1;
  window.cancelAnimationFrame = () => {};
  window.setTimeout = callback => {
    callback();
    return 1;
  };
  window.clearTimeout = () => {};
  window.matchMedia = () => ({
    matches: matchesMobile,
    media: "(max-width: 820px)",
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });

  const marker = "  resetRound();\n  requestAnimationFrame(gameLoop);";
  assert.ok(gameSource.includes(marker), "test hook marker must remain stable");
  const instrumented = gameSource.replace(marker, `  resetRound();
  window.__stickTest = {
    state: () => state,
    resetRound,
    available: () => availableClubs().map(club => club.id),
    recommend: selectRecommendedClub,
    swingAction,
    shotPlan
  };
  requestAnimationFrame(gameLoop);`);
  window.eval(instrumented);
  return { dom, window, test: window.__stickTest };
}

{
  const { dom, window, test } = boot(false);
  assert.equal(window.document.querySelector("#gameInvite").classList.contains("is-open"), false);
  assert.equal(test.state().club.id, "driver", "Hole 11 should recommend Driver from the tee");

  test.state().lie = "fairway";
  test.recommend();
  assert.ok(!test.available().includes("driver"), "Driver must not be available from the fairway");

  test.state().lie = "rough";
  test.recommend();
  assert.ok(!test.available().includes("driver"), "Driver must not be available from the rough");
  assert.ok(!test.available().includes("3w"), "3 Wood must not be available from the rough");

  test.resetRound();
  test.state().powerLocked = 96;
  test.state().impactLocked = 50;
  const pure = test.shotPlan();
  test.state().impactLocked = 12;
  const hook = test.shotPlan();
  assert.ok(Math.abs(hook.end.x - pure.end.x) > 10, "missing the impact lines must create a wayward shot");

  test.resetRound();
  test.swingAction();
  assert.equal(test.state().phase, "power");
  test.state().meter = 95;
  test.swingAction();
  assert.equal(test.state().phase, "accuracy");
  test.state().meter = 50;
  test.swingAction();
  assert.equal(test.state().phase, "flight");
  assert.equal(test.state().shots, 1);
  dom.window.close();
}

{
  const { dom, window } = boot(true);
  const invite = window.document.querySelector("#gameInvite");
  const frame = window.document.querySelector("#gameFrame");
  assert.ok(invite.classList.contains("is-open"), "mobile visitors should receive the Amen Corner invitation");
  window.document.querySelector("#inviteAccept").click();
  assert.ok(!invite.classList.contains("is-open"));
  assert.ok(frame.classList.contains("is-open"), "accepting should transport the visitor into the game");
  window.document.querySelector("#gameClose").click();
  assert.ok(!frame.classList.contains("is-open"), "the mobile game must be dismissible");
  dom.window.close();
}

console.log("STICK site, game mechanics, mobile invitation and social metadata validated.");
