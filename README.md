# GLOBAL SHARES EARN

**Planned domain:** https://globalsharesearn.com (registration and DNS setup pending)

GLOBAL SHARES EARN is a web application with account access, USD-denominated balances and investment accounting, cryptocurrency deposit and withdrawal requests, transaction history, and protected administrative workflows. Historical records in legacy denominations must remain identifiable and must not be silently converted or combined with USD balances.

## Deployment

The project is configured for GitHub Pages. The existing custom domain remains in place until the new domain is registered and DNS/HTTPS are ready, so the current site is not disconnected prematurely.

## Security and release checks

The repository includes workflows for deployment, secret scanning, financial safeguards, and security build verification. Financial changes must pass the relevant checks before release. The intended live accounting denomination is USD only. Legacy BDX records are retained for audit until an explicitly reviewed reconciliation migration is approved; no conversion rate or balance conversion may be inferred.
