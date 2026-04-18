"""
Calling API to bucket the dictionary into a file. For more information, visit: https://runescape.wiki/w/Help:Editing/Bucket
For a full dictionary, change the query in lua or can try scraping the wiki for all words.
"""

import requests
import json
import html
import os 


api_url = "https://oldschool.runescape.wiki/api.php"


def get_bucket_rows(query, api_url):
    response = requests.get(
        api_url,
        params={
            "format": "json",
            "formatversion": 2,
            "action": "bucket",
            "query": query,
        },
        headers={
            "User-Agent": "my-osrs-script/1.0"
        },
        timeout=30,
    )

    if response.status_code != 200:
        print(
            f"Error with request. code: {response.status_code}, "
            f"url: {response.url}, body: {response.text}"
        )
        return []

    body = response.json()

    if "error" in body:
        print(f"Error in 200 code: {body['error']}")
        return []

    return body.get("bucket", [])


all_items = []
limit = 5000
offset = 0

while True:
    query = (
        "bucket('npc_id')"
        ".select('page_name_sub')"
        ".orderBy('page_name_sub', 'asc')"
        f".limit({limit})"
        f".offset({offset})"
        ".run()"
    )

    rows = get_bucket_rows(query, api_url)

    if not rows:
        break

    for row in rows:
        name = row.get("page_name_sub")
        if name:
            all_items.append(name)

    offset += limit

with open("dictionary/osrs.txt", "w", encoding="utf-8") as f:
    for item in all_items:
        f.write(item + "\n")

