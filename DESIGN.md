# Bloody Roar Design System

## 1. Overview
Bloody Roar uses a modern, Vercel-inspired dark theme for its decentralized bounty marketplace. The design focuses on high contrast, sleek components, and minimal distractions to keep the focus on tasks and code.

## 2. Color Palette
- **Background**: Deep black or very dark gray (`#000000` to `#111111`)
- **Surface**: Dark gray for cards and modals (`#1A1A1A` to `#222222`)
- **Primary Accent**: Neon accents for CTAs, typically cyan, purple, or electric blue depending on the context.
- **Text Primary**: Crisp white (`#FFFFFF`) or off-white (`#EAEAEA`) for maximum readability.
- **Text Secondary**: Muted gray (`#888888` or `#A0A0A0`) for secondary information.

## 3. Typography
- **Font Family**: Primary font is **Inter** or similar modern sans-serif (e.g., Roboto).
- **Headings**: Bold, clean, and tight kerning.
- **Body**: Standard weight, highly readable for both code snippets and descriptions.

## 4. Components
### Buttons
- **Primary**: Solid background with primary accent color.
- **Secondary**: Transparent background with subtle border and text color matching the accent or white.
- **Hover States**: Subtle brightness increase or shadow glow.

### Cards (Bounties & Issues)
- Subtly rounded corners (e.g., `rounded-lg` or `rounded-xl` in Tailwind).
- Thin, subtle borders (`#333333`) to distinguish from the background.
- Hover effects include a slight upward shift or a border color change to the primary accent.

## 5. Layout
- **Navigation**: Top navigation bar with quick links and user profile/wallet connection status.
- **Main Content**: Centered, max-width container for the marketplace feed.
- **Grid**: Use a responsive grid system for displaying bounties, scaling from 1 column on mobile to 3-4 columns on large screens.

## 6. Accessibility & Contrast
- Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.
- Ensure all interactive elements have distinct focus states for keyboard navigation.
