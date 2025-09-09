import React, { useState } from "react";
import { View, StyleSheet, TextInput, Text, Alert } from "react-native";
import { Button, Card, HelperText } from "react-native-paper";
import { ApiHelper, UserHelper } from "../../../../src/helpers";
import { Permissions, LinkInterface } from "@churchapps/helpers";

interface Props {
  groupId: string;
  saveCallback?: () => void;
  forGroupLeader?: boolean;
}

export const GroupLinkAdd: React.FC<Props> = ({ groupId, saveCallback, forGroupLeader = false }) => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleAdd = async () => {
    const newErrors: string[] = [];

    if (!text.trim()) newErrors.push("Please enter valid text");
    if (!url.trim()) newErrors.push("Please enter link");
    if (!UserHelper.checkAccess(Permissions.contentApi.content.edit)) newErrors.push("Unauthorized to add links");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const category = forGroupLeader ? "groupLeaderLink" : "groupLink";

    const link: LinkInterface = {
      category,
      url,
      linkType: "url",
      text,
      linkData: groupId,
      icon: ""
    };

    try {
      const response = await ApiHelper.post("/links", [link], "ContentApi");
      if (response?.raw?.message) {
        Alert.alert("Error", response.raw.message);
      } else {
        setText("");
        setUrl("");
        setErrors([]);
        if (saveCallback) saveCallback();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to add link. Please try again.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.contentCard}>
        <Text style={styles.header}>Add Links</Text>
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((err, idx) => (
              <HelperText key={idx} type="error">
                {err}
              </HelperText>
            ))}
          </View>
        )}
        <Text style={styles.note}>Link could be of Google Drive, Hosted Lesson PDF, etc.</Text>

        <TextInput style={styles.input} autoCapitalize={'none'} placeholder="Link Text" value={text} onChangeText={setText} accessibilityLabel="Link display text" />

        <TextInput style={styles.input} autoCapitalize={'none'} placeholder="Link URL" value={url} onChangeText={setUrl} accessibilityLabel="Link URL" />

        <Button mode="contained" onPress={handleAdd} style={styles.button}>
          Add
        </Button>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  note: {
    fontSize: 14,
    marginBottom: 12,
    color: "#555"
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  button: {
    marginTop: 8
  },
  errorContainer: {
    marginBottom: 8
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    overflow: "hidden"
  }
});
