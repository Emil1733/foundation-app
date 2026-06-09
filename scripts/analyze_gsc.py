import os
import json

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return None
    with open(filepath, 'r') as f:
        return json.load(f)

def analyze_period(pages_data, queries_data, date_data=None):
    if not pages_data or not queries_data:
        return {}

    # Property summary
    total_property_impressions = sum(d.get('impressions', 0) for d in date_data) if date_data else 0
    total_property_clicks = sum(d.get('clicks', 0) for d in date_data) if date_data else 0

    # Pages summary
    total_clicks_pages = sum(p.get('clicks', 0) for p in pages_data)
    total_impressions_pages = sum(p.get('impressions', 0) for p in pages_data)
    weighted_pos_sum_pages = sum(p.get('position', 0) * p.get('impressions', 0) for p in pages_data)
    avg_pos_pages = weighted_pos_sum_pages / total_impressions_pages if total_impressions_pages > 0 else 0
    unique_pages = len(pages_data)

    # Queries summary
    total_clicks_queries = sum(q.get('clicks', 0) for q in queries_data)
    total_impressions_queries = sum(q.get('impressions', 0) for q in queries_data)
    weighted_pos_sum_queries = sum(q.get('position', 0) * q.get('impressions', 0) for q in queries_data)
    avg_pos_queries = weighted_pos_sum_queries / total_impressions_queries if total_impressions_queries > 0 else 0
    unique_queries = len(queries_data)

    return {
        'clicks': total_property_clicks,
        'impressions': total_impressions_pages,
        'property_impressions': total_property_impressions,
        'avg_position': avg_pos_pages,
        'unique_pages': unique_pages,
        'unique_queries': unique_queries,
        'query_impressions': total_impressions_queries,
        'query_avg_position': avg_pos_queries
    }

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc'))
    periods = {
        '04-29-2026': ('04-29-2026/performance_page.json', '04-29-2026/performance_query.json', '04-29-2026/performance_date.json'),
        '05-09-2026': ('05-09-2026/performance_page.json', '05-09-2026/performance_query.json', '05-09-2026/performance_date.json'),
        '05-23-2026': ('05-23-2026/performance_page.json', '05-23-2026/performance_query.json', '05-23-2026/performance_date.json'),
        '06-09-2026': ('06-09-2026/performance_page.json', '06-09-2026/performance_query.json', '06-09-2026/performance_date.json'),
    }

    results = {}
    for label, (p_file, q_file, d_file) in periods.items():
        p_path = os.path.join(base_dir, p_file)
        q_path = os.path.join(base_dir, q_file)
        d_path = os.path.join(base_dir, d_file)
        pages_data = load_json(p_path)
        queries_data = load_json(q_path)
        date_data = load_json(d_path)
        results[label] = {
            'stats': analyze_period(pages_data, queries_data, date_data),
            'queries': {q['keys'][0]: q for q in (queries_data or [])},
            'pages': {p['keys'][0]: p for p in (pages_data or [])}
        }

    print("\n=== GLOBAL STATISTICS COMPARISON ===")
    print(f"{'Metric':<25} | {'04-29-2026 (30d)':<18} | {'05-09-2026 (30d)':<18} | {'05-23-2026 (14d)':<18} | {'06-09-2026 (30d)':<18}")
    print("-" * 110)
    metrics = [
        ('clicks', 'Total Clicks'),
        ('property_impressions', 'Total Property Impressions'),
        ('impressions', 'Total Page Impressions'),
        ('avg_position', 'Avg Page Position (W)'),
        ('unique_pages', 'Active Unique Pages'),
        ('query_impressions', 'Total Query Impressions'),
        ('query_avg_position', 'Avg Query Position (W)'),
        ('unique_queries', 'Active Unique Queries'),
    ]
    for key, name in metrics:
        v1 = f"{results['04-29-2026']['stats'].get(key, 0):.2f}" if isinstance(results['04-29-2026']['stats'].get(key, 0), float) else str(results['04-29-2026']['stats'].get(key, 0))
        v2 = f"{results['05-09-2026']['stats'].get(key, 0):.2f}" if isinstance(results['05-09-2026']['stats'].get(key, 0), float) else str(results['05-09-2026']['stats'].get(key, 0))
        v3 = f"{results['05-23-2026']['stats'].get(key, 0):.2f}" if isinstance(results['05-23-2026']['stats'].get(key, 0), float) else str(results['05-23-2026']['stats'].get(key, 0))
        v4 = f"{results['06-09-2026']['stats'].get(key, 0):.2f}" if isinstance(results['06-09-2026']['stats'].get(key, 0), float) else str(results['06-09-2026']['stats'].get(key, 0))
        print(f"{name:<25} | {v1:<18} | {v2:<18} | {v3:<18} | {v4:<18}")

    # Track target queries
    target_queries = [
        "foundation distress identification in lewisville, tx",
        "foundation evaluation in lewisville, tx",
        "foundation assessment in dallas, tx",
        "foundation inspection dallas",
        "foundation inspection service dallas",
        "richardson foundation repair",
        "richardson foundation repair company",
        "foundation settling information in lewisville, tx",
        "residential foundation inspections in lewisville, tx",
        "soil reports san antonio",
    ]

    print("\n=== TARGET QUERIES COMPARISON (Impressions / Position) ===")
    print(f"{'Query':<55} | {'04-29-2026':<12} | {'05-09-2026':<12} | {'05-23-2026':<12} | {'06-09-2026':<12}")
    print("-" * 115)
    for q_name in target_queries:
        cells = []
        for period in ['04-29-2026', '05-09-2026', '05-23-2026', '06-09-2026']:
            q_info = results[period]['queries'].get(q_name)
            if q_info:
                cells.append(f"{q_info['impressions']} imp / {q_info['position']:.1f}")
            else:
                cells.append("N/A")
        print(f"{q_name:<55} | {cells[0]:<12} | {cells[1]:<12} | {cells[2]:<12} | {cells[3]:<12}")

    # Check learn pages vs services pages
    print("\n=== PAGE GROUP ANALYSIS ===")
    for label in ['04-29-2026', '05-09-2026', '05-23-2026', '06-09-2026']:
        pages_dict = results[label]['pages']
        learn_pages = [p for url, p in pages_dict.items() if '/learn/' in url]
        service_pages = [p for url, p in pages_dict.items() if '/services/' in url]
        home_page = [p for url, p in pages_dict.items() if url == 'https://foundationrisk.org/' or url == 'https://www.foundationrisk.org/']
        
        learn_imp = sum(p['impressions'] for p in learn_pages)
        service_imp = sum(p['impressions'] for p in service_pages)
        home_imp = sum(p['impressions'] for p in home_page)
        
        print(f"\nPeriod: {label}")
        print(f"  Learn Pages (/learn/): {len(learn_pages)} pages, {learn_imp} total impressions")
        print(f"  Service Pages (/services/): {len(service_pages)} pages, {service_imp} total impressions")
        print(f"  Home Page: {len(home_page)} variations, {home_imp} total impressions")

if __name__ == '__main__':
    main()
