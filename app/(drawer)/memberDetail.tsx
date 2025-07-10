import React, { useEffect, useRef, useCallback } from "react";
import { MainHeader } from "../../src/components/wrapper/MainHeader";
import { Constants, EnvironmentHelper, UserHelper } from "../../src/helpers";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Alert, Linking, ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Surface, Text, MD3LightTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { OptimizedImage } from "../../src/components/OptimizedImage";
import { MemberCard } from "../../src/components/MemberCard";
import { useCurrentUserChurch } from "../../src/stores/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingWrapper } from "../../src/components/wrapper/LoadingWrapper";
import { LinearGradient } from "expo-linear-gradient";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1565C0", // Primary Blue from style guide
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

interface ContactInfo {
  email?: string;
  homePhone?: string;
  mobilePhone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Member {
  id: string;
  name: { display: string };
  photo?: string;
  householdId?: string;
  contactInfo?: ContactInfo;
}

const MemberDetail = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { member } = useLocalSearchParams<{ member: any }>();
  const parsedMember: Member = JSON.parse(member);
  const memberinfo = parsedMember?.contactInfo;
  const scrollViewRef = useRef<ScrollView>(null);

  const currentUserChurch = useCurrentUserChurch();

  // Use react-query for household members
  const { data: householdList = [], isLoading } = useQuery({
    queryKey: [`/people/household/${parsedMember?.householdId}`, "MembershipApi"],
    enabled: !!parsedMember?.householdId && !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 15 * 60 * 1000, // 15 minutes - household members don't change frequently
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  useEffect(() => {
    UserHelper.addOpenScreenEvent("Member Detail Screen");
  }, []);

  const handleEmail = useCallback((email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert("Not Available", "Email address is not available for this member.");
    }
  }, []);

  const handleCall = useCallback((phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Not Available", "Phone number is not available for this member.");
    }
  }, []);

  const handleAddress = useCallback(() => {
    if (memberinfo?.address1) {
      const address = encodeURIComponent(`${memberinfo.address1}, ${memberinfo.city || ""} ${memberinfo.state || ""} ${memberinfo.zip || ""}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
    } else {
      Alert.alert("Not Available", "Address is not available for this member.");
    }
  }, [memberinfo]);

  const handleMessage = useCallback(() => {
    router.navigate({
      pathname: "/(drawer)/messageScreen",
      params: { userDetails: JSON.stringify(parsedMember) }
    });
  }, [parsedMember]);

  const handleMemberPress = useCallback((item: Member) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    router.navigate({
      pathname: "/(drawer)/memberDetail",
      params: { member: JSON.stringify(item) }
    });
  }, []);

  const renderHouseholdMember = useCallback(({ item }: { item: Member }) => <MemberCard member={item} onPress={handleMemberPress} subtitle="Household Member" size="medium" />, [handleMemberPress]);

  const primaryPhone = memberinfo?.mobilePhone || memberinfo?.homePhone;
  const hasContactInfo = memberinfo?.email || primaryPhone || memberinfo?.address1;

  return (
    <SafeAreaProvider>
      <LoadingWrapper loading={isLoading}>
        <Surface style={styles.container}>
          <MainHeader title="Member Details" openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())} back={navigation.goBack} />

          <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <Card style={styles.heroCard}>
              <LinearGradient colors={["#1565C0", "#2196F3"]} style={styles.heroGradient}>
                <View style={styles.heroContent}>
                  <OptimizedImage source={parsedMember?.photo ? { uri: EnvironmentHelper.ContentRoot + parsedMember?.photo } : Constants.Images.ic_member} style={styles.heroAvatar} placeholder={Constants.Images.ic_member} priority="high" contentFit="cover" />
                  <Text variant="headlineMedium" style={styles.heroName}>
                    {parsedMember?.name?.display}
                  </Text>
                  <Text variant="bodyMedium" style={styles.heroSubtitle}>
                    Church Member
                  </Text>
                </View>
              </LinearGradient>
            </Card>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickActionButton} onPress={handleMessage}>
                  <View style={styles.quickActionIcon}>
                    <MaterialIcons name="message" size={24} color="#FFFFFF" />
                  </View>
                  <Text variant="labelMedium" style={styles.quickActionText}>
                    Message
                  </Text>
                </TouchableOpacity>

                {primaryPhone && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={() => handleCall(primaryPhone)}>
                    <View style={styles.quickActionIcon}>
                      <MaterialIcons name="phone" size={24} color="#FFFFFF" />
                    </View>
                    <Text variant="labelMedium" style={styles.quickActionText}>
                      Call
                    </Text>
                  </TouchableOpacity>
                )}

                {memberinfo?.email && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={() => handleEmail(memberinfo.email)}>
                    <View style={styles.quickActionIcon}>
                      <MaterialIcons name="email" size={24} color="#FFFFFF" />
                    </View>
                    <Text variant="labelMedium" style={styles.quickActionText}>
                      Email
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Contact Information */}
            {hasContactInfo && (
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Contact Information
                </Text>

                {memberinfo?.email && (
                  <Card style={styles.contactCard} onPress={() => handleEmail(memberinfo.email)}>
                    <Card.Content style={styles.contactContent}>
                      <View style={styles.contactIcon}>
                        <MaterialIcons name="email" size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text variant="bodySmall" style={styles.contactLabel}>
                          Email Address
                        </Text>
                        <Text variant="titleMedium" style={styles.contactValue}>
                          {memberinfo.email}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </Card.Content>
                  </Card>
                )}

                {primaryPhone && (
                  <Card style={styles.contactCard} onPress={() => handleCall(primaryPhone)}>
                    <Card.Content style={styles.contactContent}>
                      <View style={styles.contactIcon}>
                        <MaterialIcons name="phone" size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text variant="bodySmall" style={styles.contactLabel}>
                          {memberinfo?.mobilePhone ? "Mobile Phone" : "Phone Number"}
                        </Text>
                        <Text variant="titleMedium" style={styles.contactValue}>
                          {primaryPhone}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </Card.Content>
                  </Card>
                )}

                {memberinfo?.address1 && (
                  <Card style={styles.contactCard} onPress={handleAddress}>
                    <Card.Content style={styles.contactContent}>
                      <View style={styles.contactIcon}>
                        <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
                      </View>
                      <View style={styles.contactDetails}>
                        <Text variant="bodySmall" style={styles.contactLabel}>
                          Address
                        </Text>
                        <Text variant="titleMedium" style={styles.contactValue} numberOfLines={2}>
                          {memberinfo.address1}
                          {memberinfo.address2 && `, ${memberinfo.address2}`}
                        </Text>
                        {(memberinfo.city || memberinfo.state || memberinfo.zip) && (
                          <Text variant="bodyMedium" style={styles.contactSubValue}>
                            {[memberinfo.city, memberinfo.state, memberinfo.zip].filter(Boolean).join(", ")}
                          </Text>
                        )}
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                    </Card.Content>
                  </Card>
                )}
              </View>
            )}

            {/* Household Members */}
            {householdList.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Household Members
                </Text>
                {householdList.map((item: Member) => (
                  <View key={item.id}>{renderHouseholdMember({ item })}</View>
                ))}
              </View>
            )}
          </ScrollView>
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
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32
  },

  // Hero Section
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroGradient: {
    padding: 32,
    alignItems: "center",
    minHeight: 200
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  heroName: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  heroSubtitle: {
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16
  },
  quickActionButton: {
    alignItems: "center",
    minWidth: 80
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  quickActionText: {
    color: "#3c3c3c",
    fontWeight: "600",
    textAlign: "center"
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 20
  },

  // Contact Cards
  contactCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  contactDetails: {
    flex: 1
  },
  contactLabel: {
    color: "#9E9E9E",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2
  },
  contactValue: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  contactSubValue: {
    color: "#9E9E9E",
    fontSize: 14
  }
});

export default MemberDetail;
