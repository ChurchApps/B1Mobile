import React, { useMemo, useCallback } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AssignmentInterface, EnvironmentHelper, PersonInterface, PositionInterface } from "../../../src/helpers";
import { Card } from "react-native-paper";
import { Avatar } from "../common/Avatar";

interface TeamMemberInterface {
  id?: string;
  photo?: string;
  name?: string;
  position?: string;
  personId?: string;
}

interface Props {
  positions: PositionInterface[];
  assignments: AssignmentInterface[];
  people: PersonInterface[];
  name: string;
}

export const Teams = React.memo(({ positions, assignments, people, name }: Props) => {
  const teamData = useMemo(() => {
    if (!people || !positions || !assignments) return [];
    const data: TeamMemberInterface[] = [];
    positions.forEach(position => {
      const posAssignments = assignments.filter(a => a.positionId === position.id);
      posAssignments.forEach(assignment => {
        const person = people.find(p => p.id === assignment.personId);

        if (person) {
          data.push({
            id: assignment.id,
            photo: person.photo,
            name: person.name.display,
            position: position.name,
            personId: person.id
          });
        }
      });
    });
    return data;
  }, [positions, assignments, people]);

  const renderItem = useCallback(
    (item: any) => (
      <Card key={item.id} style={styles.memberCard} mode="outlined">
        <Card.Content style={styles.memberContent}>
          <View style={styles.memberInfo}>
            <Avatar size={48} photoUrl={item?.item?.photo} firstName={people.find(p => p.id === item?.item?.personId)?.name?.first} lastName={people.find(p => p.id === item?.item?.personId)?.name?.last} style={styles.avatar} />
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{item?.item?.name}</Text>
              <Text style={styles.memberPosition}>{item?.item?.position}</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
        </Card.Content>
      </Card>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="group" size={24} color="#0D47A1" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.memberCount}>
          <Text style={styles.memberCountText}>{teamData.length}</Text>
        </View>
      </View>
      <View style={styles.membersList}>
        <FlatList data={teamData} renderItem={renderItem} scrollEnabled={false} showsVerticalScrollIndicator={false} keyExtractor={(item, index) => `${item?.id || index}`} ItemSeparatorComponent={() => <View style={styles.separator} />} initialNumToRender={5} windowSize={5} removeClippedSubviews={true} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(21, 101, 192, 0.05)",
    borderRadius: 12,
    marginBottom: 12
  },
  headerIcon: {
    marginRight: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D47A1",
    flex: 1
  },
  memberCount: {
    backgroundColor: "#0D47A1",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center"
  },
  memberCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
  },
  membersList: {
    backgroundColor: "transparent"
  },
  memberCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(21, 101, 192, 0.1)"
  },
  memberContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  avatar: {
    marginRight: 12
  },
  memberDetails: {
    flex: 1
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3c3c3c",
    marginBottom: 2
  },
  memberPosition: {
    fontSize: 14,
    color: "#9E9E9E",
    fontWeight: "500"
  },
  separator: {
    height: 8
  }
});
