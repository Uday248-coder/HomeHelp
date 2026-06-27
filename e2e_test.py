"""HomeHelp E2E Tests — Backend API + Website + Admin"""
import sys
import json
from playwright.sync_api import sync_playwright

API_URL = 'https://homehelp-clbc.onrender.com'
SITE_URL = 'https://homehelp-website.vercel.app'
ADMIN_URL = 'https://homehelp-admin.vercel.app'

passed = 0
failed = 0

def test(name, condition, detail=''):
    global passed, failed
    if condition:
        passed += 1
        print(f'  PASS  {name}')
    else:
        failed += 1
        print(f'  FAIL  {name}  {detail}')

def check_api():
    print('\n[Backend API Tests]')
    import urllib.request

    # Warm-up (Render free tier cold start)
    try:
        urllib.request.urlopen(f'{API_URL}/health', timeout=15)
    except:
        pass
    import time
    time.sleep(1)

    # Health check
    try:
        resp = urllib.request.urlopen(f'{API_URL}/health', timeout=15)
        data = json.loads(resp.read())
        test('Health endpoint returns 200', resp.status == 200)
        test('Health has status field', 'status' in data)
        test('Health status is ok', data.get('status') == 'ok')
    except Exception as e:
        test('Health endpoint reachable', False, str(e))

    # OTP send (test with a test phone number)
    try:
        req = urllib.request.Request(
            f'{API_URL}/api/auth/send-otp',
            data=json.dumps({'phoneNumber': '+919999999999'}).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        test('Send OTP returns 200', resp.status == 200)
        test('Send OTP returns success message', data.get('message') == 'OTP sent')
    except urllib.error.HTTPError as e:
        test('Send OTP endpoint reachable', False, f'HTTP {e.code}: {e.read().decode()[:100]}')
    except Exception as e:
        test('Send OTP endpoint reachable', False, str(e))

    # Invalid OTP verify (should fail)
    try:
        req = urllib.request.Request(
            f'{API_URL}/api/auth/verify-otp',
            data=json.dumps({'phoneNumber': '+919999999999', 'otp': '0000'}).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        resp = urllib.request.urlopen(req, timeout=10)
        test('Invalid OTP should be rejected', False, 'verify accepted bad OTP')
    except urllib.error.HTTPError as e:
        test('Invalid OTP rejected with 401', e.code == 401, f'got {e.code}')
        data = json.loads(e.read())
        test('Invalid OTP returns error message', 'error' in data)

    # Rate limit test (send OTP 6 times rapidly should trigger rate limit)
    rate_limited = False
    for i in range(6):
        try:
            req = urllib.request.Request(
                f'{API_URL}/api/auth/send-otp',
                data=json.dumps({'phoneNumber': '+919999999998'}).encode(),
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            urllib.request.urlopen(req, timeout=10)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                rate_limited = True
                break
            else:
                pass
        except Exception:
            pass
    test('Rate limit triggers after 5 attempts', rate_limited)

    # Worker endpoints (public read)
    try:
        resp = urllib.request.urlopen(f'{API_URL}/api/workers', timeout=10)
        data = json.loads(resp.read())
        test('List workers returns 200', resp.status == 200)
        test('List workers has workers array', 'workers' in data)
    except Exception as e:
        test('List workers endpoint reachable', False, str(e))


def check_website():
    print('\n[Website Tests]')
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(SITE_URL, timeout=30000)
            page.wait_for_load_state('networkidle')
            test('Website loads successfully', True)

            title = page.title()
            test('Website has correct title', 'HomeHelp' in title, title)

            hero = page.locator('h1')
            test('Hero heading exists', hero.count() > 0)
            hero_text = hero.first.text_content()
            test('Hero mentions services or drivers', 'Home' in (hero_text or '') or 'Driver' in (hero_text or ''), (hero_text or '')[:60])
            cta_buttons = page.locator('button, a[href="#waitlist"]')
            cta_visible = cta_buttons.first.is_visible() if cta_buttons.count() > 0 else False
            test('CTA button visible', cta_visible)

            pricing_section = page.locator('#pricing')
            test('Pricing section exists', pricing_section.count() > 0)

            faq_section = page.locator('#faq, section:has-text("Frequently Asked"), h2:has-text("Frequently Asked")')
            test('FAQ section exists', faq_section.count() > 0)

            nav_links = page.locator('nav a, header a')
            test('Navigation has links', nav_links.count() >= 3)

            waitlist_form = page.locator('input[type="email"]')
            test('Waitlist email input exists', waitlist_form.count() > 0)

        except Exception as e:
            test('Website test execution', False, str(e))
        finally:
            browser.close()


def check_admin():
    print('\n[Admin Dashboard Tests]')
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(ADMIN_URL, timeout=30000)
            page.wait_for_load_state('networkidle')
            test('Admin loads successfully', True)

            title = page.title()
            test('Admin has correct title', 'HomeHelp' in title or 'Admin' in title, title)

            login_section = page.locator('text=Login, text=Phone, input[type="tel"], input[placeholder*="phone"]')
            has_login = page.locator('input').count() > 0
            test('Admin shows login form', has_login)

            login_button = page.locator('button:has-text("Send"), button:has-text("Login"), button:has-text("Verify")')
            test('Admin has login/verify button', login_button.count() > 0)

        except Exception as e:
            test('Admin test execution', False, str(e))
        finally:
            browser.close()


if __name__ == '__main__':
    print('=' * 60)
    print('HomeHelp E2E Test Suite')
    print('=' * 60)

    check_api()
    check_website()
    check_admin()

    print()
    print('=' * 60)
    print(f'Results: {passed} passed, {failed} failed, {passed + failed} total')
    print('=' * 60)
    sys.exit(1 if failed > 0 else 0)
