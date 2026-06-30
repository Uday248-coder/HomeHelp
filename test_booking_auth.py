from playwright.sync_api import sync_playwright
import time

def test_booking_auth():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        print("Navigating to booking page...")
        page.goto('http://localhost:3000/book')
        page.wait_for_load_state('networkidle')
        
        # Step 0: Select Mode
        print("Selecting mode: Home Help...")
        # Look for the button containing "Home Help"
        page.get_by_text("Home Help").first.click()
        page.get_by_role("button", name="Continue →").click()
        
        # Step 1: Service Details
        page.wait_for_load_state('networkidle')
        print("Filling service details...")
        # Select service
        page.locator('select').select_option(index=1) 
        # Enter address
        page.locator('textarea').fill("123 Main St, Kolkata")
        page.get_by_role("button", name="Continue →").click()
        
        # Step 2: Phone + OTP
        page.wait_for_load_state('networkidle')
        print("Entering phone number...")
        # The phone input is the one with placeholder "9876543210"
        page.get_by_placeholder("9876543210").fill("9876543210")
        
        print("Clicking Send OTP...")
        page.get_by_role("button", name="Send OTP").click()
        
        # Give it some time to process and show error if any
        page.wait_for_timeout(5000)
        
        # Check for error messages
        content = page.content()
        if "auth/argument-error" in content:
            print("❌ FAILED: Found 'auth/argument-error' in page content!")
            page.screenshot(path='auth_error.png')
            browser.close()
            exit(1)
        elif "OTP sent" in content or "Verify your number" in content:
            print("✅ SUCCESS: No 'auth/argument-error' found. OTP process seems to have triggered.")
        else:
            print("⚠️ UNKNOWN: Neither error nor success message found. Checking for other errors...")
            # Look for any red error boxes
            errors = page.locator('[role="alert"]').all_text_contents()
            for err in errors:
                print(f"Found error: {err}")
            if errors:
                browser.close()
                exit(1)
        
        browser.close()

if __name__ == "__main__":
    test_booking_auth()
