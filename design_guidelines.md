# Design Guidelines: App Launcher Menu

## Design Approach
**System-Based Approach**: Drawing from Linear's clean functionality and Chrome's new tab page simplicity. This utility-focused application prioritizes efficiency, clarity, and ease of use over decorative elements.

## Typography
- **Primary Font**: Inter (Google Fonts CDN)
- **Hierarchy**:
  - Page Title: text-4xl, font-bold
  - App Card Names: text-lg, font-semibold
  - Form Labels: text-sm, font-medium
  - Button Text: text-base, font-medium

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently (e.g., p-4, gap-6, m-8)

**Container Structure**:
- Max width: max-w-6xl
- Centered: mx-auto
- Outer padding: px-6 py-8

## Core Components

### Header Section
- Full-width with bottom border
- Contains page title "App Launcher" (left-aligned)
- "Add New App" button (right-aligned)
- Height: auto with py-6
- Flex layout for alignment

### App Grid
- Responsive grid: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Gap: gap-6
- Auto-fit cards based on content
- Minimum card height for consistency

### App Cards
**Structure**:
- Rounded corners: rounded-lg
- Border: border with subtle width
- Padding: p-6
- Hover state: subtle shadow elevation
- Clickable entire card area

**Content Layout**:
- App name at top (text-lg, font-semibold)
- URL displayed below in smaller text (text-sm, truncate)
- Delete button: small, icon-only (trash icon from Heroicons), positioned top-right corner
- All elements aligned for clean visual hierarchy

### Add App Modal/Form
**Modal Overlay**:
- Full viewport overlay with backdrop blur
- Centered modal card: max-w-md
- Padding: p-8
- Rounded: rounded-xl

**Form Structure**:
- Title: "Add New App" (text-2xl, font-bold)
- Two input fields stacked vertically with gap-4:
  - App Name (text input)
  - App URL (text input, placeholder: "https://")
- Input styling: p-3, rounded-md, border, full width
- Button row: flex justify-end with gap-3
  - Cancel button (secondary style)
  - Add button (primary style)

### Empty State
- Centered vertically and horizontally in grid area
- Icon: large application icon from Heroicons
- Message: "No apps yet. Add your first app to get started."
- Subtle text treatment
- Height: min-h-[400px] to prevent layout jump

## Component Library

### Buttons
**Primary Button** (Add, Submit):
- Padding: px-6 py-3
- Rounded: rounded-lg
- Font: font-medium
- Full opacity, solid appearance

**Secondary Button** (Cancel):
- Same padding as primary
- Border style instead of filled
- Matches primary corner radius

**Icon Button** (Delete):
- Compact: p-2
- Rounded: rounded-md
- Icon size: w-5 h-5
- Hover state with subtle background

### Form Inputs
- Height: h-12 for comfortable touch targets
- Padding: px-4
- Border: border with standard width
- Rounded: rounded-md
- Focus ring with offset

## Icons
**Library**: Heroicons (via CDN)
- Plus icon for "Add New App" button
- Trash icon for delete functionality  
- Application/Grid icon for empty state
- External link icon for app cards (optional visual indicator)

## Accessibility
- All interactive elements have min-height of 44px (touch target)
- Clear focus states on all inputs and buttons
- Modal traps focus and closes on Escape key
- Delete action requires confirmation (simple browser confirm)
- ARIA labels on icon-only buttons

## Animations
**Minimal approach**:
- Card hover: smooth shadow transition (duration-200)
- Modal: fade in/out with backdrop (duration-300)
- No scroll animations or complex interactions

## Layout Behavior
- Grid adjusts responsively: 1 column mobile, 3 tablet, 4 desktop
- Modal remains centered at all viewport sizes
- Header remains fixed proportions with responsive padding
- Cards maintain aspect ratio consistency

## Images
**No images required** - This is a purely functional interface focused on text and iconography. The visual interest comes from the grid layout and card organization.