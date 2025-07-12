import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleProp, ViewStyle, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Constants } from "../../helpers";
import { CommonStyles } from "../../theme/CommonStyles";
import { Button } from "./Button";

interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  fullScreen?: boolean;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  children,
  actions,
  showCloseButton = true,
  closeOnBackdrop = true,
  fullScreen = false,
  scrollable = true,
  style,
  contentStyle
}) => {
  const insets = useSafeAreaInsets();

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const content = (
    <View style={[CommonStyles.container, { paddingTop: fullScreen ? insets.top : 0 }]}>
      {(title || showCloseButton) && (
        <View style={[CommonStyles.rowBetween, { padding: 16, paddingBottom: 8 }]}>
          {title && (
            <Text style={[CommonStyles.titleText, { flex: 1, marginRight: showCloseButton ? 8 : 0 }]}>
              {title}
            </Text>
          )}
          {showCloseButton && (
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={Constants.Colors.text_dark} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ padding: 16 }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, padding: 16 }, contentStyle]}>
          {children}
        </View>
      )}
      
      {actions && actions.length > 0 && (
        <View
          style={[
            {
              padding: 16,
              paddingBottom: insets.bottom || 16,
              borderTopWidth: 1,
              borderTopColor: Constants.Colors.gray_bg
            },
            actions.length > 1 ? CommonStyles.row : {}
          ]}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "primary"}
              onPress={action.onPress}
              loading={action.loading}
              style={{
                flex: actions.length > 1 ? 1 : undefined,
                marginLeft: index > 0 ? 8 : 0
              }}
            >
              {action.text}
            </Button>
          ))}
        </View>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {content}
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center"
        }}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "90%", maxWidth: 400 }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={[
                {
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  maxHeight: "80%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5
                },
                style
              ]}
            >
              {content}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText,
  onConfirm
}) => {
  const getIcon = () => {
    switch (type) {
      case "success": return <Ionicons name="checkmark-circle" size={48} color={Constants.Colors.button_dark_green} />;
      case "warning": return <Ionicons name="warning" size={48} color={Constants.Colors.button_yellow} />;
      case "error": return <Ionicons name="close-circle" size={48} color={Constants.Colors.button_red} />;
      default: return <Ionicons name="information-circle" size={48} color={Constants.Colors.primary} />;
    }
  };

  const actions: ModalAction[] = [];
  
  if (cancelText) {
    actions.push({
      text: cancelText,
      onPress: onClose,
      variant: "secondary"
    });
  }
  
  actions.push({
    text: confirmText,
    onPress: () => {
      onConfirm?.();
      onClose();
    },
    variant: type === "error" ? "danger" : "primary"
  });

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      actions={actions}
      scrollable={false}
    >
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        {getIcon()}
        <Text style={[CommonStyles.titleText, { marginTop: 16, textAlign: "center" }]}>
          {title}
        </Text>
        <Text style={[CommonStyles.bodyText, { marginTop: 8, textAlign: "center" }]}>
          {message}
        </Text>
      </View>
    </BaseModal>
  );
};