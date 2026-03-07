import { MessageInterface } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import React, { useEffect, useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApiHelper, globalStyles } from "../../../src/helpers";
import { ApiErrorHandler } from "../../../src/helpers/ApiErrorHandler";
import { useTranslation } from "react-i18next";
import { HapticsHelper } from "../../helpers/HapticsHelper";
import { useThemeColors } from "../../../src/theme";

type Props = {
  messageId?: any;
  onUpdate: () => void;
  createConversation: () => Promise<string>;
  conversationId?: string;
  type: string;
};

export function AddNote({ ...props }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [message, setMessage] = useState<MessageInterface | null>();
  const [errors, setErrors] = React.useState<string[]>([]);
  useEffect(() => {
    if (props.messageId) {
      ApiHelper.get(`/messages/${props.messageId}`, "MessagingApi")
        .then(n => {
          setMessage(n);
        })
        .catch(error => {
          console.error("Error fetching message:", error);
        });
    } else setMessage({ conversationId: props.conversationId, content: "" });
    return () => {
      setMessage(null);
    };
  }, [props.messageId, props.conversationId]);

  const handleChange = (text: string) => {
    setErrors([]);
    const m = { ...message } as MessageInterface;
    m.content = text;
    setMessage(m);
  };

  const validate = () => {
    const result: string[] = [];
    if (!message?.content?.trim()) result.push(t("messages.enterNote"));
    setErrors(result);
    return result.length === 0;
  };

  async function handleSave() {
    try {
      if (validate()) {
        let cId = props.conversationId;
        if (!cId) cId = await props.createConversation();
        const m = { ...message };
        m.conversationId = cId;
        await ApiHelper.post("/messages", [m], "MessagingApi");
        props.onUpdate();
        setMessage({ conversationId: cId, content: "" } as MessageInterface);
        HapticsHelper.light();
      }
    } catch (err) {
      console.error("Error saving message:", err);
      ApiErrorHandler.showErrorAlert(err, "Error");
    }
  }

  async function deleteNote() {
    try {
      await ApiHelper.delete(`/messages/${props.messageId}`, "MessagingApi");
      props.onUpdate();
    } catch (err) {
      console.error("Error deleting message:", err);
      ApiErrorHandler.showErrorAlert(err, "Error");
    }
  }

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginTop: props.type === "new" ? 16 : 0,
          marginBottom: props.type === "new" ? 2 : 16
        }}>
        <TextInput
          accessibilityLabel="Message text"
          onChangeText={text => handleChange(text)}
          placeholderTextColor={colors.textMuted}
          style={[
            {
              ...globalStyles.fundInput,
              color: colors.inputText,
              fontSize: DimensionHelper.hp(1.6),
              borderBottomWidth: 1,
              borderColor: colors.inputBorder,
              marginLeft: props.type === "new" ? 8 : 50,
              width: props.type === "new" ? DimensionHelper.wp(80) : props.type == "reply" && props.messageId ? DimensionHelper.wp(60) : DimensionHelper.wp(65),
              paddingTop: DimensionHelper.hp(1.8)
            }
          ]}
          multiline
          blurOnSubmit={true}
          onSubmitEditing={() => Keyboard.dismiss()}
          numberOfLines={4}
          value={message?.content}
          placeholder={t("messages.addNote")}
        />
        <View
          style={{
            marginHorizontal: props.messageId ? DimensionHelper.wp(1) : DimensionHelper.wp(2.5),
            flexDirection: "row",
            alignItems: "center",
            width: props.messageId ? DimensionHelper.wp(15) : DimensionHelper.wp(5),
            justifyContent: props.messageId ? "space-between" : "center"
          }}>
          <TouchableOpacity onPress={() => handleSave()} accessibilityLabel="Send message" accessibilityRole="button">
            <MaterialIcons name={"send"} color={colors.primary} size={DimensionHelper.wp(5)} />
          </TouchableOpacity>
          {props.messageId && (
            <TouchableOpacity onPress={() => deleteNote()} accessibilityLabel="Delete message" accessibilityRole="button">
              <MaterialIcons name={"delete"} color={colors.primary} size={DimensionHelper.wp(6.2)} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {errors && errors.length > 0 && (
        <View style={{ marginLeft: DimensionHelper.wp(15) }}>
          {errors.map((error: string) => (
            <Text key={`error-${error.toLowerCase().replace(/\s+/g, "-")}`} style={{ color: colors.error }}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}
