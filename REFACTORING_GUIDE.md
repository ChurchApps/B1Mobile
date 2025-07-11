# Refactoring Guide - Reusable Components

This guide explains the new reusable components created to reduce code duplication in the B1Mobile codebase.

## Overview

The following reusable components and utilities have been created:

### 1. UI Components (`src/components/common/`)
- **Button.tsx** - Standardized button components
- **Header.tsx** - Unified header component
- **FormField.tsx** - Form input components with validation
- **DataList.tsx** - Reusable list and card components
- **BaseModal.tsx** - Base modal component
- **LoadingComponents.tsx** - Loading states and overlays

### 2. Utilities
- **ValidationHelper.ts** - Form validation utilities
- **ApiErrorHandler.ts** - Centralized API error handling
- **CommonStyles.ts** - Extracted common styles
- **useNavigation.ts** - Navigation helper hook

## Component Usage Examples

### Button Component

Replace inline TouchableOpacity buttons with the standardized Button component:

```tsx
// Before
<TouchableOpacity
  onPress={handleSubmit}
  style={{
    backgroundColor: Constants.Colors.button_bg,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  }}
>
  <Text style={{ color: "#ffffff" }}>Submit</Text>
</TouchableOpacity>

// After
import { Button } from "@/components/common";

<Button onPress={handleSubmit} variant="primary">
  Submit
</Button>
```

Button variants: `primary`, `secondary`, `danger`, `warning`, `success`, `outline`

### Header Component

Replace multiple header implementations with the unified Header:

```tsx
// Before
<BlueHeader />
// or
<WhiteHeader />

// After
import { Header } from "@/components/common";

<Header 
  variant="blue"
  title="My Screen"
  showBack={true}
  showBell={true}
/>
```

### Form Fields

Replace TextInput implementations with FormField:

```tsx
// Before
<TextInput
  mode="outlined"
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={!!emailError}
/>
{emailError && <Text style={{ color: "red" }}>{emailError}</Text>}

// After
import { FormField } from "@/components/common";

<FormField
  label="Email"
  value={email}
  onChangeText={setEmail}
  type="email"
  error={emailError}
  required
/>
```

### Validation

Use ValidationHelper for consistent validation:

```tsx
import { ValidationHelper } from "@/helpers";

const validateForm = () => {
  const errors = ValidationHelper.validateForm(
    { email, password, phone },
    {
      email: ValidationHelper.email,
      password: ValidationHelper.password,
      phone: ValidationHelper.phone
    }
  );
  
  if (ValidationHelper.hasErrors(errors)) {
    setErrors(errors);
    return false;
  }
  return true;
};
```

### API Error Handling

Replace try-catch blocks with ApiErrorHandler:

```tsx
// Before
try {
  const response = await ApiHelper.post("/api/endpoint", data);
  if (response?.raw?.message) {
    Alert.alert("Error", response.raw.message);
  } else {
    // Success
  }
} catch (error) {
  Alert.alert("Error", "Something went wrong");
}

// After
import { ApiErrorHandler } from "@/helpers";

await ApiErrorHandler.handleApiCall(
  () => ApiHelper.post("/api/endpoint", data),
  {
    successMessage: "Operation successful",
    onSuccess: (data) => {
      // Handle success
    }
  }
);
```

### Data Lists

Replace FlatList implementations with DataList:

```tsx
// Before
<FlatList
  data={items}
  renderItem={renderItem}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  ListEmptyComponent={<Text>No items</Text>}
/>

// After
import { DataList } from "@/components/common";

<DataList
  data={items}
  renderItem={renderItem}
  onRefresh={onRefresh}
  refreshing={refreshing}
  emptyMessage="No items found"
/>
```

### Modals

Use BaseModal for consistent modal implementations:

```tsx
import { BaseModal } from "@/components/common";

<BaseModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  actions={[
    { text: "Cancel", onPress: () => setShowModal(false), variant: "secondary" },
    { text: "Confirm", onPress: handleConfirm, variant: "primary" }
  ]}
>
  <Text>Are you sure you want to proceed?</Text>
</BaseModal>
```

### Loading States

Use LoadingComponents for consistent loading states:

```tsx
import { LoadingOverlay, LoadingView, LoadingButton } from "@/components/common";

// Loading overlay
<LoadingOverlay visible={isLoading} message="Processing..." />

// Loading view wrapper
<LoadingView loading={isLoading} error={error} onRetry={fetchData}>
  {/* Your content */}
</LoadingView>

// Loading button
<LoadingButton loading={isSubmitting} onPress={handleSubmit}>
  Submit
</LoadingButton>
```

### Navigation

Use the navigation hook for consistent navigation:

```tsx
import { useNavigation } from "@/hooks";

const { navigateTo, navigateBack } = useNavigation();

// Navigate with analytics tracking
navigateTo("/(drawer)/myGroups", { id: groupId });
```

### Common Styles

Use CommonStyles for consistent styling:

```tsx
import { CommonStyles } from "@/theme";

<View style={CommonStyles.container}>
  <Text style={CommonStyles.titleText}>Title</Text>
  <View style={CommonStyles.card}>
    {/* Card content */}
  </View>
</View>
```

## Migration Steps

1. **Identify duplicate code** in your component
2. **Import the appropriate reusable component**
3. **Replace the duplicate code** with the reusable component
4. **Test thoroughly** to ensure functionality is preserved
5. **Remove unused imports** and clean up

## Benefits

- **Reduced code duplication** - Less code to maintain
- **Consistent UI/UX** - Same components used everywhere
- **Easier maintenance** - Fix bugs in one place
- **Better type safety** - TypeScript interfaces for all components
- **Improved performance** - Optimized implementations
- **Faster development** - Reuse existing components

## Next Steps

1. Gradually migrate existing code to use these components
2. Document any additional patterns found
3. Create more specialized components as needed
4. Keep components simple and focused on one task