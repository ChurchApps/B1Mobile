import React from "react";
import { StyleSheet } from "react-native";
import { Card, IconButton, Button } from "react-native-paper";

interface Props {
  headerIcon?: string;
  headerText?: string;
  saveText?: string;
  cancelText?: string;
  deleteText?: string;
  cancelFunction?: () => void;
  deleteFunction?: () => void;
  saveFunction?: () => void;
  children?: React.ReactNode;
}

export const InputBox: React.FC<Props> = ({ headerIcon, headerText, saveText = "Save", cancelText = "Cancel", deleteText = "Delete", cancelFunction, deleteFunction, saveFunction, children }) => (
  <Card style={styles.contentCard}>
    <Card.Title title={headerText} left={headerIcon ? props => <IconButton {...props} icon={headerIcon} /> : undefined} />
    <Card.Content>{children}</Card.Content>
    <Card.Actions style={styles.actions}>
      {cancelFunction && <Button onPress={cancelFunction}>{cancelText}</Button>}
      {deleteFunction && <Button onPress={deleteFunction}>{deleteText}</Button>}
      {saveFunction && (
        <Button mode="contained" onPress={saveFunction}>
          {saveText}
        </Button>
      )}
    </Card.Actions>
  </Card>
);

const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    overflow: "hidden"
  },
  actions: { justifyContent: "flex-end" }
});
