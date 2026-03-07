import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { ApiHelper, FileInterface, UserHelper } from "../../../src/helpers";
import { LinkInterface, Permissions } from "@churchapps/helpers";
import { ProgressBar, Text } from "react-native-paper";
import { useCurrentUserChurch } from "../../../src/stores/useUserStore";
import ResourcesTable from "./section/StorageInfo";
import { GroupLinkAdd } from "./section/GroupLinkAdd";
import { InputBox } from "./section/InputBox";
import { FileUpload } from "./section/FileUpload";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface GroupResourcesTabProps {
  groupId?: string;
}

export const GroupResourcesTab: React.FC<GroupResourcesTabProps> = ({ groupId }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [files, setFiles] = useState<FileInterface[]>(null);
  const [links, setLinks] = useState<LinkInterface[]>(null);
  const [pendingFileSave, setPendingFileSave] = useState(false);
  const currentUserChurch = useCurrentUserChurch();

  let usedSpace = 0;
  files?.forEach(f => (usedSpace += f.size));

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = useCallback(async () => {
    try {
      const data = await ApiHelper.get("/files/group/" + groupId, "ContentApi");
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }

    try {
      const data: LinkInterface[] = await ApiHelper.get("/links?category=groupLink", "ContentApi");
      const result: LinkInterface[] = [];
      data?.forEach(l => {
        if (l.linkData === groupId) result.push(l);
      });
      setLinks(result);
    } catch (error) {
      console.error("Error fetching group links:", error);
    }
  }, [groupId]);

  const handleDelete = async (file: FileInterface) => {
    Alert.alert(t("groups.confirmDeleteFile", { name: file.fileName }), "", [
      {
        text: t("common.cancel"),
        style: "cancel"
      },
      {
        text: t("common.delete"),
        onPress: async () => {
          try {
            await ApiHelper.delete("/files/" + file.id, "ContentApi");
            loadData();
          } catch (err: any) {
            console.log(err);
          }
        }
      }
    ]);
  };

  const handleLinkDelete = async (link: LinkInterface) => {
    Alert.alert(t("groups.confirmDeleteLink", { name: link.text }), "", [
      {
        text: t("common.cancel"),
        style: "cancel"
      },
      {
        text: t("common.delete"),
        onPress: async () => {
          try {
            await ApiHelper.delete("/links/" + link.id, "ContentApi");
            loadData();
          } catch (err: any) {
            console.log(err);
          }
        }
      }
    ]);
  };

  const handleFileSaved = (file: FileInterface) => {
    setPendingFileSave(false);
    loadData();
  };

  const handleSave = () => {
    setPendingFileSave(true);
  };

  const formatSize = (bytes: number) => {
    let result = bytes.toString() + "b";
    if (bytes > 1000000) result = (Math.round(bytes / 10000) / 100).toString() + "MB";
    else if (bytes > 1000) result = (Math.round(bytes / 10) / 100).toString() + "KB";
    return result;
  };

  const getStorage = () => {
    const percent = usedSpace / 100000000; // 100 MB fixed limit

    return (
      <View style={styles.container}>
        <Text>{t("groups.usedSpace", { used: formatSize(usedSpace), total: "100MB" })}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={percent} color={colors.primary} style={styles.progressBar} />
          </View>
          <View style={styles.percentWrapper}>
            <Text style={[styles.percentText, { color: colors.textMuted }]}>{`${Math.round(percent * 100)}%`}</Text>
          </View>
        </View>
      </View>
    );
  };

  let isLeader = false;
  currentUserChurch?.groups?.forEach(g => {
    if (g.id === groupId && g?.leader) isLeader = true;
  });

  const canEditGroupResources = isLeader || UserHelper.checkAccess(Permissions.membershipApi.groups.edit);

  return (
    <ScrollView style={styles.containerScoll}>
      <ResourcesTable files={files} links={links} canEditGroupResources={canEditGroupResources} handleDelete={handleDelete} handleLinkDelete={handleLinkDelete} formatSize={formatSize} />
      <GroupLinkAdd groupId={groupId || ""} saveCallback={loadData} forGroupLeader={false} />

      <InputBox headerIcon="file" headerText={t("groups.upload")}>
        {getStorage()}
        <FileUpload contentType="group" contentId={groupId || ""} pendingSave={pendingFileSave} saveCallback={handleFileSaved} />
      </InputBox>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerScoll: { flex: 1 },
  aboutContainer: { minHeight: 200 },
  markdownStyles: {
    body: {
      fontSize: 16,
      lineHeight: 24
    }
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  },
  container: {
    marginVertical: 12,
    paddingHorizontal: 16
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  progressBarWrapper: {
    flex: 1,
    marginRight: 8
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "lightgray"
  },
  percentWrapper: {
    minWidth: 35,
    alignItems: "flex-end"
  },
  percentText: { fontSize: 12 }
});
