"use client";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button, ProgressBar } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { ApiHelper, FileInterface } from "../../../helpers";

type Props = {
  pendingSave: boolean;
  saveCallback: (file: FileInterface) => void;
  contentType: string;
  contentId: string;
};

type DocumentResult = {
  type: "success" | "cancel";
  uri: string;
  name: string;
  size?: number;
};

export const FileUpload: React.FC<Props> = ({ pendingSave, saveCallback, contentType, contentId }) => {
  const [file, setFile] = useState<FileInterface>({} as FileInterface);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);

  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*", // allow all file types
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!res.canceled && res.assets.length > 0) {
        const file = res.assets[0]; // the picked file
        setUploadedFile(file);
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

    const preUploaded = await preUpload(f);
    if (!preUploaded) {
      const base64 = await convertBase64(uploadedFile.uri);
      f.fileContents = base64 as string;
    }

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
          // check if total exists
          let percent = Math.round((100 * progressEvent.loaded) / progressEvent.total);
          percent = Math.min(percent, 100); // ensure it doesn't exceed 100
          console.log(percent);
          setUploadProgress(percent);
        }
      }
    });
  };

  console.log(uploadProgress, "uploadProgress", uploadProgress > -1);

  useEffect(() => {
    if (pendingSave) {
      if (uploadedFile) handleSave();
      else saveCallback(file);
    }
  }, [pendingSave]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{`File ${uploadedFile?.name || ""}`}</Text>
      {uploadProgress > -1 && <ProgressBar progress={uploadProgress / 100} style={styles.progress} />}
      {file?.fileName && <Text>{file.fileName}</Text>}
      <Button mode="outlined" onPress={handlePickFile}>
        Choose File
      </Button>
      <Button mode="contained" onPress={handleSave} style={styles.uploadBtn}>
        Upload
      </Button>
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
  }
});
