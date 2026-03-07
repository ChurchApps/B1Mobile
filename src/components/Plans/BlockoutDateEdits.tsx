import { ApiHelper } from "@churchapps/helpers";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { DateHelper } from "../../helpers/DateHelper";
import dayjs from "../../helpers/dayjsConfig";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ModalDatePicker } from "react-native-material-date-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlockoutDateInterface, globalStyles } from "../../../src/helpers";
import { ApiErrorHandler } from "../../../src/helpers/ApiErrorHandler";
import { CustomModal } from "../modals/CustomModal";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../src/theme";

interface Props {
  blockoutDate: any;
  onClose: () => void;
  visible: boolean;
  onUpdate: () => void;
}

export const BlockoutDateEdits = ({ onClose, visible, blockoutDate, onUpdate }: Props) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [BlockoutDate, setBlockoutDate] = useState<BlockoutDateInterface>(blockoutDate);
  const blockOutEndDate = BlockoutDate.endDate;
  const blockOutStartDate = BlockoutDate.startDate;
  const [errors, setErrors] = useState<string[]>([]);
  const [endDate, setEndDate] = useState(blockOutEndDate ? blockOutEndDate : new Date());
  const [startDate, setStartDate] = useState(blockOutStartDate ? blockOutStartDate : new Date());

  const validate = () => {
    const result: string[] = [];
    if (!BlockoutDate.startDate) result.push(t("plans.startDateRequired"));
    if (!BlockoutDate.endDate) result.push(t("plans.endDateRequired"));
    if (BlockoutDate.startDate && BlockoutDate.endDate && BlockoutDate.startDate > BlockoutDate.endDate) result.push(t("plans.startBeforeEnd"));
    setErrors(result);
    return result.length === 0;
  };

  const onPressSaveButton = async () => {
    if (!validate()) return;
    try {
      await ApiHelper.post("/blockoutDates", [BlockoutDate], "DoingApi");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error saving blockout date:", error);
      ApiErrorHandler.showErrorAlert(error, "Error");
    }
  };

  const onPressDeleteButton = async (id: number) => {
    try {
      await ApiHelper.delete("/blockoutDates/" + id, "DoingApi");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error deleting blockout date:", error);
      ApiErrorHandler.showErrorAlert(error, "Error");
    }
  };

  return (
    <>
      <CustomModal width={DimensionHelper.wp(90)} isVisible={visible} close={() => onClose()}>
        <View style={{ paddingHorizontal: DimensionHelper.wp(1) }}>
          <View style={[globalStyles.donationPreviewView, { borderBottomWidth: 0 }]}>
            <View style={globalStyles.PlanIconTitleView}>
              <MaterialCommunityIcons name="block-helper" style={{ color: colors.primary }} size={DimensionHelper.wp(5.5)} />
              <Text style={[globalStyles.PlanTitleTextStyle, { color: colors.primary }]}>{t("plans.blockoutDates")}</Text>
            </View>
          </View>

          <View style={globalStyles.InputBtnView}>
            <View style={globalStyles.InputView}>
              <Text style={globalStyles.PassInputTextStyle}>{dayjs(startDate).format("L")}</Text>
            </View>
            <ModalDatePicker
              button={<MaterialIcons name={"calendar-today"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} />}
              locale="en"
              onSelect={(date: Date) => {
                setBlockoutDate({ ...BlockoutDate, startDate: DateHelper.formatHtml5Date(date) });
                setStartDate(date);
                setErrors([]);
              }}
              isHideOnSelect={true}
              initialDate={new Date()}
            />
          </View>
          <View style={globalStyles.InputBtnView}>
            <View style={globalStyles.InputView}>
              <Text style={globalStyles.PassInputTextStyle}>{dayjs(endDate).format("L")}</Text>
            </View>
            <ModalDatePicker
              button={<MaterialIcons name={"calendar-today"} style={globalStyles.selectionIcon} size={DimensionHelper.wp(6)} />}
              locale="en"
              onSelect={(date: Date) => {
                setBlockoutDate({ ...BlockoutDate, endDate: DateHelper.formatHtml5Date(date) });
                setEndDate(date);
                setErrors([]);
              }}
              isHideOnSelect={true}
              initialDate={new Date()}
            />
          </View>
          <View style={globalStyles.CancelAddbuttonView}>
            <TouchableOpacity
              onPress={() => {
                onClose();
              }}>
              <Text style={[globalStyles.ButtonTextStyle, { color: colors.error }]}>{t("common.cancel").toUpperCase()}</Text>
            </TouchableOpacity>
            {Object.keys(blockoutDate).length > 0 ? (
              <TouchableOpacity onPress={() => onPressDeleteButton(blockoutDate.id)} style={[globalStyles.DeleteButtonStyle, { borderColor: colors.error }]}>
                <Text style={[globalStyles.ButtonTextStyle, { color: colors.error }]}>{t("common.delete").toUpperCase()}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => onPressSaveButton()} style={[globalStyles.SaveButtonStyle, { backgroundColor: colors.primary }]}>
              <Text style={[globalStyles.ButtonTextStyle, { color: colors.white }]}>{t("common.save").toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          {errors.length > 0 && (
            <View>
              {errors.map((error: string) => (
                <Text key={`error-${error.toLowerCase().replace(/\s+/g, "-")}`} style={{ color: colors.error }}>
                  {error}
                </Text>
              ))}
            </View>
          )}
        </View>
      </CustomModal>
    </>
  );
};
