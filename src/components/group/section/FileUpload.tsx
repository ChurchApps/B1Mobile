import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { Button, ProgressBar } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { ApiHelper, FileInterface } from "../../../helpers";

type Props = {
  pendingSave: boolean;
  saveCallback: (file: FileInterface) => void;
  contentType: string;
  contentId: string;
  cancelCallback?: () => void;
};

export const FileUpload: React.FC<Props> = ({ pendingSave, saveCallback, contentType, contentId, cancelCallback }) => {
  const [file, setFile] = useState<FileInterface>({} as FileInterface);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!res.canceled && res.assets.length > 0) {
        setUploadedFile(res?.assets[0]);
      } else {
        console.log("User canceled the picker");
      }
    } catch (err) {
      console.error("File picking error:", err);
    }
  };

  const convertBase64 = (uri: string) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      fetch(uri)
        .then(res => res.blob())
        .then(blob => {
          reader.readAsDataURL(blob);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
    });

  const handleSave = async () => {
    if (!uploadedFile) return;

    const f: FileInterface = {
      ...file,
      size: uploadedFile.size ?? 0,
      fileType: uploadedFile.mimeType ?? "application/octet-stream",
      fileName: uploadedFile.name,
      contentType,
      contentId
    };

    setUploadInProgress(true);
    const preUploaded = await preUpload(f);
    if (!preUploaded) {
      const base64 = await convertBase64(uploadedFile.uri);
      f.fileContents = base64 as string;
    }
    setUploadInProgress(false);

    const data: FileInterface[] = await ApiHelper.post("/files", [f], "ContentApi");
    setFile({} as FileInterface);
    setUploadedFile(null);
    setUploadProgress(-1);
    saveCallback(data[0]);
  };

  const preUpload = async (f: FileInterface) => {
    const params = { fileName: f.fileName, contentType, contentId };
    const presigned = await ApiHelper.post("/files/postUrl", params, "ContentApi");
    const doUpload = presigned.key !== undefined;
    if (doUpload) await postPresignedFile(presigned);
    return doUpload;
  };

  const postPresignedFile = async (presigned: any) => {
    const formData = new FormData();
    formData.append("acl", "public-read");
    formData.append("Content-Type", uploadedFile.mimeType ?? "application/octet-stream");

    for (const property in presigned.fields) {
      formData.append(property, presigned.fields[property]);
    }

    formData.append("file", {
      uri: uploadedFile.uri,
      type: uploadedFile.mimeType ?? "application/octet-stream",
      name: uploadedFile.name
    } as any);

    await axios.post(presigned.url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          let percent = Math.round((100 * progressEvent.loaded) / progressEvent.total);
          percent = Math.min(percent, 100);
          setUploadProgress(percent);
        }
      }
    });
  };

  useEffect(() => {
    if (pendingSave) {
      if (uploadedFile) handleSave();
      else saveCallback(file);
    }
  }, [pendingSave]);

  const handleCancel = () => {
    if (uploadInProgress) {
      Alert.alert("Cancel Upload", "Upload is in progress. Are you sure you want to cancel?", [{ text: "No" }, { text: "Yes", onPress: () => resetUpload() }]);
    } else {
      resetUpload();
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(-1);
    setUploadInProgress(false);
    cancelCallback?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{`File ${uploadedFile?.name || ""}`}</Text>
      {uploadProgress > -1 && <ProgressBar progress={uploadProgress / 100} style={styles.progress} />}
      <Button mode="outlined" onPress={handlePickFile} disabled={uploadInProgress}>
        Choose File
      </Button>
      <Button mode="contained" onPress={handleSave} style={styles.uploadBtn} disabled={uploadInProgress || !uploadedFile}>
        {uploadInProgress ? "Uploading..." : "Upload File"}
      </Button>

      {(uploadedFile || uploadInProgress) && (
        <Button mode="text" onPress={handleCancel} disabled={!uploadedFile && !uploadInProgress} style={styles.cancelBtn}>
          Cancel
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  label: {
    fontSize: 16,
    marginBottom: 6
  },
  progress: {
    marginVertical: 8,
    height: 6,
    borderRadius: 4
  },
  uploadBtn: {
    marginTop: 8
  },
  cancelBtn: {
    marginTop: 4
  }
});
