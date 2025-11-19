# A-Team Trades Pipeline™ - Design Guidelines

## Design Approach

**Selected Approach**: Design System (Tailwind-based) with enterprise SaaS influence

This is a utility-focused diagnostic tool requiring clarity, trust, and professionalism. Drawing inspiration from Linear's clean typography and Stripe's restrained elegance, combined with a construction/trades-appropriate aesthetic that balances approachability with expertise.

## Brand Foundation

**Colors Provided**: Blue #0063FF, Teal #00C2C7, Black, White
**Voice**: Professional, authoritative, results-driven, trustworthy

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
- Headings: 600-700 weight
- Body: 400-500 weight
- UI Elements: 500-600 weight

**Scale**:
- Hero/H1: text-4xl to text-5xl (mobile to desktop)
- H2: text-3xl
- H3: text-2xl  
- Body Large: text-lg
- Body: text-base
- Small/Caption: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component internal padding: p-4 to p-6
- Section vertical spacing: py-12 to py-20
- Container max-width: max-w-5xl
- Chat container: max-w-4xl

**Grid Structure**: Single column focus with centered content alignment

## Page Structure

### Hero Section (Above Chat)
- Compact header area (not full-height)
- Height: ~25vh on desktop, natural height on mobile
- Centered content with max-w-3xl
- H1 headline + short subheadline (2-3 lines max)
- Direct value proposition: "Get Your Free Labour Pipeline Score in 3 Minutes"
- No background image - solid background with subtle texture or gradient overlay

### Chat Container Section
- Dominant page real estate (60-70vh)
- Centered with max-w-4xl
- Prominent card-style container with subtle shadow (shadow-xl)
- Rounded corners: rounded-2xl
- Generous internal padding: p-6 to p-8
- ChatGPT SDK widget embedded here

### Trust Indicators (Below Chat)
- Compact section with social proof
- 3-column grid on desktop (grid-cols-3), stack on mobile
- Stats or testimonial snippets
- Spacing: py-12

### Footer
- Minimal utility footer
- Single row layout
- Copyright, links, Develop Coaching branding
- Height: py-8

## Component Specifications

### ChatGPT Widget Container
- White/light surface with elevated appearance
- Border: subtle 1px in brand color at 10% opacity
- Shadow: shadow-2xl for depth
- Responsive padding: p-6 (mobile) to p-10 (desktop)
- Minimum height: min-h-[600px]
- Background: Clean white or very subtle off-white

### Widget Cards (GPT Results Display)
- Rounded: rounded-xl
- Padding: p-5
- Border: 1px subtle
- Shadow: shadow-md on hover
- Spacing between cards: gap-4

### Form Widgets (Email/Phone Capture)
- Input fields with generous height: h-12
- Rounded: rounded-lg
- Focus states with brand color outline
- Submit buttons use primary brand color
- Button height: h-12, full width on mobile

### CTA Buttons
- Height: h-12 to h-14
- Rounded: rounded-lg
- Font weight: font-semibold
- Padding: px-8
- Transition: all 300ms ease

### Traffic Light Score Displays
- Large circular or pill-shaped badges
- Size: w-16 h-16 minimum
- Bold score typography: text-2xl font-bold
- Clear color coding (provided by brand palette)

## Responsive Behavior

**Mobile (< 768px)**:
- Single column everything
- Chat container: p-4, full-width with small margins (mx-4)
- Hero text: text-3xl
- Reduced vertical spacing: py-8

**Tablet (768px - 1024px)**:
- Chat container: max-w-3xl
- Moderate spacing: py-12

**Desktop (> 1024px)**:
- Chat container: max-w-4xl
- Full spacing: py-16 to py-20
- Multi-column trust indicators

## Interaction Patterns

- **No complex animations**: Simple opacity/transform transitions only
- **Widget interactions**: Managed by ChatGPT SDK - defer to their patterns
- **Form validation**: Inline error messages below inputs, text-sm in alert color
- **Loading states**: Subtle spinner or progress indicator, never blocking

## Images

**Logo Placement**: 
- Develop Coaching logo in top-left of header
- A-Team Trades Pipeline badge next to main headline
- Greg's headshot (if included): 80x80 rounded-full in trust section or footer

**No large hero image**: This design relies on clean typography and the prominent chat interface. Background can use subtle gradient or texture overlay, but no feature image.

## Accessibility Requirements

- All interactive elements minimum 44x44px touch targets
- Form inputs have visible labels, not just placeholders
- Focus indicators on all interactive elements with 2px outline
- Sufficient contrast ratios (WCAG AA minimum)
- Widget content relies on ChatGPT SDK's built-in accessibility

## Key Principles

1. **Chat-First Design**: The diagnostic widget is the hero - everything supports it
2. **Minimal Friction**: Clear path from landing to diagnostic to results
3. **Professional Authority**: Clean, structured, confidence-inspiring
4. **Mobile-Optimized**: Majority of trades professionals browse on mobile
5. **Fast-Loading**: Minimal assets, CDN fonts, optimized for quick first paint