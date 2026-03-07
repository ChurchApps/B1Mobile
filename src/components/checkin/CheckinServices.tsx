import { UserHelper } from "../../../src/helpers";
import React, { useEffect } from "react";
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { LoadingWrapper } from "../../../src/components/wrapper/LoadingWrapper";
import { useAppTheme, useThemeColors } from "../../../src/theme";
import { Card, Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserChurch } from "../../stores/useUserStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useCheckinFlow } from "../../hooks/useCheckinFlow";

interface Props {
  onDone: () => void;
  handleBack: () => void;
}

export const CheckinServices = (props: Props) => {
  const { t } = useTranslation();
  const { theme, spacing } = useAppTheme();
  const colors = useThemeColors();
  const currentUserChurch = useCurrentUserChurch();
  const screenWidth = Dimensions.get("window").width;
  const { selectService, selectServiceLoading } = useCheckinFlow(props.onDone);

  // Use react-query for services
  const {
    data: serviceList = [],
    isLoading: servicesLoading,
    error: servicesError
  } = useQuery({
    queryKey: ["/services", "AttendanceApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - services don't change frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("ServiceScreen");
  }, []);

  const renderServiceItem = (item: any) => (
    <TouchableOpacity style={[styles.serviceCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]} onPress={() => selectService(item)} activeOpacity={0.7}>
      <View style={styles.serviceContent}>
        <View style={[styles.serviceIconContainer, { backgroundColor: colors.iconBackground }]}>
          <MaterialIcons name="church" size={28} color={colors.primary} />
        </View>
        <View style={styles.serviceInfo}>
          {item?.name && (
            <Text variant="titleLarge" style={[styles.serviceName, { color: colors.text }]}>
              {item.name}
            </Text>
          )}

          {item.campus?.name && (
            <Text variant="bodyMedium" style={[styles.campusName, { color: colors.primary }]}>
              {item.campus?.name}
            </Text>
          )}
        </View>
        <View style={styles.serviceArrow}>{selectServiceLoading.isLoading && selectServiceLoading.campusId === item.campusId ? <ActivityIndicator /> : <MaterialIcons name="chevron-right" size={24} color={colors.iconColor} />}</View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LoadingWrapper loading={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.iconHeaderContainer, { backgroundColor: colors.iconBackground }]}>
            <MaterialIcons name="event" size={48} color={colors.primary} />
          </View>
          <Text variant="headlineLarge" style={[styles.headerTitle, { color: colors.text }]}>
            {t("checkin.selectService")}
          </Text>
          <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t("checkin.chooseService")}
          </Text>
        </View>

        {/* Services List */}
        <View style={styles.contentSection}>
          {servicesLoading || (serviceList?.length === 0 && !servicesError) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="bodyLarge" style={[styles.loadingText, { color: colors.textMuted }]}>
                {t("checkin.loadingServices")}
              </Text>
            </View>
          ) : serviceList.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: colors.card, shadowColor: colors.shadowBlack }]}>
              <View style={styles.emptyContent}>
                <MaterialIcons name="event-busy" size={64} color={colors.iconColor} />
                <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("checkin.noServicesAvailable")}
                </Text>
                <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {t("checkin.noServicesMessage")}
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList data={serviceList} renderItem={({ item }) => renderServiceItem(item)} keyExtractor={(item: any) => item.id} style={styles.servicesList} contentContainerStyle={styles.servicesContent} showsVerticalScrollIndicator={false} />
          )}
        </View>
      </View>
    </LoadingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerSection: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 16
  },
  iconHeaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  headerTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  headerSubtitle: {
    textAlign: "center",
    maxWidth: "80%"
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16
  },
  servicesList: { flex: 1 },
  servicesContent: { paddingBottom: 24 },
  serviceCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 72
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontWeight: "600",
    marginBottom: 4
  },
  campusName: {
    fontWeight: "500"
  },
  serviceArrow: {
    justifyContent: "center",
    alignItems: "center"
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    padding: 32,
    alignItems: "center"
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48
  },
  loadingText: {
    marginTop: 16
  }
});
