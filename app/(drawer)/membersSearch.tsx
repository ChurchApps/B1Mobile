import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { UserHelper } from "../../src/helpers";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation as useReactNavigation, DrawerActions } from "@react-navigation/native";
import { router } from "expo-router";
import { useNavigation } from "../../src/hooks";
import { View, StyleSheet, SectionList } from "react-native";
import { Surface, Text, TextInput, MD3LightTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { MemberCard } from "../../src/components/MemberCard";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { useTranslation } from "react-i18next";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1", // Primary Blue from style guide
    secondary: "#F6F6F8", // Background from style guide
    surface: "#FFFFFF", // Card Background from style guide
    background: "#F6F6F8", // Background from style guide
    onSurface: "#3c3c3c", // Dark Gray from style guide
    onBackground: "#3c3c3c", // Dark Gray from style guide
    onSurfaceVariant: "#9E9E9E", // Medium Gray from style guide
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
    }
  }
};

interface Member {
  id: string;
  name: { display: string; first?: string; last?: string };
  photo?: string;
  contactInfo?: {
    email?: string;
    homePhone?: string;
    mobilePhone?: string;
  };
}

interface MemberSection {
  title: string;
  data: Member[];
}

const MembersSearch = () => {
  const { t } = useTranslation();
  const navigation = useReactNavigation<DrawerNavigationProp<any>>();
  const { navigateBack } = useNavigation();
  const [searchText, setSearchText] = useState("");
  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for members data with aggressive caching
  const { data: membersList = [], isLoading } = useQuery({
    queryKey: ["/people", "MembershipApi"],
    enabled: !!currentUserChurch?.jwt, // Only run when authenticated
    placeholderData: [],
    staleTime: 10 * 60 * 1000, // 10 minutes - members don't change frequently
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Member Search Screen");
  }, []);

  // Filter members based on search and remove duplicates
  const filteredMembers = useMemo(() => {
    if (!membersList.length) return [];

    // Remove duplicates by ID first
    const uniqueMembers = membersList.filter((member: Member, index: number, self: Member[]) => self.findIndex(m => m.id === member.id) === index);

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      return uniqueMembers.filter((item: Member) => item.name.display.toLowerCase().includes(searchLower));
    }

    return uniqueMembers;
  }, [membersList, searchText]);

  // Group members by first letter for section list (sorted by last name)
  const groupedMembers = useMemo(() => {
    if (!filteredMembers.length) return [];

    const groups: { [key: string]: Member[] } = {};

    filteredMembers.forEach((member: Member) => {
      // Extract last name for grouping and sorting
      const nameParts = member.name.display.trim().split(" ");
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
      const firstLetter = lastName.charAt(0).toUpperCase();

      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(member);
    });

    // Convert to section list format and sort by last name
    return Object.keys(groups)
      .sort()
      .map(letter => ({
        title: letter,
        data: groups[letter].sort((a, b) => {
          // Extract last names for sorting
          const aLastName = a.name.display.trim().split(" ").slice(-1)[0];
          const bLastName = b.name.display.trim().split(" ").slice(-1)[0];
          const lastNameComparison = aLastName.localeCompare(bLastName);

          // If last names are the same, sort by first name
          if (lastNameComparison === 0) {
            return a.name.display.localeCompare(b.name.display);
          }
          return lastNameComparison;
        })
      }));
  }, [filteredMembers]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleMemberPress = useCallback((member: Member) => {
    router.navigate({
      pathname: "/memberDetailRoot",
      params: { member: JSON.stringify(member) }
    });
  }, []);

  const renderMemberItem = useCallback(({ item }: { item: Member }) => <MemberCard member={item} onPress={handleMemberPress} size="medium" />, [handleMemberPress]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: MemberSection }) => (
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {section.title}
        </Text>
        <View style={styles.sectionDivider} />
      </View>
    ),
    []
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <MaterialIcons name="people-outline" size={64} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {searchText ? t("members.noMembersFound") : t("navigation.directory")}
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          {searchText ? t("members.tryAdjusting") : t("members.searchForMembers")}
        </Text>
      </View>
    ),
    [searchText, theme.colors.onSurfaceVariant, t]
  );

  return (
    <SafeAreaProvider>
      <LoadingWrapper loading={isLoading}>
        <Surface style={styles.container}>
          <MainHeader title={t("navigation.directory")} openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={() => navigateBack()} />

          <View style={styles.content}>
            {/* Search Header */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <TextInput mode="outlined" label={t("members.searchMembers")} placeholder={t("members.enterName")} value={searchText} onChangeText={handleSearchChange} style={styles.searchInput} left={<TextInput.Icon icon="magnify" />} right={searchText ? <TextInput.Icon icon="close" onPress={() => setSearchText("")} /> : undefined} />
              </View>
            </View>

            {/* Results */}
            {groupedMembers.length > 0 ? (
              <SectionList
                sections={groupedMembers}
                renderItem={renderMemberItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item: Member) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
                initialNumToRender={10}
                windowSize={21}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
                onEndReachedThreshold={0.5}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 10
                }}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        </Surface>
      </LoadingWrapper>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8" // Background from style guide
  },
  content: { flex: 1 },

  // Search Section
  searchSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  searchContainer: { marginBottom: 0 },
  searchInput: { backgroundColor: "#FFFFFF" },

  // List Content
  listContent: {
    padding: 16,
    paddingBottom: 32
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12
  },
  sectionTitle: {
    color: "#0D47A1",
    fontWeight: "700",
    fontSize: 18,
    minWidth: 32
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 16
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});

export default MembersSearch;
