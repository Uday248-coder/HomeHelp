import subprocess
import time
import sys
import argparse
import signal
import os

def main():
    parser = argparse.ArgumentParser(description="Manage server lifecycle for Playwright tests")
    parser.add_argument('--server', action='append', help="Command to start a server")
    parser.add_argument('--port', action='append', help="Port for the server")
    parser.add_argument('cmd', nargs=argparse.REMAINDER, help="Command to run after servers start")
    
    args = parser.parse_args()
    
    if not args.server:
        print("No servers specified. Running command directly.")
        subprocess.run(args.cmd)
        return

    processes = []
    try:
        for i, server_cmd in enumerate(args.server):
            print(f"Starting server: {server_cmd}...")
            # We use shell=True for npm commands on Windows
            proc = subprocess.Popen(server_cmd, shell=True)
            processes.append(proc)
        
        # Wait for servers to boot (usually 15-30s for Next.js/Express)
        print("Waiting 30 seconds for servers to be ready...")
        time.sleep(30)
        
        print(f"Running automation: {' '.join(args.cmd)}")
        result = subprocess.run(args.cmd)
        sys.exit(result.returncode)
        
    finally:
        print("Shutting down servers...")
        for proc in processes:
            proc.terminate()

if __name__ == "__main__":
    main()
