# SCSS (Sass) conventions

## Overview

- This project uses Sass (`.scss`).
- We use CSS Modules (`*.module.scss`) for page and component styles.
- We use BEM naming to keep styles predictable and maintainable.

## CSS Modules

### File naming

- Pages: `index.module.scss`
- Components (including DS/UI components): `ComponentName.module.scss`

### Usage in React components

Import the stylesheet as an object (commonly named `styles`) and reference classes through it.

```tsx
import styles from './ComponentName.module.scss';

<button className={styles.btn} />
<button className={styles.btn__secondary} />
<button className={styles['btn--full']} />
<button className={styles['arrow-btn']} />
<button className={`${styles.btn} ${styles['btn__secondary--disabled']}`} />
```

Notes:

- When a class name contains hyphens, use bracket access: `styles['btn--full']`.

## BEM naming

A BEM class can include up to three parts:

- Block: the outer component root
- Element: a child of the block
- Modifier: a variation of the block or element

Format:

- `[block]__[element]--[modifier]`

## SCSS structure and nesting

### Block-first ordering

Write styles in this order:

1. Block base styles
2. Block modifiers and states/pseudo-classes
3. Elements
4. Element modifiers and states

Avoid splitting BEM parts into separate top-level selectors.

### Order of appearance

Try to write element styles in the order elements appear in the JSX markup.

### Nesting rules

- Only nest:
  - elements (`&__element`)
  - modifiers (`&--modifier`)
  - pseudo-classes/pseudo-elements (`&:hover`, `&::before`)
- Do not nest class names by concatenating pieces (avoid patterns like `&__menu { &-list { ... } }`).
- Do not nest selectors more than 4 levels deep.

## Formatting

- Indentation: 2 spaces.
- Put a semicolon after every declaration.
- When using multiple selectors, give each selector its own line.
- Put a space before `{`.
- Put a space after `:`.
- Put each property on its own line.
- Put blank lines between logical blocks (for example between base styles and modifiers).
- Prefer shorthand properties when possible.
- Do not use units for zero values (`0`, not `0px`).

## Naming

- Class names should be as short as possible but as long as necessary.
- Prefer semantic/generic names over presentation-specific names.
- If two words are needed, prefer hyphens (`booking-detail`) over camelCase or underscores.
- Avoid qualifying class names with type selectors (avoid `div.section__container`).
- Avoid ID selectors.

## React usage notes (className)

- Avoid breaking lines inside `className` string concatenations/conditionals to prevent unintended whitespace.
- Avoid repeating base classes in conditional expressions; prefer base classes first, then conditional additions.

