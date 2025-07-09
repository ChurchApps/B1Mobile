import { DimensionHelper } from "@/helpers/DimensionHelper";
import React, { useMemo, useCallback } from "react";
import { FlatList, Image, Text, View } from "react-native";
import Icons from "react-native-vector-icons/MaterialIcons";
import { AssignmentInterface, Constants, EnvironmentHelper, PersonInterface, PositionInterface, globalStyles } from "../../../src/helpers";

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
      <View key={item.id}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
          <Image source={{ uri: EnvironmentHelper.ContentRoot + item?.item?.photo }} style={{ width: 50, height: 50, borderRadius: 5 }} />
          <View style={{ marginLeft: 10 }}>
            <Text>{item?.item?.name}</Text>
            <Text>{item?.item?.position}</Text>
          </View>
        </View>
        <View style={globalStyles.BorderSeparatorView} />
      </View>
    ),
    []
  );

  return (
    <View style={globalStyles.FlatlistViewStyle}>
      <View style={{ marginLeft: DimensionHelper.wp(3), marginVertical: DimensionHelper.hp(1.5), flexDirection: "row", alignItems: "center" }}>
        <Icons name="people" style={{ color: Constants.Colors.app_color }} size={DimensionHelper.wp(5.5)} />
        <Text style={[globalStyles.LatestUpdateTextStyle, { paddingLeft: DimensionHelper.wp(3), color: Constants.Colors.app_color }]}>{name}</Text>
      </View>
      <FlatList data={teamData} renderItem={renderItem} scrollEnabled={false} />
    </View>
  );
});
