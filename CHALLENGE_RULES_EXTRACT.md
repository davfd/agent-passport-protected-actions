# Terminal 3 ADK bounty — challenge rules extract

**Purpose:** preserve the authoritative scoring/reporting rules used by this submission packet after direct DoraHacks access was WAF/human-verification gated.

**Access note:** Direct browser/curl access to `https://dorahacks.io/hackathon/t3adkdevchallenge/detail` returned human verification / AWS WAF in this environment. This extract is from the challenge text supplied by the operator from the DoraHacks page and is included so reviewers can see how the build and bug/docs appendix map to the stated rules.

## Challenge window

```text
The Terminal 3's Bounty challenge runs from 9 June 2026 9.00AM to 22 June 2026 11.59PM (GMT+8)
```

## Prize / bonus

```text
Submit BUIDLs and bugs to get a chance to win the $2,000 cash prize pool.

Our partners at Google have also granted the 6 top teams with $500 (total $3,000) in Google credits as well!

Note : cash prizes will be paid out in fiat via wire / bank transfer, no stablecoins / crypto payment options will be provided.
```

## Best Agent track

```text
Best Agent utilising Terminal 3 Agent Auth SDK
For this challenge, we are seeking the top agent utilising Terminal 3's Agent Auth SDK.

Scoring criteria is of the following :

How complete the solution is (30%)
How well integrated is the SDK in its entirety in your solution (40%)
How creative is the application of the SDK in your agent (30%)
```

Submission mapping:

```text
Completeness (30%)
SDK integration in its entirety (40%)
Creativity (30%)
```

## Bug Discovery Bounty track

```text
Bug Discovery Bounty
The most detailed developer that discovers and submits the most number of

bugs during onboarding
documentation gaps
```

Report scope and exclusion rules:

```text
Reports should focus on the SDK-related issues. Below is a non-exhaustive list of issues that generally do not qualify for our track.

1. Irrelevant reports from scanners or automated tools 2. Bugs requiring physical access to the user's device 3. Non-reproducible vulnerabilities deriving from outdated or reportedly flawed versions of open-source software

An issue may only be submitted once. Duplicate issues submitted by either the same person or multiple people do not qualify – only the first report will be evaluated.

Each report you submit must describe a real issue that is in scope, actionable, and verifiable from the submitted materials. To be fixed, the issue must require a code change.

Each report must contain a reproduction of the issue.

For duplicates, the first valid report takes precedence. Reports submitted after the relevant fix has already been implemented in testnet will not be accepted.
```

LLM-use rule:

```text
Using LLMs is allowed.

However:

You are responsible for validating every claim before submission.
Low-effort AI-generated reports will be ignored and may lead to your suspension from this challenge.
```

## How this packet responds

```text
Build track: a working Agent Passport / protected-action demo with tests, Terminal 3 SDK integration, live testnet receipts, and a concrete safe-checkout story.

Bug/docs track: BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md with 11 SDK/onboarding/docs findings. Each item includes reproduction, observed behavior, expected behavior, and a required code/docs fix frame.
```
