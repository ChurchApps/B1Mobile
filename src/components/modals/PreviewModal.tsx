import { DimensionHelper } from "@churchapps/mobilehelper";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import { Constants, CurrencyHelper, DateHelper, globalStyles } from "../../helpers";
import { StripeDonationInterface } from "../../interfaces";
import { CustomModal } from "./CustomModal";

interface Props {
  show: boolean;
  close: () => void;
  donation: StripeDonationInterface;
  paymentMethodName: string;
  donationType: string;
  handleDonate: (message: string) => void;
  isChecked: boolean
  transactionFee: number;
}

export function PreviewModal({ show, close, donation, paymentMethodName, donationType: d, handleDonate, isChecked, transactionFee }: Props) {
  const donationType: any = { once: "One-time Donation", recurring: "Recurring Donation" };
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    let message = "Thank you for your donation.";
    if (d === "recurring") message = "Recurring donation created. " + message;
    await handleDonate(message);
    setLoading(false);
  };

  const formatInterval = () => {
    const count = donation.interval?.interval_count;
    const interval = donation.interval?.interval;
    let result = `${count} ${interval}`;
    return count && count > 1 ? result + "s" : result;
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <CustomModal isVisible={show} close={close} width={DimensionHelper.wp(90)}>
      <View style={{ paddingHorizontal: DimensionHelper.wp(1) }}>
        <View style={globalStyles.donationPreviewView}>
          <Text style={globalStyles.donationText}>Donation Preview</Text>
          <TouchableOpacity
            onPress={() => {
              close();
            }}
            style={globalStyles.donationCloseBtn}
          >
            <Icon name={"close"} style={globalStyles.closeIcon} size={DimensionHelper.wp("6%")} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Name:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{donation?.person?.name}</Text>
          </View>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Payment Method:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{paymentMethodName == undefined || paymentMethodName == "" ? "Card" : paymentMethodName}</Text>
          </View>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Type:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{donationType[d]}</Text>
          </View>
          {d === "once" && (
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Donation Date:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>
                {DateHelper.formatHtml5Date(new Date(donation.billing_cycle_anchor || ""))}
              </Text>
            </View>
          )}
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Notes:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{donation.notes}</Text>
          </View>
          {d === "recurring" && (
            <>
              <View style={globalStyles.previewView}>
                <Text style={globalStyles.previewTitleText}>Starting On:</Text>
                <Text style={{ ...globalStyles.previewDetailText }}>
                  {DateHelper.formatHtml5Date(new Date(donation.billing_cycle_anchor || ""))}
                </Text>
              </View>
              <View style={globalStyles.previewView}>
                <Text style={globalStyles.previewTitleText}>Recurring Every:</Text>
                <Text style={{ ...globalStyles.previewDetailText }}>{formatInterval()}</Text>
              </View>
            </>
          )}
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Funds:</Text>
            <View style={{ display: "flex" }}>
              {donation.funds?.map((fund, index) => (
                <Text key={index} style={{ ...globalStyles.previewDetailText }}>
                  {CurrencyHelper.formatCurrency(fund.amount)} - {fund.name}
                </Text>
              ))}
            </View>
          </View>
          {isChecked &&
            <View style={globalStyles.previewView}>
              <Text style={globalStyles.previewTitleText}>Transaction Fee:</Text>
              <Text style={{ ...globalStyles.previewDetailText }}>
                {CurrencyHelper.formatCurrency(transactionFee)}
              </Text>
            </View>
          }
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Total:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>
              {/* {CurrencyHelper.formatCurrency(donation.amount || 0)} */}
              {isChecked ? (CurrencyHelper.formatCurrency((donation.amount || 0) + transactionFee)) : (CurrencyHelper.formatCurrency(donation.amount || 0))}
            </Text>
          </View>
        </ScrollView>
        <View style={globalStyles.popupBottomContainer}>
          <TouchableOpacity style={{ ...globalStyles.popupButton, backgroundColor: "#6C757D" }} onPress={() => close()}>
            <Text style={globalStyles.popupButonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...globalStyles.popupButton, backgroundColor: Constants.Colors.button_bg }}
            onPress={() => handleClick()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" animating={isLoading} />
            ) : (
              <Text style={globalStyles.popupButonText}>Donate</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
}
