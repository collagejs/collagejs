# AI Agent Instructions - CollageJS Theme System

## 📝 Documentation Maintenance Rule

**CRITICAL:** Whenever any theme source files are modified, the [README.md](./README.md) in this folder MUST be reviewed and updated for accuracy.

## File Structure Overview

The theme system is split into modular CSS files:

- **`base.css`** - Fundamental definitions (font stacks, border radius scale)
- **`colors.css`** - Complete color system (brand colors, RGB variants, semantic colors, opacity system, contrast colors)
- **components.css** - Component styles (buttons, forms, cards, tables, tabs, badges, button groups)
- **`utilities.css`** - Utility classes (spacing, layout, colors, typography, logo sizing)
- **`variants.css`** - Theme variants (accent, sky, nature, royal, dark themes, glass effects)
- **`theme.css`** - Main import file that ties everything together

## What to Update in README When Files Change

### When `base.css` changes:
- Font family examples
- Border radius scale values
- Any new fundamental definitions

### When `colors.css` changes:
- Brand color hex values and RGB variants
- Opacity system variables (`--cjs-bg-opacity`, `--cjs-text-opacity`, etc.)
- Contrasting foreground color definitions
- Glass effect system variables
- Theme color assignments (primary/secondary/accent/warning)
- Computed color variants (primary-50 through primary-900)
- Neutral color palette
- Semantic color definitions

### When `components.css` changes:
- Button variant examples (primary, secondary, outline, ghost, neutral)
- Button modifiers (sizes: sm/lg, with-logo)
- Form component examples (inputs, range inputs, input groups)
- Card structure and classes
- New components (tabs, tables, badges, button groups)
- Component-specific features and states

### When `utilities.css` changes:
- Text color utilities
- Background color utilities (including brand-specific: indigo, cyan, green, orange)
- Contrast utilities (`.cjs-contrast-light`, `.cjs-contrast-dark`)
- Gradient background utilities
- Spacing classes (padding/margin scales)
- Layout utilities (flex, grid, alignment, gap)
- Border utilities (rounded variants, border thickness)
- Shadow utilities
- Logo sizing classes
- Typography utilities

### When `variants.css` changes:
- Theme variant descriptions (accent, sky, nature, royal)
- Dark theme behavior and overrides
- Glass effect variants and accessibility presets
- How variants combine (e.g., `cjs-theme-dark cjs-theme-accent`)

### When `theme.css` changes:
- Import order
- Global base styles
- Default font and text styles
- Scoping examples

## Documentation Standards

When updating README, ensure:

1. **Accuracy** - All CSS variable names, class names, and values match the actual implementation
2. **Completeness** - Document all available features, not just common ones
3. **Examples** - Provide practical, copy-paste ready HTML/CSS examples
4. **Context** - Explain when to use each feature and why it exists
5. **Browser Support** - Note any modern CSS features that may have compatibility concerns
6. **Accessibility** - Highlight accessible alternatives (e.g., glass effect presets)

## Why This Matters

The README serves as the primary documentation for theme consumers. Outdated documentation leads to:
- Broken implementations
- Support requests
- Poor developer experience
- Reduced adoption
- Incorrect usage patterns

Keep the documentation as polished as the code itself. This is a micro-frontend theme system - precision matters.
