"""
Downloads real UK Overseas Trade Statistics from HM Revenue & Customs'
public API (api.uktradeinfo.com) -- no account or API key required, all
endpoints are open access. This is how trade_data_raw.csv was built;
re-run it to pull a fresh snapshot (the live API updates monthly).
"""
import csv
import json
import time
import urllib.parse
import urllib.request

BASE = "https://api.uktradeinfo.com"


def fetch(path, params=None, retries=3):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params, safe="$,")
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"  retry {attempt + 1}/{retries} for {url}: {e}")
            time.sleep(2)
    raise RuntimeError(f"Failed to fetch {url}")


print("Fetching Commodity lookup table...")
commodities, skip = [], 0
while True:
    page = fetch("/Commodity", {"$top": 5000, "$skip": skip})
    rows = page["value"]
    if not rows:
        break
    commodities.extend(rows)
    skip += 5000
    if len(rows) < 5000:
        break
commodities = {c["CommodityId"]: c for c in commodities}

print("Fetching Country lookup table...")
countries = {c["CountryId"]: c for c in fetch("/Country", {"$top": 5000})["value"]}

# One month per quarter of 2024 -- EU imports (flow 1) + non-EU imports
# (flow 3), records with real declared value and net mass populated.
months = [202401, 202404, 202407, 202410]
PAGE, TARGET_PER_MONTH = 5000, 10000

with open("trade_data_raw.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["month", "flow_type_id", "commodity_id", "category", "country", "value_gbp", "net_mass_kg"])
    total = 0
    for month in months:
        print(f"Fetching OTS for month {month}...")
        skip, got = 0, 0
        while got < TARGET_PER_MONTH:
            filt = (f"MonthId eq {month} and NetMass gt 0 and Value gt 0 "
                    f"and (FlowTypeId eq 1 or FlowTypeId eq 3)")
            page = fetch("/OTS", {"$filter": filt, "$top": PAGE, "$skip": skip})
            rows = page["value"]
            if not rows:
                break
            for r in rows:
                c = commodities.get(r["CommodityId"])
                ctry = countries.get(r["CountryId"])
                if not c or not ctry or not c.get("Hs2Description"):
                    continue
                w.writerow([r["MonthId"], r["FlowTypeId"], r["CommodityId"],
                            c["Hs2Description"], ctry["CountryName"], r["Value"], r["NetMass"]])
                total += 1
            got += len(rows)
            skip += PAGE
            if len(rows) < PAGE:
                break

print(f"\nWrote {total:,} real records to trade_data_raw.csv")
