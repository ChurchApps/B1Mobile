# B1 Mobile Style Guide

## Overview
This style guide defines the design system for the B1 Mobile React Native/Expo application. It provides consistent patterns for colors, typography, spacing, and component design optimized for mobile phone interfaces, focusing on touch-first interaction and smaller screen sizes.

## Colors

### Primary Brand Colors
- **Primary Blue**: `#1565C0` - Main brand color for primary buttons, headers, and key UI elements
- **Light Blue**: `#568BDA` - Secondary blue for subheaders and accent elements  
- **Bright Blue**: `#2196F3` - Alternative blue for icons and highlights

### Neutral Colors
- **Background**: `#F6F6F8` (Ghost White) - Main app background
- **Card Background**: `#FFFFFF` - Cards, input fields, and content areas
- **Dark Gray**: `#3c3c3c` - Primary text color
- **Medium Gray**: `#9E9E9E` - Secondary text and icons
- **Light Gray**: `lightgray` - Borders and dividers

### Status Colors
- **Success Green**: `#70DC87` - Success states and confirmations
- **Warning Yellow**: `#FEAA24` - Warnings and attention states
- **Error Red**: `#B0120C` - Error states and destructive actions
- **Info Cyan**: `#1C9BA0` - Information and secondary actions

## Typography

### Font Family
- **Primary Font**: System fonts with platform-specific defaults
  - iOS: San Francisco (`System`)
  - Android: Roboto (`System`)
  - Consistent weights: Regular, Medium, Bold

### Font Sizes (Mobile-Optimized)
- **H1**: 24px - Page titles and main headings
- **H2**: 20px - Section headings
- **H3**: 18px - Subsection headings
- **Body**: 16px - Standard body text (optimal for mobile reading)
- **Small**: 14px - Secondary text and captions
- **Smaller**: 12px - Fine print and metadata

### Line Height
- **Body text**: 1.5 (24px for 16px text)
- **Headings**: 1.2-1.3 for better visual hierarchy
- **Small text**: 1.4 for readability

## Spacing & Dimensions

### Base Spacing Unit
- **Base unit**: 8px (follows 8dp Material Design grid)
- **Spacing scale**: 4px, 8px, 16px, 24px, 32px, 48px

### Mobile-Specific Spacing
- **Screen padding**: 16px horizontal margins
- **Card padding**: 16px internal padding
- **Element spacing**: 8px between related elements
- **Section spacing**: 24px between major sections
- **Safe area**: Account for notches and home indicators

### Touch Targets
- **Minimum size**: 44px × 44px (Apple HIG recommendation)
- **Preferred size**: 48px × 48px (Material Design recommendation)
- **Button height**: 48px for primary actions
- **Input field height**: 48px for comfortable typing

## Component Patterns

### Cards
```javascript
{
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // Reduced for mobile
  padding: 16,
  marginHorizontal: 16,
  marginVertical: 8
}
```

### Buttons

#### Primary Button
```javascript
{
  backgroundColor: "#1565C0",
  borderRadius: 8,
  height: 48,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 2
}
```

#### Secondary Button
```javascript
{
  backgroundColor: "transparent",
  borderRadius: 8,
  height: 48,
  borderWidth: 1,
  borderColor: "#1565C0",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24
}
```

#### Large Action Button (Bottom of Screen)
```javascript
{
  backgroundColor: "#1565C0",
  height: 56,
  margin: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4
}
```

### Input Fields
```javascript
{
  backgroundColor: "#FFFFFF",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "rgba(0, 0, 0, 0.12)",
  height: 48,
  paddingHorizontal: 16,
  fontSize: 16,
  color: "#3c3c3c"
}
```

### Lists & List Items
```javascript
{
  backgroundColor: "#FFFFFF",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F0F0",
  minHeight: 56 // Ensures adequate touch target
}
```

## Layout Patterns

### Screen Container
```javascript
{
  flex: 1,
  backgroundColor: "#F6F6F8",
  paddingHorizontal: 16
}
```

### Header Design (Mobile-Optimized)
- **Height**: 56px (standard mobile header)
- **Background**: White with subtle shadow
- **Title**: Centered or left-aligned based on navigation pattern
- **Back button**: 44px × 44px touch target
- **Action buttons**: Maximum 2 actions in header

### Drawer Navigation
- **Drawer width**: 280px (standard mobile drawer)
- **Header height**: 150px for user info
- **Menu items**: 48px height with 16px horizontal padding
- **Icons**: 24px × 24px with 16px right margin

### Bottom Tab Navigation (Alternative)
- **Tab bar height**: 56px + safe area inset
- **Tab width**: Equal distribution across screen
- **Icons**: 24px × 24px
- **Labels**: 12px font size

## Mobile-Specific Considerations

### Portrait Orientation (Primary)
- **Content width**: Full screen width minus 32px horizontal padding
- **Single column layout**: Stack elements vertically
- **Scroll behavior**: Smooth scrolling with momentum

### Landscape Orientation (Secondary)
- **Content width**: Limited to 600px max width, centered
- **Two-column layout**: Where content allows
- **Keyboard handling**: Adjust layout when keyboard appears

### Keyboard Interaction
- **Scroll to input**: Auto-scroll to keep input visible
- **Dismiss on tap**: Tap outside to dismiss keyboard
- **Return key**: Appropriate action (next field, submit, etc.)

### Loading States
- **Skeleton screens**: Use for complex content loading
- **Spinners**: Small 24px for in-place loading
- **Pull-to-refresh**: Standard iOS/Android patterns

### Error States
- **Inline errors**: Below form fields
- **Toast messages**: For temporary notifications
- **Empty states**: Friendly illustrations and clear actions

## Navigation Patterns

### Drawer Navigation Structure
```
├── Dashboard
├── Bible
├── Lessons
├── My Groups
├── Plans
├── Service
├── Stream
├── Church Search
├── Members Search
├── Donations
├── Settings
└── Logout
```

### Modal Presentations
- **Full screen**: For complex forms or multi-step flows
- **Bottom sheet**: For quick actions or selections
- **Alert dialogs**: For confirmations and simple inputs

## Theme Support

### Light Theme (Default)
- **Background**: `#F6F6F8`
- **Surface**: `#FFFFFF`
- **Text**: `#3c3c3c`
- **Secondary text**: `#9E9E9E`

### Dark Theme
- **Background**: `#121212`
- **Surface**: `#1E1E1E`
- **Text**: `#FFFFFF`
- **Secondary text**: `#B3B3B3`

## Accessibility

### Color Contrast
- **Primary text**: 4.5:1 contrast ratio minimum
- **Secondary text**: 3:1 contrast ratio minimum
- **Interactive elements**: 3:1 contrast ratio minimum

### Touch Targets
- **Minimum**: 44px × 44px
- **Spacing**: 8px minimum between targets
- **Feedback**: Visual feedback for all interactions

### Screen Reader Support
- **Labels**: Descriptive labels for all interactive elements
- **Hints**: Additional context where needed
- **Announcements**: Important state changes

## Performance Considerations

### Image Optimization
- **Lazy loading**: For lists and carousels
- **Compressed formats**: Use WebP where supported
- **Responsive images**: Multiple sizes for different densities

### Animation Guidelines
- **Duration**: 200-300ms for UI transitions
- **Easing**: Use native platform easing curves
- **Performance**: Avoid animating layout properties

## Implementation Guidelines

### File Organization
```
src/
├── components/
│   ├── common/          # Shared UI components
│   ├── forms/           # Form-specific components
│   ├── navigation/      # Navigation components
│   └── [feature]/       # Feature-specific components
├── screens/
│   └── [feature]/       # Screen components
├── hooks/               # Custom hooks
├── utils/              # Utility functions
└── theme/              # Theme configuration
```

### Component Structure
```javascript
// Component structure example
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Styles (at bottom of file)
  const styles = StyleSheet.create({
    container: {
      // Mobile-optimized styles
    }
  });
  
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
};
```

### Do's
- Use Flexbox for layouts
- Implement proper touch feedback
- Support both light and dark themes
- Use safe area insets
- Optimize for single-handed use
- Test on various screen sizes
- Use platform-specific components where appropriate

### Don'ts
- Don't hardcode pixel values
- Don't ignore keyboard handling
- Don't block the main thread
- Don't use tiny touch targets
- Don't ignore accessibility
- Don't assume portrait orientation only
- Don't forget about different screen densities

## Testing Guidelines

### Visual Testing
- **Multiple devices**: Test on various screen sizes
- **Orientation**: Portrait and landscape
- **Themes**: Light and dark modes
- **Accessibility**: Screen reader and high contrast

### Performance Testing
- **Startup time**: App launch performance
- **Navigation**: Screen transition smoothness
- **Memory usage**: Monitor for memory leaks
- **Battery usage**: Optimize for battery efficiency

This style guide ensures consistent, accessible, and performant design across the B1 Mobile application, optimized specifically for mobile phone interfaces and touch-first interaction patterns.