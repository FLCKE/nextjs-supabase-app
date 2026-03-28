# 📚 Documentation Index

Complete guide to all documentation files in WEGO RestoPay.

---

## 🚀 Quick Start

**New to the project?** Start here:

1. **[GETTING_STARTED.md](./GETTING_STARTED.md)** (5-10 min read)
   - Installation instructions
   - Running the development server
   - First steps with the application

---

## 📖 Main Documentation

### 1. **[README.md](./README.md)**
   - **Purpose**: Project overview and introduction
   - **Audience**: Everyone
   - **Content**:
     - Project description (WEGO RestoPay)
     - Tech stack highlights
     - Key features

### 2. **[GETTING_STARTED.md](./GETTING_STARTED.md)** ⭐ START HERE
   - **Purpose**: Quick start guide
   - **Audience**: New developers, DevOps engineers
   - **Content**:
     - 5-minute installation
     - Directory structure overview
     - Common commands
     - Environment variables setup
     - Deployment checklist

### 3. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - **Purpose**: Project structure and design patterns
   - **Audience**: Developers, architects
   - **Content**:
     - Complete directory tree with explanations
     - Design patterns and principles
     - Request flows and architecture diagrams
     - Security layers
     - Data flow diagrams

### 4. **[API_REFERENCE.md](./API_REFERENCE.md)**
   - **Purpose**: Complete API endpoint documentation
   - **Audience**: Backend developers, API consumers
   - **Content**:
     - Authentication endpoints
     - Payment API (Moneroo integration)
     - Webhook documentation
     - QR code endpoints
     - Transfer/payout endpoints
     - Data models and schemas
     - Error handling
     - Rate limiting
     - Testing webhooks

### 5. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
   - **Purpose**: Database structure and relationships
   - **Audience**: Backend developers, DBAs
   - **Content**:
     - Complete table schemas (SQL)
     - Field descriptions and types
     - Table relationships
     - Row-Level Security (RLS) policies
     - Database indexes
     - Real-time subscriptions
     - Common SQL queries
     - Backup and migration procedures

### 6. **[COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)**
   - **Purpose**: Reusable components and React hooks
   - **Audience**: Frontend developers
   - **Content**:
     - UI components (Radix + Tailwind)
     - Custom hooks (useUser, useOrders, etc.)
     - Layout components
     - Form components
     - Usage examples
     - Performance tips
     - Common patterns

### 7. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**
   - **Purpose**: Developer workflow and contribution guide
   - **Audience**: Developers contributing to the project
   - **Content**:
     - Development environment setup
     - Branching and Git workflow
     - Code standards and conventions
     - TypeScript usage
     - Testing procedures
     - Debugging techniques
     - Database migrations
     - Common development tasks
     - Troubleshooting

### 8. **[WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)**
   - **Purpose**: Payment webhook implementation details
   - **Audience**: Developers working on payments
   - **Content**:
     - Complete webhook API reference
     - Signature verification
     - Idempotence mechanism
     - Request tracing
     - Error handling
     - Testing and debugging
     - Redis monitoring

### 9. **[DOCS_GUIDE.md](./DOCS_GUIDE.md)**
   - **Purpose**: When and how to update documentation
   - **Audience**: All contributors
   - **Content**:
     - Documentation philosophy
     - When to create/update docs
     - Format guidelines
     - File organization
     - Examples and anti-patterns

---

## 🗂️ Documentation by Use Case

### For New Developers
1. Start: [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Understand structure: [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Learn components: [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)
4. Contribute: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

### For Backend Developers
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
2. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Data models
3. [API_REFERENCE.md](./API_REFERENCE.md) - Endpoints
4. [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md) - Payment system
5. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development workflow

### For Frontend Developers
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Project structure
2. [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md) - Component library
3. [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
4. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Workflow

### For DevOps/Deployment Engineers
1. [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Infrastructure needs
3. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database setup
4. [API_REFERENCE.md](./API_REFERENCE.md) - Endpoints to monitor

### For Payment Integration Engineers
1. [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md) - Webhook implementation
2. [API_REFERENCE.md](./API_REFERENCE.md#payments-api) - Payment endpoints
3. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#payments) - Payment table
4. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#testing-a-payment-flow-manual) - Testing

### For Project Managers/Product Owners
1. [README.md](./README.md) - Project overview
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System capabilities
3. [DOCS_GUIDE.md](./DOCS_GUIDE.md) - Documentation standards

---

## 🔍 Quick Reference by Topic

### Application Setup
- Installation: [GETTING_STARTED.md](./GETTING_STARTED.md#installation)
- Environment variables: [GETTING_STARTED.md](./GETTING_STARTED.md#environment-variables)
- Prerequisites: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#prerequisites)

### Project Architecture
- Overall structure: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Routes and pages: [ARCHITECTURE.md](./ARCHITECTURE.md#routes-and-pages)
- Components: [ARCHITECTURE.md](./ARCHITECTURE.md#components-and-ui)
- Design patterns: [ARCHITECTURE.md](./ARCHITECTURE.md#design-patterns)

### Database
- Schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Migrations: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#database-changes)
- Queries: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#common-queries)
- Security (RLS): [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#row-level-security)

### API & Payments
- All endpoints: [API_REFERENCE.md](./API_REFERENCE.md)
- Payment flow: [API_REFERENCE.md](./API_REFERENCE.md#payments-api)
- Webhooks: [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)
- Testing: [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md#testing-webhooks-locally)

### Frontend Development
- Components: [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md#ui-components)
- Hooks: [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md#custom-hooks)
- Examples: [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md#usage-examples)

### Development Workflow
- Setup: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#setup)
- Branching: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#creating-a-feature-branch)
- Code style: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#code-standards)
- Git workflow: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#development-workflow)
- Testing: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#testing)
- Debugging: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#debugging)

### Troubleshooting
- Build errors: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#build-fails-with-typescript-error)
- Redis issues: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#redis-connection-error)
- Supabase issues: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#supabase-connection-error)
- Webhook issues: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#webhook-not-processing)

---

## 📋 File Organization

```
📁 Project Root
├── 📄 README.md                    # Project overview
├── 📄 GETTING_STARTED.md           # Quick start guide ⭐
├── 📄 ARCHITECTURE.md              # System design
├── 📄 API_REFERENCE.md             # API endpoints
├── 📄 DATABASE_SCHEMA.md           # Database structure
├── 📄 COMPONENTS_HOOKS.md          # Frontend components
├── 📄 DEVELOPMENT_GUIDE.md         # Development workflow
├── 📄 WEBHOOK_MONEROO.md           # Payment webhooks
├── 📄 DOCS_GUIDE.md                # Documentation guidelines
└── 📄 DOCUMENTATION_INDEX.md       # This file
```

---

## 🎯 Documentation Standards

All documentation follows these principles:

1. **Clear & Concise**: Easy to understand, no unnecessary jargon
2. **Practical**: Includes examples and real use cases
3. **Complete**: Answers the "what", "why", and "how"
4. **Searchable**: Organized with clear headings and tables of contents
5. **Up-to-date**: Synced with actual code

See [DOCS_GUIDE.md](./DOCS_GUIDE.md) for contribution guidelines.

---

## 🔄 Update Frequency

| Document | Updated | Frequency |
|----------|---------|-----------|
| README.md | Quarterly | Major features |
| GETTING_STARTED.md | Monthly | Dependency changes |
| ARCHITECTURE.md | Monthly | Structure changes |
| API_REFERENCE.md | Per change | Every endpoint change |
| DATABASE_SCHEMA.md | Per change | Every migration |
| COMPONENTS_HOOKS.md | Per change | Every component change |
| DEVELOPMENT_GUIDE.md | Quarterly | Process improvements |
| WEBHOOK_MONEROO.md | As needed | Payment updates |
| DOCS_GUIDE.md | Annually | Guidelines review |

---

## 💡 Tips

### Finding Information

**Use browser search (Ctrl+F / Cmd+F)** within docs:
- Looking for an endpoint? Search in [API_REFERENCE.md](./API_REFERENCE.md)
- Looking for a component? Search in [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)
- Looking for a table? Search in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Looking for how to do something? Search in [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

### Related Files

Each document links to related docs at the bottom. Use these to jump between related topics.

### Examples

All documentation includes code examples that can be copy-pasted and adapted.

---

## ❓ Questions?

1. **Search this index** for your topic
2. **Read the relevant document** listed above
3. **Check examples** in component/API docs
4. **Review code** in src/ directory
5. **Ask on Slack/Discord** (after checking docs!)

---

## 🚀 Next Steps

- **Just getting started?** → [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Understanding the architecture?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Building a feature?** → [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Integrating payments?** → [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)
- **Adding a component?** → [COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)

---

**Last updated**: 2026-03-28  
**Next review**: Q2 2026
