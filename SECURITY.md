# Security Policy

## Supported versions

Sidekit is under active development. Security fixes are applied to the `main` branch.

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report them privately via [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository, or email the maintainer.

When reporting, please include:

- A description of the vulnerability and its impact.
- Steps to reproduce or a proof of concept.
- Any suggested remediation.

You can expect an initial response within a few days. Once a fix is released, we are happy to credit you unless you prefer to remain anonymous.

## Scope

This project handles authentication, financial records, and customer data. Of particular interest:

- Authentication and session handling (NextAuth credentials flow).
- Authorization on server actions and the public order API.
- SQL/ORM injection and data leakage between resources.
- Secrets handling and environment validation.
