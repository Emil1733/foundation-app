import os
import json

def get_matching_queries(filepath, terms):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        data = json.load(f)
    matching = []
    for q in data:
        key = q['keys'][0].lower()
        if any(term in key for term in terms):
            matching.append(q)
    return sorted(matching, key=lambda x: x.get('impressions', 0), reverse=True)

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc'))
    terms = ['soil', 'analysis', 'report', 'plasticity']
    
    for filename in ['04-29-2026/performance_query.json', '05-09-2026/performance_query.json', '05-23-2026/performance_query.json']:
        path = os.path.join(base_dir, filename)
        matching = get_matching_queries(path, terms)
        print(f"\n=== MATCHING QUERIES IN {filename} (Total: {len(matching)}) ===")
        for i, q in enumerate(matching[:15]):
            print(f"{i+1:<2}. {q['keys'][0]:<60} | {q['impressions']:<4} imp | Pos: {q['position']:.1f}")

if __name__ == '__main__':
    main()
