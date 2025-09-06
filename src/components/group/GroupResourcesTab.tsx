import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { ApiHelper, FileInterface, UserHelper } from "../../../src/helpers";
import { LinkInterface, Permissions } from "@churchapps/helpers";
import { ProgressBar, Text } from "react-native-paper";
import { useCurrentUserChurch } from "../../../src/stores/useUserStore";
import ResourcesTable from "./section/StorageInfo";

interface GroupResourcesTabProps {
  groupId?: string;
}

export const GroupResourcesTab: React.FC<GroupResourcesTabProps> = ({ groupId }) => {
  const [files, setFiles] = useState<FileInterface[]>(null);
  const [links, setLinks] = useState<LinkInterface[]>(null);
  const [pendingFileSave, setPendingFileSave] = useState(false);
  const currentUserChurch = useCurrentUserChurch();

  let usedSpace = 0;
  files?.forEach(f => (usedSpace += f.size));

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = useCallback(() => {
    ApiHelper.get("/files/group/" + groupId, "ContentApi")
      .then(data => {
        // alert("Files loaded: " + (data?.length || 0));
        setFiles(data);
      })
      .catch((error: any) => {
        console.error("Error fetching messages:", error);
      });

    ApiHelper.get("/links?category=groupLink", "ContentApi").then((data: LinkInterface[]) => {
      const result: LinkInterface[] = [];
      data?.forEach(l => {
        if (l.linkData === groupId) result.push(l);
      });
      setLinks(result);
    });
  }, []);

  const handleDelete = async (file: FileInterface) => {
    Alert.alert("Are you sure you wish to delete '" + file.fileName + "?", "", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
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
    Alert.alert("Are you sure you wish to delete '" + link.text + "?", "", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
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

  const StorageInfo = () => {
    const percent = usedSpace / 100000000; // 100 MB fixed limit

    return (
      <View style={styles.container}>
        <Text>Used space: {formatSize(usedSpace)} / 100MB</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={percent} color="#0D47A1" style={styles.progressBar} />
          </View>
          <View style={styles.percentWrapper}>
            <Text style={styles.percentText}>{`${Math.round(percent * 100)}%`}</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerScoll: {
    flex: 1
  },
  aboutContainer: {
    minHeight: 200
  },
  markdownStyles: {
    body: {
      color: "#3c3c3c",
      fontSize: 16,
      lineHeight: 24
    }
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24
  },
  emptyIcon: {
    backgroundColor: "#F6F6F8",
    marginBottom: 16
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
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
    borderRadius: 4
  },
  percentWrapper: {
    minWidth: 35,
    alignItems: "flex-end"
  },
  percentText: {
    fontSize: 12,
    color: "#555"
  }
});
