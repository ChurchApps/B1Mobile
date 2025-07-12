# Navigation Components

This directory contains standardized navigation components for consistent navigation behavior across the app.

## StandardBackButton

A standardized back button component that provides consistent navigation behavior with proper fallbacks.

### Features

- **Consistent Navigation**: Uses the enhanced `useNavigation` hook for proper back navigation
- **Fallback Support**: Automatically falls back to dashboard if no navigation history exists
- **Custom Actions**: Supports custom back actions while maintaining consistency
- **Confirmation Dialogs**: Optional confirmation before navigation
- **Accessibility**: Proper accessibility labels and touch targets
- **Design System**: Uses design system tokens for consistent styling

### Usage

```tsx
import { StandardBackButton } from "../../components/navigation";

// Basic usage
<StandardBackButton />

// With custom styling
<StandardBackButton 
  color="#ffffff"
  size={24}
  style={{ marginRight: 8 }}
/>

// With custom back action
<StandardBackButton 
  onCustomBack={() => handleSaveAndBack()}
  confirmBack={true}
  confirmMessage="Save changes before going back?"
/>

// Disabled state
<StandardBackButton 
  disabled={isLoading}
/>
```

### Props

- `color`: Icon color (default: neutral 900)
- `size`: Icon size (default: 24)
- `onCustomBack`: Custom back action function
- `confirmBack`: Show confirmation dialog (default: false)
- `confirmMessage`: Custom confirmation message
- `fallbackRoute`: Route to navigate if no history (default: "/(drawer)/dashboard")
- `disabled`: Disable the button
- `style`: Additional styling

## Navigation Best Practices

### 1. Use StandardBackButton in Headers

Replace custom back button implementations with `StandardBackButton`:

```tsx
// ✅ Good
<Header 
  title="Screen Title"
  showBack={true}
  // StandardBackButton is used internally
/>

// ✅ Also good for custom headers
<StandardBackButton 
  color="#ffffff"
  onCustomBack={handleCustomBack}
/>
```

### 2. Use Enhanced Navigation Hook

Always use the enhanced `useNavigation` hook instead of direct router calls:

```tsx
import { useNavigation } from "../../hooks/useNavigation";

const { navigateBack, navigateTo, navigateWithStack } = useNavigation();

// ✅ Good - maintains navigation stack
navigateBack();

// ✅ Good - respects navigation patterns
navigateWithStack("/(drawer)/sermons");

// ❌ Avoid - breaks navigation stack
router.navigate("/(drawer)/dashboard");
```

### 3. Hardware Back Button Handling

For screens requiring custom hardware back button behavior:

```tsx
import { useHardwareBackHandler } from "../../hooks/useNavigation";

const handleHardwareBack = useCallback(() => {
  if (hasUnsavedChanges) {
    // Show confirmation dialog
    Alert.alert("Unsaved Changes", "Save before going back?");
    return true; // Prevent default behavior
  }
  return false; // Allow default behavior
}, [hasUnsavedChanges]);

useHardwareBackHandler(handleHardwareBack);
```

### 4. Navigation Stack Management

- **Detail Screens**: Use `navigateTo()` to maintain back navigation
- **Main Sections**: Use `navigateWithStack()` for proper stack management
- **Modal/Overlay**: Use `navigateDismissAll()` when appropriate

### 5. Fallback Routes

Always provide sensible fallback routes:
- Dashboard: `"/(drawer)/dashboard"` (default)
- Auth screens: `"/auth/login"`
- Onboarding: `"/onboarding"`

## Migration Guide

### From MainHeader forced navigation:

```tsx
// ❌ Before
<MainHeader 
  title="Title"
  back={() => router.navigate("/(drawer)/dashboard")}
/>

// ✅ After  
<MainHeader 
  title="Title"
  back={() => navigateBack()}
/>
```

### From direct router usage:

```tsx
// ❌ Before
const handleBack = () => {
  router.navigate("/(drawer)/dashboard");
};

// ✅ After
const { navigateBack } = useNavigation();
const handleBack = () => {
  navigateBack();
};
```

### From inconsistent navigation patterns:

```tsx
// ❌ Before - Mixed patterns
router.back(); // Sometimes this
router.navigate("/(drawer)/dashboard"); // Sometimes this

// ✅ After - Consistent pattern
navigateBack(); // Always this
```