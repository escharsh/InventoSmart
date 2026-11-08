import sys
import os
import webbrowser
import threading
import time
import uvicorn

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000"
    print(f"\nOpening {url} in your browser...")
    webbrowser.open(url)

if __name__ == "__main__":
    print("=" * 60)
    print("  InventoSmart AI - Smart Inventory Management System")
    print("  Server starting at: http://127.0.0.1:8000")
    print("=" * 60)

    # Launch browser automatically
    threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI server
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
