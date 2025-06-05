import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from "react-native";
import { ApiHelper } from "@/src/helpers";
import { DimensionHelper } from "@/src/helpers/DimensionHelper";
import { Constants } from "@/src/helpers/Constants";
import Icons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  arrangementKeyId?: string;
  onClose: () => void;
}

export const SongDialog = ({ arrangementKeyId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [songDetail, setSongDetail] = useState<any>(null);
  const [arrangement, setArrangement] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [externalLinks, setExternalLinks] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const ak = await ApiHelper.get(`/arrangementKeys/${arrangementKeyId}`, "ContentApi");
        const arr = await ApiHelper.get(`/arrangements/${ak.arrangementId}`, "ContentApi");
        setArrangement(arr);
        const sd = await ApiHelper.get(`/songDetails/${arr.songDetailId}`, "ContentApi");
        setSongDetail(sd);
        const linkData = await ApiHelper.get(`/links?category=arrangementKey_${ak.id}`, "ContentApi");
        setLinks(linkData);
        if (sd?.id) {
          const extLinks = await ApiHelper.get(`/songDetailLinks/songDetail/${sd.id}`, "ContentApi");
          setExternalLinks(extLinks);
        } else {
          setExternalLinks([]);
        }
      } catch {
        setSongDetail(null);
        setExternalLinks([]);
      }
      setLoading(false);
    };
    if (arrangementKeyId) loadData();
  }, [arrangementKeyId]);

  if (!arrangementKeyId) return null;

  return (
    <Modal visible={!!arrangementKeyId} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icons name="close" size={28} color={Constants.Colors.Dark_Gray} />
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color={Constants.Colors.app_color} />
          ) : songDetail ? (
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>{songDetail.title}</Text>
              {songDetail.thumbnail ? <Image source={{ uri: songDetail.thumbnail }} style={styles.thumbnail} resizeMode="contain" /> : null}
              <View style={styles.detailsTable}>
                {songDetail.artist && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Artist: </Text>
                    {songDetail.artist}
                  </Text>
                )}
                {songDetail.album && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Album: </Text>
                    {songDetail.album}
                  </Text>
                )}
                {songDetail.language && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Language: </Text>
                    {songDetail.language}
                  </Text>
                )}
                {songDetail.bpm && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>BPM: </Text>
                    {songDetail.bpm}
                  </Text>
                )}
                {songDetail.keySignature && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Key: </Text>
                    {songDetail.keySignature}
                  </Text>
                )}
                {songDetail.tones && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Keys: </Text>
                    {songDetail.tones}
                  </Text>
                )}
                {songDetail.meter && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Meter: </Text>
                    {songDetail.meter}
                  </Text>
                )}
                {songDetail.seconds && (
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Length: </Text>
                    {Math.floor(songDetail.seconds / 60)}:{(songDetail.seconds % 60).toString().padStart(2, "0")}
                  </Text>
                )}
              </View>
              {externalLinks.length > 0 && (
                <View style={styles.linksSection}>
                  <Text style={styles.linksTitle}>External Links</Text>
                  {externalLinks.map((l, i) => (
                    <TouchableOpacity key={l.id || i} onPress={() => Linking.openURL(l.url)} style={styles.linkRow}>
                      {getServiceIcon(l.service)}
                      <Text style={styles.link}>{l.service || l.text || l.url}</Text>
                    </TouchableOpacity>
                  ))}
                  {songDetail?.praiseChartsId && (
                    <TouchableOpacity
                      key="praisecharts"
                      onPress={() => Linking.openURL(`https://www.praisecharts.com/songs/details/${songDetail.praiseChartsId}?XID=churchapps`)}
                      style={styles.linkRow}>
                      {getServiceIcon("PraiseCharts")}
                      <Text style={styles.link}>PraiseCharts</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {arrangement?.lyrics ? (
                <View style={styles.lyricsSection}>
                  <Text style={styles.lyricsTitle}>Lyrics</Text>
                  <Text style={styles.lyrics}>{arrangement.lyrics}</Text>
                </View>
              ) : null}
              {links.length > 0 && (
                <View style={styles.linksSection}>
                  <Text style={styles.linksTitle}>Links</Text>
                  {links.map((l, i) => (
                    <TouchableOpacity key={l.id || i} onPress={() => Linking.openURL(l.url)}>
                      <Text style={styles.link}>{l.text || l.service || l.url}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>Song details not found.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  dialog: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: DimensionHelper.wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2
  },
  content: {
    paddingTop: 30,
    paddingBottom: 10
  },
  title: {
    fontSize: DimensionHelper.wp(5),
    fontWeight: "bold",
    color: Constants.Colors.app_color,
    textAlign: "center",
    marginBottom: 10
  },
  thumbnail: {
    width: "100%",
    height: DimensionHelper.wp(40),
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#eee"
  },
  detailsTable: {
    marginBottom: 10
  },
  detailRow: {
    fontSize: DimensionHelper.wp(3.7),
    marginBottom: 2,
    color: Constants.Colors.Dark_Gray
  },
  detailLabel: {
    fontWeight: "bold",
    color: Constants.Colors.app_color
  },
  lyricsSection: {
    marginTop: 10,
    marginBottom: 10
  },
  lyricsTitle: {
    fontWeight: "bold",
    fontSize: DimensionHelper.wp(4),
    color: Constants.Colors.app_color,
    marginBottom: 4
  },
  lyrics: {
    fontSize: DimensionHelper.wp(3.7),
    color: Constants.Colors.Dark_Gray
  },
  linksSection: {
    marginTop: 10
  },
  linksTitle: {
    fontWeight: "bold",
    fontSize: DimensionHelper.wp(4),
    color: Constants.Colors.app_color,
    marginBottom: 4
  },
  link: {
    color: Constants.Colors.app_color,
    fontSize: DimensionHelper.wp(3.7),
    marginBottom: 2,
    textDecorationLine: "underline"
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 40
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  }
});

function getServiceIcon(service: string) {
  switch ((service || "").toLowerCase()) {
    case "youtube":
      return <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" style={{ marginRight: 8 }} />;
    case "ccli":
      return <MaterialCommunityIcons name="music-circle" size={24} color="#222" style={{ marginRight: 8 }} />;
    case "praisecharts":
      return <MaterialCommunityIcons name="music-box-multiple" size={24} color="#2e7d32" style={{ marginRight: 8 }} />;
    case "spotify":
      return <MaterialCommunityIcons name="spotify" size={24} color="#1DB954" style={{ marginRight: 8 }} />;
    case "apple":
    case "apple music":
      return <MaterialCommunityIcons name="apple" size={24} color="#000" style={{ marginRight: 8 }} />;
    case "genius":
      return <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#f5e342" style={{ marginRight: 8 }} />;
    case "hymnary":
      return <MaterialCommunityIcons name="book-music" size={24} color="#1976d2" style={{ marginRight: 8 }} />;
    case "musicbrainz":
      return <MaterialCommunityIcons name="brain" size={24} color="#ff8800" style={{ marginRight: 8 }} />;
    default:
      return null;
  }
}
