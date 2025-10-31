# Technology Stack

## Core Technologies

- **Runtime**: Node.js with TypeScript (ESNext target)
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM v8.14.0
- **Package Manager**: bun v10.13.1
- **openAPI Generation**: @asteasolutions/zod-to-openapi, each module (in api folder) will have a doc.ts like user.doc.ts

## Development Tools

- **Build System**: tsdown (TypeScript bundler)
- **Type Checking**: TypeScript v5.8.2 with strict mode
- **Linting**: oxlint v1.12.0 (Rust-based linter) & biome v1.12.0 (Rust-based formatter)
- **Git Hooks**: Husky v9.1.7 with lint-staged
- **Hot Reload**: tsx and bun  for development

## Key Dependencies

- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **@scalar/express-api-reference**: Express API Reference
- **jsonwebtoken**: JSON Web Token (JWT) for authentication
- **bcryptjs**: Password hashing
- **mongoose**: MongoDB Object Data Modeling (ODM)
- **morgan**: HTTP request logger
- **swagger-ui-express**: Swagger UI for API documentation
- **zod**: Runtime type validation
- **nodemailer** : Email sending


## Common Commands

### Development

```bash
bun dev          # Start development server with hot reload
bun dev:b        # Start with Bun hot reload (alternative)
```

### Building & Production

```bash
bun build        # Build with tsdown
bun start        # Start production server
bun compile      # Create standalone executable with Bun
```

### Code Quality

```bash
bun check        # Run oxlint
bun check-types  # TypeScript type checking
bun biome        # Run biome
bun biome format # Format code
```

### Database

```bash
bun db:push      # Apply schema changes (mentioned in README)
bun db:studio    # Open database UI (mentioned in README)
```

## Configuration Notes

- Uses ES modules (`"type": "module"`)
- Path aliases: `@/*` maps to `./src/*`
- Bundler module resolution
- Composite TypeScript project setup
