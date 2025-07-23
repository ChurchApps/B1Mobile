import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";

interface GroupNavigationTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  onMessagesPress: () => void;
}

export const GroupNavigationTabs: React.FC<GroupNavigationTabsProps> = ({
  activeTab,
  onTabChange,
  onMessagesPress
}) => {
  return (
    <Card style={styles.navigationCard}>
      <Card.Content>
        <View style={styles.navigationGrid}>
          <TouchableOpacity 
            style={[styles.navButton, activeTab === 0 && styles.activeNavButton]} 
            onPress={() => onTabChange(0)}
          >
            <View style={styles.navButtonIcon}>
              <Avatar.Icon 
                size={40} 
                icon="information" 
                style={[styles.navButtonAvatar, activeTab === 0 && styles.activeNavButtonAvatar]} 
              />
            </View>
            <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 0 && styles.activeNavButtonText]}>
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={onMessagesPress}>
            <View style={styles.navButtonIcon}>
              <Avatar.Icon size={40} icon="chat" style={styles.navButtonAvatar} />
            </View>
            <Text variant="bodySmall" style={styles.navButtonText}>
              Messages
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 2 && styles.activeNavButton]} 
            onPress={() => onTabChange(2)}
          >
            <View style={styles.navButtonIcon}>
              <Avatar.Icon 
                size={40} 
                icon="account-group" 
                style={[styles.navButtonAvatar, activeTab === 2 && styles.activeNavButtonAvatar]} 
              />
            </View>
            <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 2 && styles.activeNavButtonText]}>
              Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, activeTab === 3 && styles.activeNavButton]} 
            onPress={() => onTabChange(3)}
          >
            <View style={styles.navButtonIcon}>
              <Avatar.Icon 
                size={40} 
                icon="calendar" 
                style={[styles.navButtonAvatar, activeTab === 3 && styles.activeNavButtonAvatar]} 
              />
            </View>
            <Text variant="bodySmall" style={[styles.navButtonText, activeTab === 3 && styles.activeNavButtonText]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  navigationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3
  },
  navigationGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F6F6F8"
  },
  activeNavButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#0D47A1"
  },
  navButtonIcon: {
    marginBottom: 4
  },
  navButtonAvatar: {
    backgroundColor: "#9E9E9E"
  },
  activeNavButtonAvatar: {
    backgroundColor: "#0D47A1"
  },
  navButtonText: {
    color: "#9E9E9E",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 12
  },
  activeNavButtonText: {
    color: "#0D47A1",
    fontWeight: "700",
    fontSize: 11,
    lineHeight: 12
  }
});