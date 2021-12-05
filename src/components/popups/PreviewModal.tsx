import React, { useEffect } from "react";
import Dialog, { DialogContent, ScaleAnimation } from "react-native-popup-dialog";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Colors from "../../utils/Colors";
import { globalStyles, DateHelper, CurrencyHelper } from "../../helpers";
import { StripeDonationInterface } from "../../interfaces";

interface Props {
  show: boolean;
  close: () => void;
  donation: StripeDonationInterface;
  paymentMethodName: string;
  donationType: string;
  handleDonate: (message: string) => void;
}

export function PreviewModal({ show, close, donation, paymentMethodName, donationType: d, handleDonate }: Props) {
  const donationType: any = { once: "One-time Donation", recurring: "Recurring Donation" };
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    let message = "Thank you for your donation.";
    if (d === "recurring") message = "Recurring donation created. " + message;
    await handleDonate(message);
    setLoading(false)
  };

  const formatInterval = () => {
    const count = donation.interval?.interval_count;
    const interval = donation.interval?.interval;
    let result = `${count} ${interval}`;
    return count && count > 1 ? result + "s" : result;
  };

  useEffect(() => {
    setLoading(false)
  }, [])

  return (
    <Dialog onTouchOutside={() => close()} width={0.86} visible={show} dialogAnimation={new ScaleAnimation()}>
      <DialogContent>
        <View style={globalStyles.donationPreviewView}>
          <Text style={globalStyles.donationText}>Donation Preview</Text>
          <TouchableOpacity
            onPress={() => {
              close();
            }}
            style={globalStyles.donationCloseBtn}
          >
            <Icon name={"close"} style={globalStyles.closeIcon} size={wp("6%")} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Name:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{donation?.person?.name}</Text>
          </View>
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Payment Method:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>{paymentMethodName}</Text>
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
          <View style={globalStyles.previewView}>
            <Text style={globalStyles.previewTitleText}>Total:</Text>
            <Text style={{ ...globalStyles.previewDetailText }}>
              {CurrencyHelper.formatCurrency(donation.amount || 0)}
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
      </DialogContent>
    </Dialog>
  );
}
