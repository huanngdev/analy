# @repo/typescript-config

Shared TypeScript configurations for the monorepo.

## Configurations

- `base.json` - Base configuration with common settings
- `react.json` - Configuration for React applications
- `node.json` - Configuration for Node.js/Bun applications

## Usage

### For React Apps

In your `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/react.json",
  "compilerOptions": {
    // App-specific overrides
  },
  "include": ["src"]
}
```

### For Node.js/Bun Apps

In your `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    // App-specific overrides
  },
  "include": ["src"]
}
```
