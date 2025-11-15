# Contributing to Loni Panchayat

Thank you for your interest in contributing to the Loni Panchayat Tax Management System! This document provides guidelines and standards for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git
- Firebase account
- Basic knowledge of React, Next.js, and TypeScript

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/loni_panchayat.git
   cd loni_panchayat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase:**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Copy credentials to `.env.local`

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Verify setup:**
   - Open http://localhost:9002
   - Run `npm run typecheck`
   - Run `npm run lint`

## Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-payment-gateway`)
- `fix/` - Bug fixes (e.g., `fix/calculation-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-hooks`)
- `test/` - Test additions/updates (e.g., `test/add-unit-tests`)

### Workflow Steps

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow coding standards
   - Add tests for new features
   - Update documentation

3. **Test your changes:**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## Coding Standards

### TypeScript

- **Use TypeScript for all new code**
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` or proper types
- Use strict mode configuration

```typescript
// Good
interface Property {
  id: string;
  ownerName: string;
  area: number;
}

// Bad
const property: any = { ... };
```

### React Components

- **Use functional components with hooks**
- Extract business logic to custom hooks
- Keep components focused and small (< 200 lines)
- Use proper TypeScript props typing

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ onClick, children, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}
```

### File Organization

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components
│   └── features/    # Feature-specific components
├── lib/             # Utility functions and helpers
├── hooks/           # Custom React hooks
├── config/          # Configuration files
└── types/           # TypeScript type definitions
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`UserData`)

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/TS, double for JSX props
- **Semicolons**: Required
- **Line length**: Max 100 characters
- **Trailing commas**: Always in multiline

### Comments

```typescript
/**
 * Calculate total tax amount based on property details
 * 
 * @param property - Property object with area and type
 * @param taxRate - Tax rate percentage
 * @returns Calculated tax amount in rupees
 */
function calculateTax(property: Property, taxRate: number): number {
  // Implementation
}
```

### Error Handling

```typescript
// Good - Use centralized logger
import { logger } from '@/lib/logger';

try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error as Error, { context: 'details' });
  throw new Error('User-friendly error message');
}

// Bad - Direct console.error
try {
  await riskyOperation();
} catch (error) {
  console.error(error);
}
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature`
- `fix: resolve bug in calculation`
- `docs: update API documentation`
- `refactor: simplify component logic`
- `test: add unit tests for utils`
- `chore: update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript types added/updated
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one code review approval required
3. Address all review comments
4. Maintainer will merge after approval

## Testing Guidelines

### Unit Tests

```typescript
// Example test structure
import { calculateTax } from './tax-calculator';

describe('calculateTax', () => {
  it('should calculate tax correctly for residential property', () => {
    const property = { type: 'Residential', area: 1000 };
    const result = calculateTax(property, 2.5);
    expect(result).toBe(25);
  });

  it('should handle zero area gracefully', () => {
    const property = { type: 'Residential', area: 0 };
    const result = calculateTax(property, 2.5);
    expect(result).toBe(0);
  });
});
```

### Integration Tests

Test critical user flows:
- User registration
- Property registration
- Bill generation
- Payment recording

### Test Coverage

Aim for:
- 80%+ code coverage
- 100% coverage for critical business logic
- All edge cases covered

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Explain business logic
- Include usage examples

### User Documentation

Update when adding features:
- README.md
- User guides in `/docs`
- API documentation
- Deployment guides

### Changelog

Update `CHANGELOG.md` for:
- New features
- Breaking changes
- Bug fixes
- Deprecations

## Questions?

- Check existing issues and discussions
- Ask in pull request comments
- Contact maintainers: admin@lonipanchayat.in

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Loni Panchayat! 🙏
