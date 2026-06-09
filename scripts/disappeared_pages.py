import os
import json

def get_pages(filepath):
    if not os.path.exists(filepath):
        return set()
    with open(filepath, 'r') as f:
        data = json.load(f)
    return {p['keys'][0]: p for p in data}

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc'))
    p_04_29 = get_pages(os.path.join(base_dir, '04-29-2026/performance_page.json'))
    p_05_09 = get_pages(os.path.join(base_dir, '05-09-2026/performance_page.json'))
    p_05_23 = get_pages(os.path.join(base_dir, '05-23-2026/performance_page.json'))
    p_06_09 = get_pages(os.path.join(base_dir, '06-09-2026/performance_page.json'))
    
    all_pages = set(p_04_29.keys()) | set(p_05_09.keys()) | set(p_05_23.keys()) | set(p_06_09.keys())
    
    print(f"{'URL':<80} | {'04-29':<8} | {'05-09':<8} | {'05-23':<8} | {'06-09':<8}")
    print("-" * 120)
    for url in sorted(all_pages):
        imp_04_29 = p_04_29.get(url, {}).get('impressions', '-')
        imp_05_09 = p_05_09.get(url, {}).get('impressions', '-')
        imp_05_23 = p_05_23.get(url, {}).get('impressions', '-')
        imp_06_09 = p_06_09.get(url, {}).get('impressions', '-')
        print(f"{url:<80} | {imp_04_29:<8} | {imp_05_09:<8} | {imp_05_23:<8} | {imp_06_09:<8}")

if __name__ == '__main__':
    main()
