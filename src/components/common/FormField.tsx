import React, { useState } from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import { TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColors } from "../../theme";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: "text" | "email" | "password" | "phone" | "number";
  placeholder?: string;
  error?: string;
  required?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  maxLength?: number;
  autoFocus?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  type = "text",
  placeholder,
  error,
  required = false,
  autoCapitalize = "sentences",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  autoFocus = false
}) => {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const getKeyboardType = () => {
    switch (type) {
      case "email": return "email-address";
      case "phone": return "phone-pad";
      case "number": return "numeric";
      default: return "default";
    }
  };

  const getAutoCapitalize = () => {
    if (type === "email") return "none";
    return autoCapitalize;
  };

  const getAutoComplete = () => {
    switch (type) {
      case "email": return "email" as const;
      case "password": return "password" as const;
      case "phone": return "tel" as const;
      default: return "off" as const;
    }
  };

  const getTextContentType = () => {
    switch (type) {
      case "email": return "emailAddress" as const;
      case "password": return "password" as const;
      case "phone": return "telephoneNumber" as const;
      default: return "none" as const;
    }
  };

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <TextInput
        label={`${label}${required ? " *" : ""}`}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        placeholder={placeholder}
        error={!!error}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={getKeyboardType()}
        autoCapitalize={getAutoCapitalize()}
        autoComplete={getAutoComplete()}
        textContentType={getTextContentType()}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoFocus={autoFocus}
        outlineColor={colors.border}
        activeOutlineColor={error ? colors.error : colors.primary}
        left={
          leftIcon ? (
            <TextInput.Icon
              icon={() => <Ionicons name={leftIcon as any} size={20} color={colors.inputText} />}
            />
          ) : undefined
        }
        right={
          isPassword ? (
            <TextInput.Icon
              icon={() => (
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.inputText}
                />
              )}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : rightIcon ? (
            <TextInput.Icon
              icon={() => <Ionicons name={rightIcon as any} size={20} color={colors.inputText} />}
              onPress={onRightIconPress}
            />
          ) : undefined
        }
        style={{ backgroundColor: editable ? colors.surface : colors.inputBg }}
      />
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onPress,
  placeholder = "Select...",
  error,
  required = false,
  style
}) => {
  const colors = useThemeColors();

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <TextInput
        label={`${label}${required ? " *" : ""}`}
        value={value}
        mode="outlined"
        placeholder={placeholder}
        error={!!error}
        editable={false}
        onPressIn={onPress}
        outlineColor={colors.border}
        activeOutlineColor={error ? colors.error : colors.primary}
        right={
          <TextInput.Icon
            icon={() => <Ionicons name="chevron-down" size={20} color={colors.inputText} />}
          />
        }
        style={{ backgroundColor: colors.surface }}
      />
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};
