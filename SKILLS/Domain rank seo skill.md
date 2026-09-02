---
name: domainrank-submit
description: |
  Submit websites to DomainRank.app AI directory. Use cases:
  (1) User wants to submit a website to AI directory
  (2) User says "submit to domainrank", "submit site", "add to directory"
  (3) User needs to batch submit multiple websites to directory
  Triggers: domainrank, submit site, directory submit, AI directory
---

# DomainRank Directory Submit

Submit websites to DomainRank.app AI directory via API.

## API Endpoint

```
POST https://domainrank.app/api/submit-item
```

## Authentication

Use Bearer Token authentication. Get your API Key from DomainRank settings page.

```bash
Authorization: Bearer dr_xxxxxxxxxxxxxxxx
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Website name |
| link | string | Yes | Website URL |
| pricePlan | string | No | Pricing plan: basic (default), pro, ultra |

## Pricing Plans & Credits

| Plan | Credits | Features |
|------|---------|----------|
| basic | 100 | Basic listing |
| pro | 200 | Listing + Social media promotion |
| ultra | 2000 | Listing + Social media + AI directory distribution |

## Submit Example

```bash
curl -X POST https://domainrank.app/api/submit-item \
  -H "Authorization: Bearer dr_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "link": "https://example.com",
    "pricePlan": "basic"
  }'
```

## Response Format

Success response (200):
```json
{
  "success": true,
  "item": "https://domainrank.app/item/my-website",
  "name": "My Website",
  "link": "https://example.com",
  "pricePlan": "basic",
  "creditsConsumed": 100,
  "creditsRemaining": 4900
}
```

Error responses:
- 401: Invalid or missing API Key
- 400: Parameter error (missing name/link or invalid pricePlan)
- 402: Insufficient credits
- 409: Website already exists
- 500: Server error

## Batch Submit

For batch submitting multiple websites:

```bash
for site in "Site1|https://site1.com" "Site2|https://site2.com"; do
  name="${site%|*}"
  link="${site#*|}"
  curl -X POST https://domainrank.app/api/submit-item \
    -H "Authorization: Bearer dr_your_api_key" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$name\", \"link\": \"$link\", \"pricePlan\": \"basic\"}"
  sleep 1
done
```

## Notes

1. URL auto-cleanup: Query parameters and trailing slashes are removed
2. AI auto-fill: System automatically fetches website info for description, categories, tags, icons
3. Duplicate detection: Same URL cannot be submitted twice
4. Credit refund: If AI fetch fails, credits are automatically refunded
