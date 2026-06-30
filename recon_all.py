from playwright.sync_api import sync_playwright

def run_recon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        targets = [
            ("home", "http://localhost:3000"),
            ("waitlist", "http://localhost:3000/#waitlist"),
            ("book", "http://localhost:3000/book"),
            ("admin", "http://localhost:3001/admin"), # Wait, checking admin port. Admin is usually a separate app. 
        ]
        
        # Actually, admin is in apps/admin. In dev, it might be on a different port.
        # Looking at the project structure, apps/admin and apps/website are separate Next.js apps.
        # Usually, the first one is 3000, the second is 3001.
        # But let's check where Admin runs.
        
        for name, url in targets:
            try:
                print(f"Reconning {name} at {url}...")
                page.goto(url)
                page.wait_for_load_state('networkidle')
                
                page.screenshot(path=f'recon_{name}.png', full_page=True)
                
                print(f"--- Selectors for {name} ---")
                buttons = page.locator('button').all()
                for b in buttons:
                    print(f"Button: {b.inner_text()} | ID: {b.get_attribute('id')} | Class: {b.get_attribute('class')}")
                
                inputs = page.locator('input').all()
                for i in inputs:
                    print(f"Input: {i.get_attribute('placeholder')} | Name: {i.get_attribute('name')} | ID: {i.get_attribute('id')}")
                
                print("-" * 30)
            except Exception as e:
                print(f"Failed to recon {name}: {e}")
                
        browser.close()

if __name__ == "__main__":
    run_recon()
