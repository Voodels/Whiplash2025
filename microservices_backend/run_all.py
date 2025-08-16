import subprocess
import socket
import os
import time
import requests

# Simple tail utility for logs
def tail(filepath, n=40):
    try:
        with open(filepath, 'r', errors='ignore') as f:
            return ''.join(f.readlines()[-n:])
    except Exception:
        return ''

# Define microservices with their script paths and ports
SERVICES = [
    {"name": "MCP Server", "path": "mcp_server/app.py", "port": 5101, "log": "logs/mcp_server.log"},
    {"name": "Video Fetcher", "path": "video_fetcher/app.py", "port": 5103, "log": "logs/video_fetcher.log"},
    {"name": "Material Generator", "path": "material_generator/app.py", "port": 5102, "log": "logs/material_generator.log"},
    {"name": "Quiz Generator", "path": "quiz_generator/app.py", "port": 5104, "log": "logs/quiz_generator.log"},
    # Add more if needed
]

BASEDIR = os.path.dirname(os.path.abspath(__file__))


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


def start_service(service):
    log_path = os.path.join(BASEDIR, service["log"])
    # Ensure logs directory exists
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    script_path = os.path.join(BASEDIR, service["path"])
    with open(log_path, "a") as logfile:
        logfile.write(f"\n==== Starting {service['name']} ====: {script_path} on port {service['port']}\n")
        logfile.flush()
        # Start the service in the background
        subprocess.Popen([
            "python3", script_path
        ], stdout=logfile, stderr=subprocess.STDOUT, env={**os.environ, "PYTHONPATH": BASEDIR})
    print(f"Started {service['name']} (port {service['port']})")


def wait_for_service(port, retries=30, delay=1):
    for _ in range(retries):
        if is_port_in_use(port):
            return True
        time.sleep(delay)
    return False

def main():
    for service in SERVICES:
        if is_port_in_use(service["port"]):
            print(f"{service['name']} already running on port {service['port']}.")
        else:
            start_service(service)
    # Wait for all services to be up
    print("Waiting for all services to be up...")
    all_ok = True
    for service in SERVICES:
        if not wait_for_service(service["port"]):
            print(f"Failed to start {service['name']} on port {service['port']}")
            print("Recent log output:\n" + tail(os.path.join(BASEDIR, service["log"])) )
            all_ok = False
            continue
        # Health check
        try:
            resp = requests.get(f"http://localhost:{service['port']}/health", timeout=5)
            if resp.status_code == 200:
                print(f"{service['name']} health: OK")
            else:
                print(f"{service['name']} health: HTTP {resp.status_code}")
        except Exception as e:
            print(f"{service['name']} health check failed: {e}")
            print("Recent log output:\n" + tail(os.path.join(BASEDIR, service["log"])) )
            all_ok = False
    if all_ok:
        print("All services are running and responded to health checks.")
    else:
        print("One or more services failed. See logs above.")

if __name__ == "__main__":
    main()

