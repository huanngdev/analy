# @repo/prettier-config

Shared Prettier configurations for the monorepo.

## Configurations

- `index.js` - Base Prettier configuration
- `react.js` - Configuration for React apps with Tailwind CSS class sorting

## Usage

### For Node.js/Bun Apps

Create `prettier.config.js`:

```js
export { default } from '@repo/prettier-config';
```

Or in `package.json`:

```json
{
  "prettier": "@repo/prettier-config"
}
```

### For React Apps (with Tailwind)

Create `prettier.config.js`:

```js
export { default } from '@repo/prettier-config/react';
```

This includes the Tailwind CSS plugin that automatically sorts your Tailwind classes.
