import { MessageInterface } from "@churchapps/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import React, { useEffect, useState } from "react";
import { Keyboard, View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, IconButton, HelperText, Text, useTheme } from 'react-native-paper';
// Icon and DeleteIcon from react-native-vector-icons can be kept if specific icons are not in Paper's default set
// Otherwise, map to Paper's IconButton 'icon' prop (e.g. 'send', 'delete')
import Icon from "react-native-vector-icons/FontAwesome"; // Kept for 'send' if not replaced
import DeleteIcon from 'react-native-vector-icons/MaterialIcons'; // Kept for 'delete' if not replaced
import { ApiHelper, globalStyles } from "@/src/helpers"; // Constants removed

type Props = {
  messageId?: any;
  onUpdate: () => void;
  createConversation: () => Promise<string>;
  conversationId?: string;
  type: string,
};

export function AddNote({ ...props }: Props) {
  const theme = useTheme();
  const [message, setMessage] = useState<MessageInterface | null>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // const headerText = props.messageId ? "Edit note" : "Add a note"; // Not used in render

  useEffect(() => {
    if (props.messageId) {
      ApiHelper.get(`/messages/${props.messageId}`, "MessagingApi").then(n => setMessage(n));
    } else {
      setMessage({ conversationId: props.conversationId, content: "" });
    }
    return () => {
      setMessage(null); // Cleanup
    };
  }, [props.messageId, props.conversationId]);

  const handleChange = (text: string) => {
    setErrors([]);
    const m = { ...message } as MessageInterface;
    m.content = text;
    setMessage(m);
  }

  const validate = () => {
    const result: string[] = [];
    if (!message?.content?.trim()) result.push("Please enter a note.");
    setErrors(result);
    return result.length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      let cId = props.conversationId;
      if (!cId) cId = await props.createConversation();
      const m = { ...message, conversationId: cId } as MessageInterface;
      // ApiHelper.post returns a promise, ensure it's handled or awaited if needed for sequential logic
      await ApiHelper.post("/messages", [m], "MessagingApi");
      props.onUpdate();
      setMessage({ conversationId: props.conversationId, content: "" }); // Reset message content
    } catch (error) {
      console.error("Error calling message API:", error);
      // Optionally set an error message to display to the user
    } finally {
      setIsSubmitting(false);
      // setMessage(null); // Consider if resetting to null or empty content is preferred
    }
  };

  async function deleteNote() {
    if (!props.messageId) return;
    setIsSubmitting(true); // Disable buttons during delete
    try {
      await ApiHelper.delete(`/messages/${props.messageId}`, "MessagingApi");
      props.onUpdate();
      setMessage(null); // Clear message after delete
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: '100%',
      marginTop: props.type === "new" ? 16 : 0,
      marginBottom: props.type === "new" ? 2 : 16,
    },
    textInput: {
      // ...globalStyles.fundInput, // Spread relevant properties if needed, e.g., backgroundColor
      // fontSize: DimensionHelper.hp(1.6), // Paper.TextInput has its own font scaling, adjust via theme or props
      // borderBottomWidth: 1, // For 'flat' mode, Paper.TextInput handles this. For 'outlined', it's an outline.
      // borderColor: 'lightgray', // Theme colors will be used
      marginLeft: props.type === "new" ? 8 : 50,
      width: props.type === "new" ? DimensionHelper.wp(80) : props.type === 'reply' && props.messageId ? DimensionHelper.wp(60) : DimensionHelper.wp(65),
      // paddingTop: DimensionHelper.hp(1.8), // Adjust with padding props of Paper.TextInput if needed
      backgroundColor: theme.colors.surfaceVariant, // Or another suitable theme color
    },
    actionsContainer: {
      marginHorizontal: props.messageId ? DimensionHelper.wp(1) : DimensionHelper.wp(2.5),
      flexDirection: 'row',
      alignItems: 'center',
      width: props.messageId ? DimensionHelper.wp(15) : DimensionHelper.wp(5), // This width might be too small for two IconButtons
      justifyContent: props.messageId ? 'space-around' : 'center', // space-around might be better
    },
    errorTextContainer: {
      marginLeft: props.type === "new" ? 8 : DimensionHelper.wp(15), // Align with TextInput or provide consistent padding
    }
  });

  return (
    <>
      <View style={styles.container}>
        <PaperTextInput
          value={message?.content || ""}
          onChangeText={handleChange}
          placeholder="Add a note" // Label prop might be better
          // label="Note" // Alternative to placeholder
          disabled={isSubmitting}
          mode="outlined" // Or "flat"
          multiline
          numberOfLines={3} // Adjusted from 4 for typical TextInput height
          style={styles.textInput}
          blurOnSubmit={true} // Default is false for multiline, true for single line
          onSubmitEditing={Keyboard.dismiss} // Still useful
          error={errors.length > 0}
        />
        <View style={styles.actionsContainer}>
          <IconButton
            icon="send" // Mapped from FontAwesome send
            color={theme.colors.primary}
            size={DimensionHelper.wp(5)} // Standardize size or use Paper default
            onPress={handleSave}
            disabled={isSubmitting}
          />
          {props.messageId && (
            <IconButton
              icon="delete" // Mapped from MaterialIcons delete
              color={theme.colors.error} // Use error color for delete action
              size={DimensionHelper.wp(6.2)} // Standardize size
              onPress={deleteNote}
              disabled={isSubmitting}
            />
          )}
        </View>
      </View>
      {errors.map((error: string, index: number) => (
        <HelperText key={index} type="error" visible={true} style={styles.errorTextContainer}>
          {error}
        </HelperText>
      ))}
    </>
  );
}
