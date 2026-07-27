# Contributing

Thanks for taking a look at this project. It's primarily a portfolio piece,
but it's built to real production standards and issues/PRs are welcome.

## Getting set up

```bash
git clone https://github.com/MrBoyard7/ember-oak-coffee.git
cd ember-oak-coffee
npm install
npm run dev
```

See the [README](README.md#getting-started) for the full list of commands.

## Before opening a pull request

1. Run the full check suite locally and make sure it's green:
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```
2. Keep content edits in `/data/*.json` rather than hard-coding copy into
   HTML — that's the whole point of the content-loader layer.
3. Match the existing code style; `npm run format` will fix most of it
   automatically.
4. Write or update a test in `/tests` for any behavioural change.
5. Keep commits focused and use clear, descriptive messages.

## Reporting a bug

Please open a GitHub issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce (browser/OS if relevant)

## Code of conduct

Be respectful and constructive. Disagreements about code are fine;
personal attacks are not.
