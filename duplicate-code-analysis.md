# Duplicate Code Analysis Report

## 1. Button Patterns

### Duplicate Button Implementations
Multiple files implement buttons with similar styles but slightly different implementations:

**Pattern 1: TouchableOpacity with inline styles**
- `/src/components/BottomButton.tsx` (line 13): Uses inline styles with backgroundColor conditional
- `/src/components/InputBox.tsx` (lines 22-50): Multiple buttons with inline styles
- `/src/components/Plans/SongDialog.tsx`: Link buttons with inline styles
- `/src/components/RadioButton.tsx`: Custom radio button implementation

**Pattern 2: Button colors scattered across codebase**
```tsx
// Common pattern found:
backgroundColor: Constants.Colors.button_bg
backgroundColor: Constants.Colors.button_red
backgroundColor: Constants.Colors.button_yellow
backgroundColor: Constants.Colors.button_dark_green
```

### Refactoring Opportunity
Create a unified `Button` component that accepts variants:
```tsx
<Button variant="primary|danger|warning|success" onPress={...} loading={...}>
  {children}
</Button>
```

## 2. Header Components

### Multiple Header Implementations
- `/src/components/BlueHeader.tsx`: Blue header with logo and navigation
- `/src/components/WhiteHeader.tsx`: White header variation
- `/src/components/SimpleHeader.tsx`: Another header variant
- `/src/components/wrapper/MainHeader.tsx`: Yet another header implementation

### Common Patterns
- All use safe area insets
- Similar navigation logic (back button, menu)
- Logo display with different colors
- Repeated icon handling

### Refactoring Opportunity
Create a single `Header` component with props:
```tsx
<Header 
  variant="blue|white|simple"
  showBack={true}
  showMenu={true}
  showBell={true}
  title="..."
/>
```

## 3. Form Input Patterns

### Repeated Input Styling
Many files implement similar input patterns:
- `/src/components/donations/CardForm.tsx`: TextInput with outlined mode
- `/src/components/donations/BankForm.tsx`: Similar TextInput patterns
- `/src/components/eventCalendar/CreateEvent.tsx`: Form inputs
- `/app/auth/login.tsx`: Login form inputs
- `/app/auth/register.tsx`: Registration form inputs

### Common Patterns
```tsx
// Repeated pattern:
<TextInput
  mode="outlined"
  label="..."
  value={...}
  onChangeText={...}
  style={{ marginBottom: spacing.sm }}
/>
```

### Refactoring Opportunity
Create form field components:
```tsx
<FormField
  label="..."
  value={...}
  onChange={...}
  type="text|email|password|number"
  error={...}
/>
```

## 4. API Call Patterns

### Duplicate Error Handling
Multiple files implement similar API error handling:
- `/src/components/donations/CardForm.tsx`
- `/src/components/donations/BankForm.tsx`
- `/src/components/donations/DonationForm.tsx`
- `/src/components/Notes/AddNote.tsx`

### Common Pattern
```tsx
try {
  const response = await ApiHelper.post(...);
  if (response?.raw?.message) {
    Alert.alert("Error", response.raw.message);
  } else {
    // Success logic
  }
} catch (error) {
  Alert.alert("Error", "Something went wrong");
}
```

### Refactoring Opportunity
Create API wrapper utilities:
```tsx
const apiCall = async (method, url, data) => {
  try {
    const response = await ApiHelper[method](url, data);
    if (response?.raw?.message) {
      throw new Error(response.raw.message);
    }
    return response;
  } catch (error) {
    Alert.alert("Error", error.message);
    throw error;
  }
};
```

## 5. List/Card Rendering Patterns

### Repeated List Implementations
- `/app/(drawer)/sermons.tsx`: Sermon list
- `/app/(drawer)/myGroups.tsx`: Group list
- `/app/(drawer)/membersSearch.tsx`: Member list
- `/app/(drawer)/plan.tsx`: Plan list

### Common Patterns
- FlatList with similar configurations
- Card-based layouts with shadows
- Pull-to-refresh functionality
- Empty state handling

### Refactoring Opportunity
Create reusable list components:
```tsx
<DataList
  data={...}
  renderItem={...}
  onRefresh={...}
  emptyMessage="..."
  ItemComponent={CardComponent}
/>
```

## 6. Modal Patterns

### Duplicate Modal Implementations
- `/src/components/modals/CustomModal.tsx`
- `/src/components/modals/PaymentMethodModal.tsx`
- `/src/components/modals/PreviewModal.tsx`
- `/src/components/eventCalendar/EventModal.tsx`

### Common Patterns
- Similar backdrop handling
- Close button positioning
- Content padding and styling

### Refactoring Opportunity
Create a base modal component:
```tsx
<BaseModal
  visible={...}
  onClose={...}
  title="..."
  actions={[...]}
>
  {content}
</BaseModal>
```

## 7. Validation Patterns

### Repeated Validation Logic
- Email validation in multiple files
- Phone number validation
- Required field validation
- Form submission validation

### Common Patterns
```tsx
if (!field) {
  Alert.alert("Error", "Field is required");
  return;
}
```

### Refactoring Opportunity
Create validation utilities:
```tsx
const validators = {
  required: (value) => !!value || "This field is required",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email",
  phone: (value) => /^\d{10}$/.test(value) || "Invalid phone number"
};
```

## 8. Navigation Patterns

### Repeated Navigation Logic
- Similar navigation patterns in drawer items
- Repeated router.push/navigate calls
- Parameter passing patterns

### Refactoring Opportunity
Create navigation utilities:
```tsx
const navigateTo = (screen, params = {}) => {
  logAnalytics(screen);
  router.push({ pathname: screen, params });
};
```

## 9. Style Constants

### Duplicate Style Definitions
Many inline styles could be moved to the global styles:
- Card shadows (elevation, shadowColor, etc.)
- Container padding/margins
- Text styles for headers, labels, values
- Button dimensions and colors

### Refactoring Opportunity
Extend GlobalStyles with more reusable styles:
```tsx
const styles = {
  card: { /* shadow styles */ },
  container: { /* padding styles */ },
  buttonPrimary: { /* primary button styles */ },
  textHeader: { /* header text styles */ }
};
```

## 10. Loading States

### Duplicate Loading Indicators
- Multiple files implement similar loading states
- ActivityIndicator with similar configurations
- Loading overlays with similar styles

### Refactoring Opportunity
Create loading components:
```tsx
<LoadingButton loading={isLoading} onPress={...}>
  Submit
</LoadingButton>

<LoadingOverlay visible={isLoading} />
```

## Summary

The codebase would benefit from:
1. A comprehensive UI component library with standardized components
2. Form utilities for validation and error handling
3. API wrapper utilities for consistent error handling
4. Navigation utilities for consistent routing
5. Extended global styles to reduce inline styling
6. Reusable list and card components
7. Standardized modal system
8. Loading state management utilities

These refactorings would significantly reduce code duplication and improve maintainability.