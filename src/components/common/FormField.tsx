import React, { useState } from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import { TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Constants } from "../../helpers";

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
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoFocus={autoFocus}
        outlineColor={Constants.Colors.gray_bg}
        activeOutlineColor={error ? Constants.Colors.button_red : Constants.Colors.primary}
        left={
          leftIcon ? (
            <TextInput.Icon
              icon={() => <Ionicons name={leftIcon as any} size={20} color={Constants.Colors.text_gray} />}
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
                  color={Constants.Colors.text_gray}
                />
              )}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : rightIcon ? (
            <TextInput.Icon
              icon={() => <Ionicons name={rightIcon as any} size={20} color={Constants.Colors.text_gray} />}
              onPress={onRightIconPress}
            />
          ) : undefined
        }
        style={{
          backgroundColor: editable ? "#ffffff" : "#f5f5f5"
        }}
      />
      {error && (
        <Text style={{ color: Constants.Colors.button_red, fontSize: 12, marginTop: 4 }}>
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
        outlineColor={Constants.Colors.gray_bg}
        activeOutlineColor={error ? Constants.Colors.button_red : Constants.Colors.primary}
        right={
          <TextInput.Icon
            icon={() => <Ionicons name="chevron-down" size={20} color={Constants.Colors.text_gray} />}
          />
        }
        style={{
          backgroundColor: "#ffffff"
        }}
      />
      {error && (
        <Text style={{ color: Constants.Colors.button_red, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};