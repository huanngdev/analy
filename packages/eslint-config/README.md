# @repo/eslint-config

Shared ESLint configuration for the monorepo.

## Usage

In your app's `eslint.config.js`:

```js
import baseConfig from '@repo/eslint-config';

export default [
  ...baseConfig,
  // Add app-specific overrides here
];
```
