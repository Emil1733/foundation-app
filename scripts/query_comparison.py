import os
import json

def get_queries(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        data = json.load(f)
    return sorted(data, key=lambda x: x.get('impressions', 0), reverse=True)

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc'))
    q_04_29 = get_queries(os.path.join(base_dir, '04-29-2026/performance_query.json'))
    q_05_23 = get_queries(os.path.join(base_dir, '05-23-2026/performance_query.json'))
    
    print("=== TOP 20 QUERIES - APRIL 29 (30d) ===")
    for i, q in enumerate(q_04_29[:20]):
        print(f"{i+1:<2}. {q['keys'][0]:<60} | {q['impressions']:<4} imp | Pos: {q['position']:.1f}")
        
    print("\n=== TOP 20 QUERIES - MAY 23 (14d) ===")
    for i, q in enumerate(q_05_23[:20]):
        print(f"{i+1:<2}. {q['keys'][0]:<60} | {q['impressions']:<4} imp | Pos: {q['position']:.1f}")

if __name__ == '__main__':
    main()
