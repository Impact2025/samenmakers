---
name: Samenmakers
colors:
  surface: '#f8faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f8faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f0'
  surface-container: '#eceeea'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e1e3df'
  on-surface: '#191c1a'
  on-surface-variant: '#404943'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#eff1ed'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#713638'
  on-tertiary: '#ffffff'
  tertiary-container: '#8d4d4e'
  on-tertiary-container: '#ffcfce'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b3'
  on-tertiary-fixed: '#390b0e'
  on-tertiary-fixed-variant: '#6f3537'
  background: '#f8faf6'
  on-background: '#191c1a'
  surface-variant: '#e1e3df'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 80px
  section-padding: 160px
---

## Brand & Style

This design system is rooted in the philosophy of **Reductive Functionalism**. It strips away the unnecessary to amplify the essential, creating a high-trust environment for Dutch entrepreneurs. The aesthetic is a fusion of Swiss Modernism and contemporary tech-minimalism, prioritizing clarity, precision, and confidence.

The visual narrative is defined by "extreme restraint." By utilizing massive white space and razor-sharp structural elements, the system communicates a level of professional maturity found in high-end architectural journals. There are no shadows, no gradients, and no decorative flourishes—only content and the structural containers that hold it.

## Colors

The palette is strictly functional. The primary background is a sterile white to provide maximum "breathing room." Typography is anchored in a near-black for high contrast without the optical vibration of pure black.

The **Warm Forest Green** is a "high-intent" color. It is reserved exclusively for primary calls to action and critical success states. It should never be used for decorative elements, icons, or secondary buttons. This isolation ensures that when color appears, it signals a definitive path forward for the user.

## Typography

This design system utilizes **Inter** for its neutral, systematic precision. The typographic hierarchy is built on extreme contrast. 

- **Headlines:** Set in Bold weights with tight letter-spacing and aggressive line-heights. They should feel like structural blocks.
- **Body Text:** Set in Light weights at smaller scales. The generous line-height compensates for the small size, ensuring readability while maintaining a delicate, sophisticated aesthetic.
- **Micro-copy:** Use the uppercase label style for navigation and metadata to create a distinct visual rhythm compared to the light body text.

## Layout & Spacing

The layout follows a **Fixed Grid** model with exaggerated margins. We use a 12-column grid, but the true character of the system comes from the "void." 

Vertical rhythm is driven by an 8px base unit. Sections should be separated by massive padding (160px+) to ensure that different concepts never feel crowded. The objective is to make the user feel like they are standing in an empty, well-lit gallery where every piece of information has the room to be considered individually.

## Elevation & Depth

Depth is conveyed through **Hair-line Borders** and structural stacking rather than shadows. 

- **The Hair-line:** All borders must be 1px (or 0.5px on high-DPI displays) using a subtle light gray (#E5E5E5). 
- **Z-Axis:** Instead of lifting elements with shadows, we use "Flat Stacking." Elements that are "above" others are simply placed later in the visual flow or separated by clear, thin lines. 
- **Backdrop:** There are no blurs or glass effects. If a modal or overlay is required, it should be a solid white block with a 1px black border to maintain the brutalist integrity.

## Shapes

The design system employs a **Sharp (0px)** radius for all elements. This reinforces the professional, architectural tone of the platform. Rectangular containers, buttons, and input fields must maintain 90-degree angles to echo the precision of a business contract or a structural blueprint.

## Components

### Buttons
- **Primary:** Solid Forest Green (#2D6A4F) background, white text, bold weight, sharp corners. No hover lift—only a slight color darken on interaction.
- **Secondary:** Transparent background, 1px black border, black text.
- **Tertiary:** Text-only, underlined with a 1px stroke.

### Input Fields
Inputs are defined by a single 1px bottom border (#111111). When focused, the border remains black but increases to 2px. Labels sit above the input in the `label-caps` style.

### Cards
Cards are not "boxes" in the traditional sense. They are defined by white space and, if necessary, separated by a 1px horizontal hair-line. Avoid enclosing content in four-sided boxes unless absolutely necessary for data density.

### Lists
Entrepreneurial data (listings, members, projects) should be presented in clean rows separated by 1px hair-line dividers. Use the `body-sm` light weight for descriptions and `headline-md` for titles to maintain the hierarchy of the system.

### Navigation
The navigation should be ultra-minimal: a small logo on the left and 3-4 text links on the right using the `label-caps` style. No background fill for the header; it should sit directly on the white background.