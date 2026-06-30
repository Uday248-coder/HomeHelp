import subprocess
import time
import os
import signal
from playwright.sync_api import sync_playwright

def run_test():
    # Start Backend
    print("Starting Backend API...")
    api_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="services/api",
        shell=True
    )
    
    # Start Frontend
    print("Starting Website...")
    web_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="apps/website",
        shell=True
    )
    
    try:
        # Wait for servers to boot
        print("Waiting for servers to start (30s)...")
        time.sleep(30)
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            print("Navigating to booking page...")
            page.goto('http://localhost:3000/book')
            page.wait_for_load_state('networkidle')
            
            print("Selecting mode: Home Help...")
            page.get_by_text("Home Help").first.click()
            page.get_by_role("button", name="Continue →").click()
            
            page.wait_for_load_state('networkidle')
            print("Filling service details...")
            page.locator('select').select_option(index=1) 
            page.locator('textarea').fill("123 Main St, Kolkata")
            page.get_by_role("button", name="Continue →").click()
            
            page.wait_for_load_state('networkidle')
            print("Entering phone number...")
            page.get_by_placeholder("9876543210").fill("9876543210")
            
            print("Clicking Send OTP...")
            page.get_by_role("button", name="Send OTP").click()
            
            page.wait_for_timeout(5000)
            
            content = page.content()
            if "auth/argument-error" in content:
                print("❌ FAILED: Found 'auth/argument-error' in page content!")
                page.screenshot(path='auth_error.png')
                return False
            elif "OTP sent" in content or "Verify your number" in content:
                print("✅ SUCCESS: No 'auth/argument-error' found.")
                return True
            else:
                print("⚠️ UNKNOWN: Neither error nor success message found.")
                return False
            
            browser.close()
    finally:
        print("Shutting down servers...")
        api_proc.terminate()
        web_proc.terminate()

if __name__ == "__main__":
    if run_test():
        exit(0)
    else:
        exit(1)
