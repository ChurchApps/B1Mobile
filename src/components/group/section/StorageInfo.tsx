import React, { useEffect } from "react";
import { View, Linking, StyleSheet } from "react-native";
import { Text, DataTable, IconButton, Card } from "react-native-paper";
import { FileInterface } from "../../../helpers";

interface Props {
  files?: FileInterface[];
  links?: any;
  canEditGroupResources: boolean;
  handleDelete: (file: File) => void;
  handleLinkDelete: (link: LinkItem) => void;
  formatSize: (size: number) => string;
}

const ResourcesTable: React.FC<Props> = ({ files, links, canEditGroupResources, handleDelete, handleLinkDelete, formatSize }) => {
  useEffect(() => {
    // Any initialization if needed
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.contentCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.navButtonText]}>{"Added Links"}</Text>
        </View>

        {links && links.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={[styles.navButtonText]}>{"No data"}</Text>
          </View>
        )}

        {links && links.length > 0 && (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title numeric>Size</DataTable.Title>
              <DataTable.Title numeric>Actions</DataTable.Title>
            </DataTable.Header>

            {/* Link rows */}
            {links?.map(link => (
              <DataTable.Row key={link.id}>
                <DataTable.Cell>
                  <Text style={styles.linkText} onPress={() => Linking.openURL(link.url)}>
                    {link.text}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
                {/* <View style={styles.centerCell}>
                <Text>{"-"}</Text>
              </View> */}
                <DataTable.Cell numeric>{canEditGroupResources && <IconButton icon="delete" size={20} onPress={() => handleLinkDelete(link)} accessibilityLabel={`Delete link ${link.text}`} />}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        )}
      </Card>

      <Card style={styles.contentCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.navButtonText]}>{"Added Files"}</Text>
        </View>
        {files && files.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={[styles.navButtonText]}>{"No data"}</Text>
          </View>
        )}
        {files && files.length > 0 && (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title numeric>Size</DataTable.Title>
              <DataTable.Title numeric>Actions</DataTable.Title>
            </DataTable.Header>
            {/* File rows */}
            {files?.map(file => (
              <DataTable.Row key={file.id}>
                <DataTable.Cell>
                  <Text style={styles.linkText} onPress={() => Linking.openURL(file.contentPath)}>
                    {file.fileName}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell numeric>{formatSize(file.size || 0)}</DataTable.Cell>

                <DataTable.Cell numeric>{canEditGroupResources && <IconButton icon="delete" size={20} onPress={() => handleDelete(file)} accessibilityLabel={`Delete file ${file.fileName}`} />}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 10,
    elevation: 3,
    overflow: "hidden"
  },
  centerText: {
    textAlign: "center",
    width: "100%" // ensures textAlign works inside DataTable.Cell
  },
  linkText: {
    color: "#0D47A1",
    textDecorationLine: "underline"
  },
  navButtonIcon: {
    marginBottom: 4
  },
  navButtonText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 10,
    alignItems: "center"
  },
  navButtonAvatar: {
    backgroundColor: "#9E9E9E"
  }
});

export default ResourcesTable;
