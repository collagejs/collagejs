# CollageJS Theme System

A flexible, modern CSS theme system based on the CollageJS logo colors, designed for **micro-frontend architectures** with arbitrary DOM scoping.

## 🚀 Micro-Frontend Ready

Unlike traditional CSS frameworks that assume `:root` control, CollageJS themes work within **any DOM container**, making them perfect for:
- Shadow DOM encapsulation
- Micro-frontend integration
- Component libraries
- Scoped styling contexts

## ⚠️ Important Notice

**TL;DR:** Built for us, shared with you. Use it, learn from it, but don't expect support for your custom needs.

This theme system is primarily designed for official CollageJS tools (such as `@collagejs/imo` and [collagejs.dev](https://collagejs.dev)). While released under the MIT license, **this is built for our specific needs first**.

We provide this on a **"best effort" basis** - if you want to use it in your projects, great! But please **copy and modify it** rather than expecting us to accommodate general-purpose use cases.

## Quick Start

```html
<!-- Include the theme -->
<link rel="stylesheet" href="path/to/collagejs/theme.css">

<!-- Apply to any container -->
<div data-collagejs-theme class="cjs-theme-accent">
  <button class="cjs-btn cjs-btn-primary">Orange Primary Button</button>
</div>

<div class="cjs-themed cjs-theme-sky">
  <button class="cjs-btn cjs-btn-primary">Cyan Primary Button</button>
</div>
```

## Scoping Options

### Option 1: Data Attributes (Recommended for MFEs)
```html
<div data-collagejs-theme class="cjs-theme-nature">
  <!-- Theme scoped here -->
</div>
```

### Option 2: Class-based Scoping
```html
<div class="cjs-themed cjs-theme-accent">
  <!-- Traditional class approach -->
</div>
```

### Option 3: Custom Selectors
Define your own CSS variables for complete control:

```css
[data-collagejs-imo] {
  --cjs-primary: var(--cjs-brand-cyan-start);
  --cjs-primary-rgb: var(--cjs-brand-cyan-start-rgb);
  --cjs-bg-opacity: 0.8;
}
```

```html
<div data-collagejs-imo>
  <button class="cjs-btn cjs-btn-primary">Your Custom Theme</button>
</div>
```

## 🎨 Color System

### Brand Colors (The Foundation)

8 colors extracted from the CollageJS logo gradients:

```css
/* Indigo-Purple Gradient */
--cjs-brand-indigo-start: #4F46E5;
--cjs-brand-indigo-end: #7C3AED;

/* Cyan-Blue Gradient */
--cjs-brand-cyan-start: #06B6D4;
--cjs-brand-cyan-end: #0EA5E9;

/* Green Gradient */
--cjs-brand-green-start: #10B981;
--cjs-brand-green-end: #059669;

/* Orange Gradient */
--cjs-brand-orange-start: #F59E0B;
--cjs-brand-orange-end: #D97706;
```

### RGB Variants for Transparency

Every brand color includes an **RGB variant** for use with `rgba()`:

```css
/* Examples */
background: rgba(var(--cjs-brand-cyan-start-rgb), 0.3);
border: 2px solid rgba(var(--cjs-brand-green-start-rgb), 0.8);
color: rgba(var(--cjs-brand-orange-start-rgb), 0.6);
```

**Why RGB variants?** CSS `rgba()` requires separate R, G, B values, not hex colors.

### Theme Colors (Configurable)

Theme colors are **aliases** that can be overridden:

```css
--cjs-primary: var(--cjs-brand-indigo-start);      /* Indigo by default */
--cjs-primary-end: var(--cjs-brand-indigo-end);
--cjs-primary-gradient: linear-gradient(135deg, var(--cjs-primary), var(--cjs-primary-end));

--cjs-secondary: var(--cjs-brand-cyan-start);      /* Cyan by default */
--cjs-accent: var(--cjs-brand-green-start);        /* Green by default */
--cjs-warning: var(--cjs-brand-orange-start);      /* Orange by default */
```

Change what `--cjs-primary` points to, and all components automatically update.

### Contrasting Foreground Colors

**The Problem:** What text color should I use on a colored background?

**The Solution:** Semantic contrasting foreground colors.

```css
/* For use on LIGHT backgrounds (dark text) */
--cjs-foreground-on-light: #1F2937;              /* Dark gray */
--cjs-foreground-on-light-muted: #4B5563;        /* Lighter version */

/* For use on DARK backgrounds (light text) */
--cjs-foreground-on-dark: #F9FAFB;               /* Soft white */
--cjs-foreground-on-dark-muted: #D1D5DB;         /* Darker version */

/* Perfect contrast pairs */
--cjs-contrast-light-bg: var(--cjs-foreground-on-dark);    /* Light BG */
--cjs-contrast-light-text: var(--cjs-foreground-on-light); /* Dark text */
--cjs-contrast-dark-bg: var(--cjs-foreground-on-light);    /* Dark BG */
--cjs-contrast-dark-text: var(--cjs-foreground-on-dark);   /* Light text */

/* Semantic text colors */
--cjs-text-on-primary: var(--cjs-foreground-on-dark);   /* For primary buttons */
--cjs-text-on-secondary: var(--cjs-foreground-on-dark); /* For secondary buttons */
--cjs-text-on-light: var(--cjs-foreground-on-light);    /* For light BGs */
--cjs-text-on-dark: var(--cjs-foreground-on-dark);      /* For dark BGs */
```

**Usage:**
```css
.my-button {
  background: var(--cjs-primary);
  color: var(--cjs-text-on-primary);  /* Always perfect contrast */
}
```

### Neutral Colors

Grayscale palette from light to dark:

```css
--cjs-white: #FAFAFA;
--cjs-gray-50: #F9FAFB;
--cjs-gray-100: #F3F4F6;
--cjs-gray-200: #E5E7EB;
--cjs-gray-300: #D1D5DB;
--cjs-gray-400: #9CA3AF;
--cjs-gray-500: #6B7280;
--cjs-gray-600: #4B5563;
--cjs-gray-700: #374151;
--cjs-gray-800: #1F2937;
--cjs-gray-900: #111827;
--cjs-black: #0F172A;
```

### Primary Color Variants

10 shades generated from the primary color (50-900):

```css
--cjs-primary-50: color-mix(in srgb, var(--cjs-primary) 10%, white);
--cjs-primary-100: color-mix(in srgb, var(--cjs-primary) 20%, white);
/* ... continues through ... */
--cjs-primary-900: color-mix(in srgb, var(--cjs-primary) 20%, black);
```

These automatically update when you change `--cjs-primary`.

## ✨ Opacity System

Control transparency globally:

```css
[data-collagejs-theme] {
  --cjs-bg-opacity: 1;           /* Background opacity */
  --cjs-border-opacity: 1;       /* Border opacity */
  --cjs-text-opacity: 1;         /* Text opacity */
  --cjs-highlight-opacity: 0.11; /* Highlight/overlay opacity */
}
```

All color variables respect these opacity settings.

## 🌟 Glass Effects

### Basic Glass Effect

```html
<div data-collagejs-theme class="cjs-glass">
  <button class="cjs-btn cjs-btn-primary">Glass Button</button>
</div>
```

### Configurable Glass Variables

```css
--cjs-glass-blur: 9px;          /* Blur intensity */
--cjs-glass-saturation: 120%;   /* Color saturation */
--cjs-glass-bg-opacity: 0.1;    /* Background opacity */
--cjs-glass-border-opacity: 0.2; /* Border opacity */
```

### Accessibility Presets

Combine with `.cjs-glass` for different intensities:

```html
<!-- Subtle - for users sensitive to visual effects -->
<div data-collagejs-theme class="cjs-glass cjs-glass-subtle">

<!-- Strong - maximum effect -->
<div data-collagejs-theme class="cjs-glass cjs-glass-strong">

<!-- No blur - transparency without blur -->
<div data-collagejs-theme class="cjs-glass cjs-glass-no-blur">
```

## 🌈 Theme Variants

Apply these classes to change the primary/secondary color scheme:

```html
<!-- Default: Indigo primary, Cyan secondary -->
<div data-collagejs-theme>

<!-- Accent: Orange primary, Green secondary -->
<div data-collagejs-theme class="cjs-theme-accent">

<!-- Sky: Cyan primary, Green secondary -->
<div data-collagejs-theme class="cjs-theme-sky">

<!-- Nature: Green primary, Cyan secondary -->
<div data-collagejs-theme class="cjs-theme-nature">

<!-- Royal: Indigo primary, Cyan secondary -->
<div data-collagejs-theme class="cjs-theme-royal">
```

### Dark Theme

The dark theme changes neutral colors but **preserves brand colors**:

```html
<!-- Dark with default indigo -->
<div data-collagejs-theme class="cjs-theme-dark">

<!-- Dark with orange primary -->
<div data-collagejs-theme class="cjs-theme-dark cjs-theme-accent">

<!-- Dark with glass effect -->
<div data-collagejs-theme class="cjs-theme-dark cjs-glass">
```

**What changes in dark theme:**
- `--cjs-background` becomes dark gray
- `--cjs-text` becomes light
- Primary variants are inverted (50-900 become darker/lighter in reverse)
- Brand colors remain the same

## 🧩 Components

### Buttons

```html
<!-- Basic variants -->
<button class="cjs-btn cjs-btn-primary">Primary</button>
<button class="cjs-btn cjs-btn-secondary">Secondary</button>
<button class="cjs-btn cjs-btn-outline">Outline</button>
<button class="cjs-btn cjs-btn-ghost">Ghost</button>
<button class="cjs-btn cjs-btn-neutral">Neutral</button>

<!-- Semantic -->
<button class="cjs-btn cjs-btn-success">Success</button>
<button class="cjs-btn cjs-btn-warning">Warning</button>

<!-- Sizes -->
<button class="cjs-btn cjs-btn-primary cjs-btn-sm">Small</button>
<button class="cjs-btn cjs-btn-primary">Default</button>
<button class="cjs-btn cjs-btn-primary cjs-btn-lg">Large</button>

<!-- With logo -->
<button class="cjs-btn cjs-btn-primary cjs-btn-with-logo">
  <img src="logo.svg" class="cjs-logo" alt="">
  Action
</button>

<!-- Ghost with semantic color -->
<button class="cjs-btn cjs-btn-ghost cjs-btn-primary">Primary Ghost</button>
```

**Button Variants:**
- `.cjs-btn-primary` - Gradient background with light text
- `.cjs-btn-secondary` - Secondary color gradient
- `.cjs-btn-outline` - Transparent with colored border
- `.cjs-btn-ghost` - Transparent, shows color on hover
- `.cjs-btn-neutral` - Blends with any background (no color contribution)
- `.cjs-btn-success` - Green accent gradient
- `.cjs-btn-warning` - Orange warning gradient

### Button Groups

```html
<div class="cjs-btn-group">
  <button class="cjs-btn cjs-btn-outline">Left</button>
  <button class="cjs-btn cjs-btn-outline">Middle</button>
  <button class="cjs-btn cjs-btn-outline">Right</button>
</div>
```

### Forms

```html
<!-- Basic input -->
<input type="text" class="cjs-input" placeholder="Enter text...">

<!-- Input group -->
<div class="cjs-input-group">
  <span class="cjs-addon">@</span>
  <input type="text" class="cjs-input" placeholder="username">
  <button class="cjs-btn cjs-btn-primary">Go</button>
</div>

<!-- Range input (automatically themed) -->
<input type="range" min="0" max="100" value="50">
```

### Cards

```html
<div class="cjs-card">
  <div class="cjs-card-header">
    <h3>Card Title</h3>
  </div>
  <div class="cjs-card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="cjs-card-footer">
    <button class="cjs-btn cjs-btn-primary">Action</button>
  </div>
</div>
```

### Tabs

```html
<ul class="cjs-tabs">
  <li><button class="active">Tab 1</button></li>
  <li><button>Tab 2</button></li>
  <li><button>Tab 3</button></li>
</ul>

<div class="cjs-tab-panel">
  Content for active tab
</div>
```

### Tables

```html
<table class="cjs-table striped normal">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

**Modifiers:**
- `.striped` - Alternating row colors
- `.compact` - Minimal padding
- `.normal` - Standard padding
- `.spacious` - Generous padding

### Badges

```html
<span class="cjs-badge cjs-badge-primary">Primary</span>
<span class="cjs-badge cjs-badge-secondary">Secondary</span>
<span class="cjs-badge cjs-badge-accent">Accent</span>
<span class="cjs-badge cjs-badge-warning">Warning</span>
<span class="cjs-badge cjs-badge-error">Error</span>
```

## 🛠️ Utility Classes

### Text Colors

```html
<p class="cjs-text-primary">Primary color text</p>
<p class="cjs-text-secondary">Secondary color text</p>
<p class="cjs-text-accent">Accent color text</p>
<p class="cjs-text-warning">Warning color text</p>
<p class="cjs-text-muted">Muted text</p>

<!-- Contrasting text colors -->
<p class="cjs-text-on-light">Dark text for light BG</p>
<p class="cjs-text-on-dark">Light text for dark BG</p>
<p class="cjs-text-on-primary">Perfect contrast on primary</p>
```

### Background Colors

```html
<!-- Semantic colors (adapt to theme) -->
<div class="cjs-bg-primary">Primary background</div>
<div class="cjs-bg-secondary">Secondary background</div>
<div class="cjs-bg-accent">Accent background</div>
<div class="cjs-bg-surface">Surface background</div>

<!-- Brand colors (always the same) -->
<div class="cjs-bg-indigo">Indigo background</div>
<div class="cjs-bg-cyan">Cyan background</div>
<div class="cjs-bg-green">Green background</div>
<div class="cjs-bg-orange">Orange background</div>

<!-- Gradients (with automatic contrast text) -->
<div class="cjs-bg-primary-gradient">Primary gradient</div>
<div class="cjs-bg-secondary-gradient">Secondary gradient</div>
<div class="cjs-bg-accent-gradient">Accent gradient</div>

<!-- Contrast pairs -->
<div class="cjs-contrast-light">Light BG, dark text</div>
<div class="cjs-contrast-dark">Dark BG, light text</div>
```

### Spacing

```html
<!-- Padding: p-0, p-1, p-2, p-3, p-4, p-6, p-8 -->
<div class="cjs-p-4">Padding 1rem</div>

<!-- Margin: m-0, m-1, m-2, m-3, m-4, m-6, m-8 -->
<div class="cjs-m-4">Margin 1rem</div>
```

### Layout

```html
<!-- Display -->
<div class="cjs-flex">Flexbox</div>
<div class="cjs-grid">Grid</div>
<div class="cjs-block">Block</div>
<div class="cjs-inline-block">Inline block</div>
<div class="cjs-hidden">Hidden</div>

<!-- Flex direction -->
<div class="cjs-flex cjs-flex-row">Row</div>
<div class="cjs-flex cjs-flex-col">Column</div>

<!-- Alignment -->
<div class="cjs-flex cjs-items-center">Center items</div>
<div class="cjs-flex cjs-justify-between">Space between</div>

<!-- Gap -->
<div class="cjs-flex cjs-gap-4">Gap 1rem</div>
```

### Borders

```html
<div class="cjs-rounded">Small radius</div>
<div class="cjs-rounded-md">Medium radius</div>
<div class="cjs-rounded-lg">Large radius</div>
<div class="cjs-rounded-xl">Extra large radius</div>
<div class="cjs-rounded-pill">Pill shape</div>
<div class="cjs-rounded-circle">Circle</div>

<div class="cjs-border">1px border</div>
<div class="cjs-border-2">2px border</div>
```

### Shadows

```html
<div class="cjs-shadow-sm">Small shadow</div>
<div class="cjs-shadow">Default shadow</div>
<div class="cjs-shadow-md">Medium shadow</div>
<div class="cjs-shadow-lg">Large shadow</div>
```

### Typography

```html
<!-- Sizes -->
<p class="cjs-text-xs">Extra small</p>
<p class="cjs-text-sm">Small</p>
<p class="cjs-text-base">Base</p>
<p class="cjs-text-lg">Large</p>
<p class="cjs-text-xl">Extra large</p>
<p class="cjs-text-2xl">2X large</p>
<p class="cjs-text-3xl">3X large</p>

<!-- Weights -->
<p class="cjs-font-light">Light</p>
<p class="cjs-font-normal">Normal</p>
<p class="cjs-font-medium">Medium</p>
<p class="cjs-font-semibold">Semibold</p>
<p class="cjs-font-bold">Bold</p>

<!-- Monospace -->
<code class="cjs-font-mono">Monospace text</code>
```

### Logo Utilities

```html
<img src="logo.svg" class="cjs-logo cjs-logo-16">   <!-- 16x16 -->
<img src="logo.svg" class="cjs-logo cjs-logo-48">   <!-- 48x48 -->
<img src="logo.svg" class="cjs-logo cjs-logo-64">   <!-- 64x64 -->
<img src="logo.svg" class="cjs-logo cjs-logo-128">  <!-- 128x128 -->
<img src="logo.svg" class="cjs-logo cjs-logo-512">  <!-- 512x512 -->
```

## 🏗️ Real-World Examples

### Shadow DOM Integration

```javascript
class MyMicroFrontend extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Include theme CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'path/to/collagejs/theme.css';
    shadow.appendChild(link);

    // Apply theme
    const container = document.createElement('div');
    container.setAttribute('data-collagejs-theme', '');
    container.className = 'cjs-theme-sky cjs-glass';
    container.innerHTML = `
      <button class="cjs-btn cjs-btn-primary">Isolated Theme</button>
    `;
    shadow.appendChild(container);
  }
}
```

### Vite + Svelte Micro-Frontend

```svelte
<!-- App.svelte -->
<script>
  import 'path/to/collagejs/theme.css';
</script>

<main data-collagejs-theme class="cjs-theme-nature cjs-glass">
  <div class="cjs-card">
    <div class="cjs-card-header">
      <h2>My Micro-Frontend</h2>
    </div>
    <div class="cjs-card-body">
      <button class="cjs-btn cjs-btn-primary">Action</button>
    </div>
  </div>
</main>

<style>
  [data-collagejs-theme] {
    --cjs-glass-blur: 15px;
    --cjs-glass-bg-opacity: 0.12;
  }
</style>
```

### Multiple Themes in One App

```html
<!-- Main app with default theme -->
<div class="cjs-themed">
  <header>
    <h1>Main App</h1>
  </header>

  <!-- Orange-themed section -->
  <section data-collagejs-theme class="cjs-theme-accent">
    <button class="cjs-btn cjs-btn-primary">Orange Primary</button>
  </section>

  <!-- Dark themed modal -->
  <dialog data-collagejs-theme class="cjs-theme-dark cjs-glass">
    <h2>Dark Modal</h2>
    <button class="cjs-btn cjs-btn-primary">Primary in Dark</button>
  </dialog>
</div>
```

## 📦 File Structure

```
theme/
├── theme.css          - Main import file
├── base.css           - Font stacks, border radius
├── colors.css         - Complete color system
├── components.css     - Button, forms, cards, tables, tabs, badges
├── utilities.css      - Utility classes
└── variants.css       - Theme variants, glass effects
```

## 🎯 Design Principles

1. **Micro-frontend first** - Works in any scoped container
2. **Semantic colors** - Never guess what text color to use
3. **Configurable transparency** - Global opacity controls
4. **Accessibility** - Contrast guarantees, glass effect presets
5. **Modern CSS** - `color-mix()`, CSS variables, nested selectors
6. **Framework agnostic** - Pure CSS, works everywhere

## 🔧 Customization

### Override Variables

```css
[data-my-app] {
  /* Use any brand color as primary */
  --cjs-primary: var(--cjs-brand-green-start);
  --cjs-primary-rgb: var(--cjs-brand-green-start-rgb);

  /* Adjust opacity */
  --cjs-bg-opacity: 0.9;

  /* Custom glass settings */
  --cjs-glass-blur: 20px;
  --cjs-glass-saturation: 200%;
}
```

### Combine Classes

```html
<!-- Dark theme + orange primary + glass effect -->
<div data-collagejs-theme class="cjs-theme-dark cjs-theme-accent cjs-glass cjs-glass-strong">
  <button class="cjs-btn cjs-btn-primary">All Combined</button>
</div>
```

## 🤝 Contributing

This is built for CollageJS needs first. If you need changes, please fork and customize for your use case.

## 📄 License

MIT
