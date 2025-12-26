# Changelog

All notable changes to **Stratus** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Native Mobile Wrapper**: Initial research for Capacitor integration.
- **Social Features**: Database schema for "Outfit Checks" and sharing.

## [0.1.0] - 2025-12-26

### Added
- **Admin Nexus**: Full "God Mode" dashboard with RBAC, Ops Control, and User Management.
- **Quality Assurance Lab**: Integrated Unit & E2E Test Runner directly in Admin UI.
- **Maintenance Mode**: Circuit breaker pattern for global system locking.
- **Broadcast System**: Global notification engine for system-wide alerts.
- **Gemini 2.5 Logic**: Upgraded core AI extraction to latest model.
- **CI/CD Pipeline**: GitHub Actions workflows for automated testing on PR.
- **Documentation**: Comprehensive README, Architecture docs, and Contribution guidelines.

### Changed
- Refactored `AttireService` to strictly use Type-safe objects instead of raw JSON.
- Migrated all API routes to Next.js Server Actions for better type safety.
- Updated UI to "Glassmorphism v2" design system.

### Fixed
- Resolved timezone offset bug in `DateHelpers` affecting midnight classes.
- Fixed Playwright strict mode violations in E2E suite.
- Corrected race condition in user profile sync during onboarding.
