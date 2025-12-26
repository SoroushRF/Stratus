# Contributing to Stratus

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions.

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Your First Code Contribution](#your-first-code-contribution)
- [Styleguides](#styleguides)
- [Commit Messages](#commit-messages)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/soroushrf/stratus/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

## I Want To Contribute

### Legal Notice 
When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

#### How to submit a good bug report

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to [placeholder-security@stratus.app].

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/soroushrf/stratus/issues/new). (Since we can't be sure the bug is actually in the project, please ask in the community first if you are unsure).
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

### Your First Code Contribution

1.  Fork the repo and create your branch from `master`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes (`npm test`).
5.  Make sure your code lints (`npm run lint`).

## Styleguides

### Commit Messages

We generally follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding/updating tests
- `chore:` for tool/build changes

Example:
`feat(auth): add google provider support`

### Code Style

- We use **TypeScript** for everything. No `any` unless absolutely necessary.
- We use **Tailwind CSS** for styling.
- Sort imports using the standard Prettier plugin order.
- Functional components should be named PascalCase.
- Hooks should be named `useHookName`.

## Testing Locally

Before submitting a PR, please run the full suite:

```bash
# Run Unit Tests
npm test

# Run E2E Tests (Headless)
npm run test:e2e
```

Happy coding!
