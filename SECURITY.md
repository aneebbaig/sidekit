# Security

Security fixes go to the `main` branch.

## Reporting a problem

Do not open a public issue for a security bug. Use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repo, or email the maintainer.

Include what the bug is, how to reproduce it, and the impact if you know it. I'll reply within a few days, and you'll get credit for the report unless you'd rather stay anonymous.

## Areas worth a close look

The app stores logins, money, and customer details, so these matter most:

- Login and sessions (the NextAuth credentials flow)
- Authorization on server actions and the public order API
- SQL/ORM injection and data leaking between records
- How secrets and environment variables are handled
