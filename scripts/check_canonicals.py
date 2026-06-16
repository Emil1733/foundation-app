import os
import json

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc'))
    files = ['04-29-2026/performance_page.json', '05-09-2026/performance_page.json', '05-23-2026/performance_page.json', '06-09-2026/performance_page.json', '06-16-2026/performance_page.json']
    
    for filename in files:
        path = os.path.join(base_dir, filename)
        if not os.path.exists(path):
            continue
        with open(path, 'r') as f:
            data = json.load(f)
        
        www_pages = 0
        www_imp = 0
        non_www_pages = 0
        non_www_imp = 0
        
        for p in data:
            url = p['keys'][0]
            if '://www.' in url:
                www_pages += 1
                www_imp += p['impressions']
            else:
                non_www_pages += 1
                non_www_imp += p['impressions']
                
        print(f"\nFile: {filename}")
        print(f"  WWW:     {www_pages:<3} pages, {www_imp:<5} impressions")
        print(f"  NON-WWW: {non_www_pages:<3} pages, {non_www_imp:<5} impressions")

if __name__ == '__main__':
    main()
