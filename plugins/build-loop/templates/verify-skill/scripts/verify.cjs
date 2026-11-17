/**
 * Browser helpers for a verify run (template). Needs Playwright with a
 * Chromium browser. Set these for your app, or in the environment:
 *
 *   VERIFY_URL        the app's base URL           (default http://localhost:8000)
 *   VERIFY_PASSWORD   the seed users' password     (default "password", synthetic only)
 *   VERIFY_STATE      where sessions and screenshots go (default .verify, git-ignore it)
 *
 *   const v = require(require('path').resolve('<skill dir>/scripts/verify.cjs'));
 *   const run = v.run('invites');
 *   const s = await v.open('owner@example.com');
 *   await s.page.goto(v.url('/settings'));
 *   await run.shot(s.page, 'settings');
 *   run.check(s);
 *   await s.browser.close();
 *   run.done();
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.VERIFY_URL || 'http://localhost:8000';
const PASSWORD = process.env.VERIFY_PASSWORD || 'password';
const STATE = path.resolve(process.env.VERIFY_STATE || '.verify');

// Adjust to your sign-in page.
const LOGIN_PATH = '/login';
const AFTER_LOGIN_PATH = '/';
const EMAIL_FIELD = 'input[name=email]';
const PASSWORD_FIELD = 'input[name=password]';
const SUBMIT = 'button[type=submit]';

const url = (p = '/') => BASE + p;

/**
 * Sign in a seed user and return the page with the errors that it
 * collects: page errors, console errors, and HTTP >= 400.
 */
async function open(email, { width = 1440, height = 900, dark = false } = {}) {
    const browser = await chromium.launch();
    // A saved session for each user, so repeated runs do not hit the login throttle.
    const saved = email
        ? path.join(STATE, `auth-${email.replace(/[^a-z0-9]/gi, '_')}.json`)
        : null;
    const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: dark ? 'dark' : 'light',
        ...(saved && fs.existsSync(saved) ? { storageState: saved } : {}),
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
        if (m.type() === 'error') {
            errors.push(`console: ${m.text()}`);
        }
    });
    page.on('response', (r) => {
        if (r.status() >= 400) {
            errors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
        }
    });

    if (email) {
        await page.goto(url(AFTER_LOGIN_PATH));
        if (new URL(page.url()).pathname === LOGIN_PATH) {
            await page.fill(EMAIL_FIELD, email);
            await page.fill(PASSWORD_FIELD, PASSWORD);
            await page.click(SUBMIT);
            try {
                await page.waitForURL(
                    (u) => new URL(String(u)).pathname !== LOGIN_PATH,
                    { timeout: 15000 },
                );
            } catch {
                const text = (await page.locator('body').innerText()).slice(0, 300);
                throw new Error(`verify: sign-in of ${email} failed: ${text}`);
            }
            fs.mkdirSync(STATE, { recursive: true });
            await context.storageState({ path: saved });
        }
        await page.waitForLoadState('networkidle');
    }

    return { browser, page, errors };
}

/** A run: a folder for screenshots and a list of problems. */
function run(name) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dir = process.env.VERIFY_OUT || path.join(STATE, 'runs', `${stamp}-${name}`);
    fs.mkdirSync(dir, { recursive: true });
    const shots = [];
    const problems = [];

    return {
        dir,
        async shot(page, label) {
            const file = path.join(dir, `${String(shots.length + 1).padStart(2, '0')}-${label}.png`);
            await page.screenshot({ path: file, fullPage: true });
            shots.push(file);
            return file;
        },
        /** The same path at 390 px in dark mode; fails when the page scrolls sideways. */
        async shotPhone(email, p, label) {
            const s = await open(email, { width: 390, height: 844, dark: true });
            await s.page.goto(p.startsWith('http') ? p : url(p));
            await s.page.waitForLoadState('networkidle');
            const wide = await s.page.evaluate(() => document.documentElement.scrollWidth);
            if (wide > 390) {
                problems.push(`${label}: page is ${wide}px wide at 390px`);
            }
            await this.shot(s.page, label);
            this.check(s, label);
            await s.browser.close();
        },
        /** Record the errors that a session collected, then clear them. */
        check(session, label = 'page') {
            for (const error of session.errors.splice(0)) {
                problems.push(`${label}: ${error}`);
            }
        },
        fail(message) {
            problems.push(message);
        },
        /** Print the summary; exit 1 when a problem was found. */
        done() {
            console.log(`verify: ${shots.length} screenshots in ${dir}`);
            for (const p of problems) {
                console.log(`verify: PROBLEM ${p}`);
            }
            if (problems.length) {
                process.exitCode = 1;
            }
        },
    };
}

module.exports = { url, open, run };
