import { DimensionHelper } from "@/helpers/DimensionHelper";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Constants, globalStyles } from "../../../src/helpers";
import { RadioButtonGroup } from "../RadioButton";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../src/theme";

const values = ["this", "future", "all"];

interface Props {
  action: string;
  onDone?: (editType: string) => void;
  setModal?: (colse: boolean) => void;
}

export default function EditRecurringModal(props: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [selectedOption, setSelectedOption] = useState(values[0]);
  const [editType, setEditType] = useState(values[0]);

  const options = [t("events.justThisDate"), t("events.thisAndFollowing"), t("events.allDates")];

  return (
    <View>
      <View style={styles.labelContainer}>
        <Text style={[styles.labelText, { color: colors.text }]}>{props.action === "delete" ? t("events.deleteRecurringEvents") : t("events.editRecurringEvents")}</Text>
        <TouchableOpacity
          onPress={() => {
            if (props.setModal) props.setModal(false);
          }}>
          <MaterialIcons name={"close"} style={[globalStyles.closeIcon, { color: colors.textMuted }]} size={DimensionHelper.wp(6)} />
        </TouchableOpacity>
      </View>
      <RadioButtonGroup
        options={options}
        values={values}
        selectedValue={selectedOption}
        onValueChange={e => {
          setSelectedOption(e);
          setEditType(e);
        }}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.buttons}
          onPress={() => {
            if (props.onDone) props.onDone(editType);
          }}>
          <Text style={[styles.buttonsText, { color: colors.primary }]}>{t("common.save").toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  buttons: {
    width: DimensionHelper.wp(30),
    height: DimensionHelper.wp(12),
    borderRadius: DimensionHelper.wp(2),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
  },
  buttonsText: {
    fontSize: DimensionHelper.wp(3.8),
    fontFamily: Constants.Fonts.RobotoMedium
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  labelText: {
    marginVertical: 10,
    fontSize: DimensionHelper.wp(4.5)
  }
});
