# CollageJS Core - AI Agent Summary

## Project Overview

**CollageJS** is a micro-frontend (MFE) solution inspired by single-spa parcels, created as an evolution beyond traditional single-spa architecture. The project follows the motto **"BYOR - Bring Your Own Router"**.

## Origin Story & Motivation

The creator (José Pablo Ramírez Vargas) identified single-spa as the best micro-frontend solution among available options:
- **Better than Module Federation**: Provides true framework independence
- **Better than Bit.dev**: No cloud account requirements or vendor lock-in
- **Improvement over single-spa**: Eliminates the router dependency, focusing purely on the parcel concept

### Key Insights:
1. Single-spa's router, while capable, is not optimal
2. Single-spa-layout provides limited web component functionality with stagnant feature development
3. The creator developed their own superior router: `@svelte-router/core` (Svelte v5 router)
4. Single-spa appears to be stagnating with reduced maintainer activity
5. All micro-frontend needs can be satisfied using just single-spa parcels without the router
6. **Factory Pattern Discovery**: Single-spa has a fundamental flaw where multiple instances of the same parcel cannot coexist due to shared state - factories solve this by creating isolated instances
7. **Philosophy**: "Do you like React Router? Then use it!" - Why learn new routing when proven solutions exist?

## Technical Architecture

### Core Concepts

**CollageJS Pieces** are the fundamental building blocks, similar to single-spa parcels but simpler:

```typescript
interface CorePiece<TProps> {
    mount: Mount<TProps>;
    update?: Update<TProps>;
}
```

### Key Features

1. **Flexible Mounting**: Supports single functions, arrays of functions, or nested arrays
2. **Hierarchical Structure**: Pieces can mount child pieces, creating a tree structure
3. **Lifecycle Management**: Automatic cleanup of child pieces when parent unmounts
4. **Props System**: Type-safe property passing and updating
5. **Framework Agnostic**: No router dependency - truly BYOR

### Core Components

#### `MountedPiece` Class
- Manages the lifecycle of mounted pieces
- Tracks parent-child relationships with unique IDs (counter-based generation)
- Handles recursive mounting/unmounting
- Provides update mechanism for props

#### `mountPiece` Function
- Primary API for mounting pieces to DOM elements
- Returns a mounted piece instance and a bound mounting function
- Supports cascading mounts (pieces mounting other pieces)

#### Type System
- **`UnmountFn`**: Cleanup function returned by mount operations
- **`MountFn`**: Function that mounts a piece to a target element
- **`UpdateFn`**: Function that updates a piece with new props
- **`Mount`**: Flexible type supporting single functions or arrays
- **`CorePiece`**: The main piece interface

## Project Structure

```
@collagejs/collagejs/
├── src/
|   ├── logos/             # Collection of CollageJS logos
│   ├── common.ts          # Things used in more than one other module
│   ├── index.ts           # Main exports
│   ├── types.ts           # Core type definitions
│   ├── mountPiece.ts      # Main mounting API
│   ├── MountedPiece.ts    # Core piece management class
│   ├── Stack.ts           # A stack implementation to ensure LIFO processing
│   └── internal-types.ts  # Internal type definitions
├── tests/
│   ├── ut/                # Unit tests (runtime behavior)
│   ├── typetests/         # Type tests (TSTyche)
│   └── setup.ts           # Test environment setup
├── package.json           # NPM package configuration
├── post-build.ps1         # Post-build operations
└── tsconfig.json          # TypeScript configuration
```

## Technical Details

- **Language**: TypeScript with ES2024 target
- **Module System**: ES2022 modules
- **License**: MIT
- **Repository**: GitHub (collagejs/collagejs)
- **Build**: TypeScript compilation + publint validation

> **NOTE**:  Although the repository name is "collagejs", it produces the package "@collagejs/core".

## Testing Guidelines

### Test Infrastructure
- **Framework**: Mocha + Chai + ts-mocha + ts-node
- **DOM Testing**: JSDOM for browser-like environment
- **Type Testing**: TSTyche for comprehensive TypeScript type testing
- **Structure**: `tests/ut/` for unit tests, `tests/typetests/` for type tests

### Test Conventions
1. **Test descriptions**: Plain English sentences with proper grammar
   - Must start capitalized and end with a period
   - Example: `it('Should mount a piece successfully.')`

2. **File structure**: Mirror `src/` structure exactly
   - 1:1 ratio: `src/fileName.ts` → `tests/ut/fileName.test.ts`
   - Same names with `.test.ts` extension
   - **Exception**: No need to create test files for source files that only define TypeScript types

3. **Test organization**: One `describe()` block per exported object
   - Encapsulates unit tests for each class/function
   - Enables focused testing and clear organization

4. **Type testing**: TSTyche for comprehensive compile-time validation
   - Create `.test.ts` files in `tests/typetests/` directory with `describe()` and `test()` helpers
   - Use `expect().type.toBe()`, `expect().type.toBeAssignableTo()`, `expect().type.toBeCallableWith()`, etc.
   - Provides familiar Jest-like test syntax with rich output and test organization
   - Maintains VS Code test file recognition with `.test.ts` extension

### Available Scripts
- `npm test` - Run all tests (unit tests + type tests)
- `npm run test:unit` - Run unit tests only (runtime behavior validation)
- `npm run test:types` - Run type tests only (TSTyche compile-time validation)
- `npm run test:watch` - Run unit tests in watch mode
- `npm run build` - Build and lint

### TSTyche Workflow
TSTyche provides comprehensive type testing with test runner capabilities:
- **Purpose**: Advanced type testing with familiar test syntax and rich output
- **Command**: `npm run test:types` (or `npx tstyche ./tests/typetests`)
- **Integration**: Automatically runs as part of `npm test` along with unit tests
- **Files**: Place `.test.ts` files in `tests/typetests/` directory (maintains VS Code test recognition)
- **Features**: `describe()`, `test()`, watch mode, multiple TypeScript versions
- **Assertions**: `expect().type.toBe()`, `.toBeAssignableTo()`, `.toBeCallableWith()`, etc.
- **Advantages**: Superior test organization, rich output, comprehensive matchers, Jest-like syntax
- **Documentation**: https://tstyche.org/ (official docs for advanced usage and troubleshooting)

## Innovation Points

1. **Simplified Architecture**: Strips away single-spa's router complexity
2. **Pure Parcel Focus**: Concentrates on the most valuable part of single-spa
3. **Router Agnostic**: Enables use of any routing solution - React Router, Vue Router, Angular Router, etc.
4. **No Learning Curve**: Developers can use routing libraries they already know and love
5. **Hierarchical Management**: Built-in parent-child piece relationships
6. **Type Safety**: Full TypeScript support with generic props
7. **Single-spa-layout Alternative**: Provides better flexibility than single-spa's limited web component approach

## Future Considerations

This is a core library that provides the foundation for a micro-frontend ecosystem. The design suggests future companion packages might include:
- Framework-specific adapters (React, Vue, Svelte, etc.)
- Development tools and utilities
- Integration helpers for popular routers

## Philosophy

CollageJS embodies a "less is more" approach - taking the best parts of single-spa (parcels) while eliminating the parts that have become obsolete (routing) in favor of developer choice and flexibility.
