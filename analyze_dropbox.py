
import requests
import re
import json

url = "https://www.dropbox.com/scl/fi/bioydtljxxtrh5wuqnmxb/Astronime-E1-1080p.mp4?rlkey=lsgfu7mobydvn2lz0bj6n03fq&e=1&st=viib5fqs&dl=0"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
}

try:
    print(f"Fetching {url}...")
    r = requests.get(url, headers=headers)
    content = r.text
    
    print(f"Status: {r.status_code}")
    print(f"Length: {len(content)}")

    # Search for hls_master_playlist
    match = re.search(r'(https://previews\.dropbox\.com/p/hls_master_playlist/[^\s"\'<>]*)', content)
    if match:
        print("\nFOUND HLS URL DIRECTLY:")
        print(match.group(1))
    else:
        print("\nDirect 'hls_master_playlist' not found in HTML.")
        
    # Search for transcode_url
    match_transcode = re.search(r'transcode_url["\']\s?:\s?["\'](.*?)["\']', content)
    if match_transcode:
        print("\nFound transcode_url in JSON:")
        print(match_transcode.group(1))
        
    # Save content to inspect if failed
    if not match and not match_transcode:
        with open('debug_dropbox.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Saved debug_dropbox.html for inspection")

except Exception as e:
    print(f"Error: {e}")
