import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Correct paths relative to foundation-app/scripts
KEY_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'gsc-credentials.json'))
SITE_URL = 'sc-domain:foundationrisk.org'
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gsc', '06-16-2026'))

def pull_gsc():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print(f"Using credentials from: {KEY_FILE}")
    credentials = service_account.Credentials.from_service_account_file(KEY_FILE)
    service = build('searchconsole', 'v1', credentials=credentials)

    # Last 30 days roughly
    end_date = '2026-06-16'
    start_date = '2026-05-17'

    # USA only filter
    filters = {
        'dimensionFilterGroups': [{
            'filters': [{
                'dimension': 'country',
                'operator': 'equals',
                'expression': 'usa'
            }]
        }]
    }

    # 1. Date
    print("Fetching performance by date...")
    request_date = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['date'],
        **filters
    }
    response_date = service.searchanalytics().query(siteUrl=SITE_URL, body=request_date).execute()
    with open(os.path.join(OUTPUT_DIR, 'performance_date.json'), 'w') as f:
        json.dump(response_date.get('rows', []), f, indent=2)

    # 2. Page
    print("Fetching performance by page...")
    request_page = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['page'],
        'rowLimit': 5000,
        **filters
    }
    response_page = service.searchanalytics().query(siteUrl=SITE_URL, body=request_page).execute()
    with open(os.path.join(OUTPUT_DIR, 'performance_page.json'), 'w') as f:
        json.dump(response_page.get('rows', []), f, indent=2)

    # 3. Query
    print("Fetching performance by query...")
    request_query = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query'],
        'rowLimit': 5000,
        **filters
    }
    response_query = service.searchanalytics().query(siteUrl=SITE_URL, body=request_query).execute()
    with open(os.path.join(OUTPUT_DIR, 'performance_query.json'), 'w') as f:
        json.dump(response_query.get('rows', []), f, indent=2)

    print(f"[SUCCESS] GSC Data saved to {OUTPUT_DIR}")

if __name__ == '__main__':
    pull_gsc()
