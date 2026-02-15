# Analy API

A production-ready REST API built with Elysia, TypeScript, and Zod validation.

## Features

✅ **Elysia** - Fast and lightweight web framework
✅ **Zod v4** - Schema validation and type inference
✅ **Pino** - High-performance JSON logging
✅ **OpenAPI/Swagger** - Interactive API documentation
✅ **CORS** - Configurable cross-origin resource sharing
✅ **Security Headers** - Helmet-like protection
✅ **TypeScript** - Full type safety
✅ **Docker** - PostgreSQL, Redis, MinIO services

## Project Structure

```
src/
├── config/
│   ├── env.ts             # Environment validation
│   └── logger.ts          # Pino logger configuration
├── plugins/
│   ├── security.ts        # Security headers
│   ├── request-logger.ts  # Request/response logging
│   └── error-handler.ts   # Global error handling
├── routes/
│   ├── index.ts           # Route aggregator
│   ├── root.route.ts      # Root endpoint
│   ├── health.route.ts    # Health checks
│   └── example.route.ts   # Example CRUD with Zod
└── index.ts               # Application entry point
```

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services (Docker)

```bash
# From project root
docker-compose up -d
```

### 4. Run Development Server

```bash
bun run dev
```

Server will start at `http://localhost:3000`

## API Documentation

Once the server is running, visit:

**📚 Interactive API Documentation:** `http://localhost:3000/docs`

The Swagger UI provides:

- ✅ All available endpoints
- ✅ Request/response schemas
- ✅ Try out API calls directly from the browser
- ✅ Code examples in multiple languages
- ✅ Full OpenAPI 3.0 specification

You can also access the raw OpenAPI JSON at: `http://localhost:3000/docs/json`

## Available Endpoints

### General

- `GET /` - API information
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with system metrics
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Example CRUD (with Zod validation)

- `GET /api/v1/users` - List users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Creating New Routes

### 1. Create Route File

Create a new file in `src/routes/` (e.g., `posts.route.ts`):

```typescript
import { Elysia, t } from 'elysia';
import { z } from 'zod';
import { logger } from '../config/logger';

// Define Zod schemas
const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

type CreatePostInput = z.infer<typeof CreatePostSchema>;

// Create route
export const postsRoute = new Elysia({ prefix: '/api/v1/posts' }).post(
  '/',
  ({ body }) => {
    // Validate with Zod
    const validated = CreatePostSchema.parse(body);

    logger.info({ post: validated }, 'Creating post');

    return {
      data: {
        id: crypto.randomUUID(),
        ...validated,
        createdAt: new Date().toISOString(),
      },
    };
  },
  {
    detail: {
      tags: ['Posts'],
      summary: 'Create post',
    },
    body: t.Object({
      title: t.String(),
      content: t.String(),
      published: t.Optional(t.Boolean()),
    }),
  }
);
```

### 2. Register Route

Add to `src/routes/index.ts`:

```typescript
import { postsRoute } from './posts.route';

export const routes = new Elysia()
  .use(rootRoute)
  .use(healthRoute)
  .use(exampleRoute)
  .use(postsRoute); // Add your route
```

### 3. Add OpenAPI Documentation

Enhance your route with detailed OpenAPI documentation:

```typescript
export const postsRoute = new Elysia({ prefix: '/api/v1/posts' }).post(
  '/',
  ({ body }) => {
    const validated = CreatePostSchema.parse(body);
    // ... your logic
  },
  {
    detail: {
      tags: ['Posts'],
      summary: 'Create post',
      description: 'Create a new blog post',
      requestBody: {
        description: 'Post data',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'content'],
              properties: {
                title: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 200,
                  example: 'My First Post',
                },
                content: {
                  type: 'string',
                  example: 'This is the content...',
                },
                published: {
                  type: 'boolean',
                  default: false,
                  example: false,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              example: {
                data: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  title: 'My First Post',
                  content: 'This is the content...',
                  published: false,
                  createdAt: '2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error',
        },
      },
    },
    body: t.Object({
      title: t.String(),
      content: t.String(),
      published: t.Optional(t.Boolean()),
    }),
  }
);
```

## Zod Validation Examples

### Basic Schema

```typescript
const UserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120).optional(),
});
```

### Query Parameters

```typescript
const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  search: z.string().optional(),
});

// Usage
const validated = QuerySchema.parse(query);
```

### Enums

```typescript
const RoleSchema = z.enum(['user', 'admin', 'moderator']);
```

### Nested Objects

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string().length(2), // ISO country code
});

const UserWithAddressSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});
```

### Arrays

```typescript
const TagsSchema = z.array(z.string()).min(1).max(5);
```

### Custom Validation

```typescript
const PasswordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number');
```

## Error Handling

All validation errors are automatically caught and formatted:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "email",
        "message": "Invalid email",
        "code": "invalid_string"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## OpenAPI/Swagger Configuration

The API uses `@elysiajs/swagger` to automatically generate OpenAPI documentation.

### Features

- ✅ **Automatic Schema Generation** - Schemas generated from TypeBox types
- ✅ **Interactive UI** - Test endpoints directly in the browser
- ✅ **Request Examples** - Sample requests and responses
- ✅ **Multiple Environments** - Development and production servers
- ✅ **Security Schemes** - JWT Bearer authentication documented
- ✅ **Tags & Groups** - Organized endpoints by category

### Customization

To customize the Swagger configuration, edit `src/index.ts`:

```typescript
.use(
  swagger({
    documentation: {
      info: {
        title: 'Your API Title',
        version: '2.0.0',
        description: 'API description',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      tags: [
        { name: 'Users', description: 'User management' },
        { name: 'Posts', description: 'Blog posts' },
      ],
      servers: [
        { url: 'http://localhost:3000', description: 'Development' },
        { url: 'https://api.example.com', description: 'Production' },
      ],
    },
    path: '/docs',  // Change docs URL
    exclude: ['/docs', '/docs/json'],  // Exclude from docs
  })
)
```

### Adding Security to Endpoints

Document authenticated endpoints:

```typescript
.get(
  '/protected',
  () => { /* ... */ },
  {
    detail: {
      security: [{ bearerAuth: [] }],  // Requires JWT
      summary: 'Protected endpoint',
    },
  }
)
```

### Advanced OpenAPI Examples

**Query Parameters:**

```typescript
detail: {
  parameters: [
    {
      name: 'filter',
      in: 'query',
      description: 'Filter results',
      required: false,
      schema: { type: 'string', enum: ['active', 'inactive'] },
    },
  ],
}
```

**Response Schemas:**

```typescript
detail: {
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: { type: 'array', items: { type: 'object' } },
              total: { type: 'number' },
            },
          },
        },
      },
    },
  },
}
```

**Headers:**

```typescript
detail: {
  parameters: [
    {
      name: 'X-API-Key',
      in: 'header',
      description: 'API Key',
      required: true,
      schema: { type: 'string' },
    },
  ],
}
```

## Logging

Use Pino logger throughout your routes:

```typescript
import { logger } from '../config/logger';

// Different log levels
logger.trace('Very detailed debugging');
logger.debug({ userId: '123' }, 'Debug info');
logger.info({ action: 'create' }, 'User created');
logger.warn({ ip: '1.2.3.4' }, 'Suspicious activity');
logger.error({ error: err }, 'Operation failed');
logger.fatal({ error: err }, 'Critical failure');
```

## Environment Variables

See `.env.example` for all available configuration options.

Required variables:

- `DATABASE_URL` or PostgreSQL connection details
- `REDIS_URL` or Redis connection details
- `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

Optional variables:

- `LOG_LEVEL` (trace, debug, info, warn, error, fatal)
- `CORS_ORIGIN` (default: \*)
- `PORT` (default: 3000)

## Scripts

```bash
bun run dev          # Start development server
bun run check-types  # Type check
bun run lint         # Lint code
bun run format       # Format code
```

## Security

The API includes the following security features:

- ✅ CORS protection
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Request rate limiting (via reverse proxy recommended)
- ✅ Input validation with Zod
- ✅ Environment variable validation
- ✅ Structured error handling

## Production Deployment

1. Build and deploy using Docker
2. Set `NODE_ENV=production`
3. Configure proper `CORS_ORIGIN`
4. Enable HTTPS and uncomment HSTS in `security.ts`
5. Use a reverse proxy (Nginx, Caddy) for:
   - SSL/TLS termination
   - Rate limiting
   - Load balancing

## License

MIT
