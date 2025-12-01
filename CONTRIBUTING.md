# Contributing to Quick Notes

Thank you for your interest in contributing to Quick Notes! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- Firebase account (for testing)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/loii08/quick-notes.git
cd quick-notes

# Install dependencies
npm install

# Create .env.local with Firebase credentials
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
├── constants.ts        # Application constants
├── firebase.ts         # Firebase configuration
├── App.tsx             # Main app component
└── main.tsx            # Entry point

public/                 # Static assets
scripts/                # Build and utility scripts
```

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes
- Follow the coding standards (see below)
- Write clear, descriptive commit messages
- Keep commits atomic and focused

### 3. Test Your Changes
```bash
npm run dev
# Test in browser
# Test offline functionality
# Test on mobile devices
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

### 5. Create a Pull Request
- Provide a clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass

## Coding Standards

### TypeScript
- Use strict mode
- Define types for all functions and variables
- Avoid `any` type
- Use interfaces for object shapes

### React
- Use functional components with hooks
- Use `useCallback` for memoization
- Avoid unnecessary re-renders
- Keep components focused and small

### Naming Conventions
- Components: PascalCase (e.g., `NoteCard.tsx`)
- Functions: camelCase (e.g., `handleAddNote`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_CATEGORIES`)
- Files: kebab-case for utilities (e.g., `date-utils.ts`)

### Code Style
- Use 2-space indentation
- Use single quotes for strings
- Use semicolons
- Use trailing commas in multi-line objects/arrays
- Max line length: 100 characters (soft limit)

### Comments and Documentation
- Add JSDoc comments for functions
- Explain complex logic
- Keep comments up-to-date
- Use meaningful variable names

Example:
```typescript
/**
 * Formats a timestamp as "time ago" string
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted string (e.g., "5m ago")
 */
export const formatTimeAgo = (timestamp: number | null): string => {
  // Implementation
};
```

## Testing

### Manual Testing Checklist
- [ ] Feature works on desktop
- [ ] Feature works on mobile
- [ ] Feature works offline
- [ ] Feature syncs correctly when back online
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Accessibility is maintained

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, dependencies, etc.

### Examples
```
feat(notes): add bulk delete functionality
fix(auth): prevent password from being stored in localStorage
docs(security): add security policy
refactor(utils): extract date formatting logic
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guide
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Changes are tested
- [ ] Commit messages are clear
- [ ] PR description is detailed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
```

## Issue Guidelines

### Reporting Bugs
Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Screenshots/videos if applicable

### Requesting Features
Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternative solutions considered

## Documentation

### Updating README
- Keep it concise and up-to-date
- Include setup instructions
- Add examples for common tasks
- Link to detailed documentation

### Adding Comments
- Explain "why", not "what"
- Keep comments concise
- Update comments when code changes
- Remove outdated comments

## Performance Considerations

- Minimize re-renders using `useMemo` and `useCallback`
- Lazy load components when possible
- Optimize images and assets
- Use efficient algorithms
- Profile performance regularly

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast

## Security

- Never commit secrets or credentials
- Validate and sanitize user input
- Use HTTPS for external requests
- Follow OWASP guidelines
- Report security issues privately

## Questions?

- Check existing issues and discussions
- Read the documentation
- Ask in GitHub discussions
- Email: support@quicknotes.app

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Quick Notes! 🎉
