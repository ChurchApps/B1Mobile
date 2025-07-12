import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, Modal, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Card, Text, Button, Chip, Menu, Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "@tanstack/react-query";
import { CurrencyHelper } from "../../helpers";
import { useCurrentUserChurch } from "../../stores/useUserStore";

interface DonationRecord {
  id: string;
  amount: number;
  fees: number;
  fund: string;
  date: Date;
  method: string;
  status: "completed" | "pending" | "failed";
  recurring: boolean;
  frequency?: string;
}

interface Props {
  customerId: string;
}

export function EnhancedGivingHistory({ customerId }: Props) {
  const currentUserChurch = useCurrentUserChurch();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ytd");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DonationRecord | null>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<any>(null);

  // Sample data - in real app this would come from API
  const { data: donations = [], isLoading: donationsLoading } = useQuery<DonationRecord[]>({
    queryKey: ["/donations/history", customerId, selectedPeriod],
    enabled: !!customerId && !!currentUserChurch?.person?.id,
    placeholderData: [
      {
        id: "1",
        amount: 125.0,
        fees: 3.93,
        fund: "General Fund",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        method: "Visa ****4242",
        status: "completed",
        recurring: false
      },
      {
        id: "2",
        amount: 300.0,
        fees: 9.2,
        fund: "Building Fund",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        method: "Bank ****7890",
        status: "completed",
        recurring: true,
        frequency: "Monthly"
      },
      {
        id: "3",
        amount: 75.0,
        fees: 2.48,
        fund: "Missions",
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        method: "Visa ****4242",
        status: "completed",
        recurring: false
      }
    ],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Simulate loading delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: "1",
          amount: 125.0,
          fees: 3.93,
          fund: "General Fund",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          method: "Visa ****4242",
          status: "completed" as const,
          recurring: false
        },
        {
          id: "2",
          amount: 300.0,
          fees: 9.2,
          fund: "Building Fund",
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          method: "Bank ****7890",
          status: "completed" as const,
          recurring: true,
          frequency: "Monthly"
        },
        {
          id: "3",
          amount: 75.0,
          fees: 2.48,
          fund: "Missions",
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          method: "Visa ****4242",
          status: "completed" as const,
          recurring: false
        }
      ];
    }
  });

  const { data: recurringDonations = [], isLoading: recurringLoading } = useQuery({
    queryKey: ["/donations/recurring", customerId],
    enabled: !!customerId && !!currentUserChurch?.person?.id,
    placeholderData: [
      {
        id: "r1",
        amount: 300.0,
        fund: "Building Fund",
        frequency: "Monthly",
        nextDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        method: "Bank ****7890",
        status: "active"
      },
      {
        id: "r2",
        amount: 50.0,
        fund: "General Fund",
        frequency: "Weekly",
        nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        method: "Visa ****4242",
        status: "active"
      }
    ],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      // Simulate loading delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        {
          id: "r1",
          amount: 300.0,
          fund: "Building Fund",
          frequency: "Monthly",
          nextDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          method: "Bank ****7890",
          status: "active"
        },
        {
          id: "r2",
          amount: 50.0,
          fund: "General Fund",
          frequency: "Weekly",
          nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          method: "Visa ****4242",
          status: "active"
        }
      ];
    }
  });

  const periods = [
    { label: "Year to Date", value: "ytd" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
    { label: "All Time", value: "all" }
  ];

  const filteredDonations = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "ytd":
        cutoffDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return donations;
    }

    return donations.filter(d => d.date >= cutoffDate);
  }, [donations, selectedPeriod]);

  const givingStats = useMemo(() => {
    const total = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const fees = filteredDonations.reduce((sum, d) => sum + d.fees, 0);
    const count = filteredDonations.length;
    const recurring = filteredDonations.filter(d => d.recurring).length;

    return { total, fees, count, recurring };
  }, [filteredDonations]);

  const getPeriodLabel = (value: string) => periods.find(p => p.value === value)?.label || "Year to Date";
  
  const handleManageRecurring = (item: any) => {
    setSelectedRecurring(item);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#70DC87";
      case "pending":
        return "#FEAA24";
      case "failed":
        return "#B0120C";
      default:
        return "#9E9E9E";
    }
  };

  const renderTransactionItem = ({ item }: { item: DonationRecord }) => (
    <TouchableOpacity onPress={() => setSelectedTransaction(item)} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <MaterialIcons name={item.recurring ? "repeat" : "favorite"} size={24} color="#0D47A1" />
      </View>

      <View style={styles.transactionDetails}>
        <Text variant="titleMedium" style={styles.transactionFund}>
          {item.fund}
        </Text>
        <Text variant="bodySmall" style={styles.transactionDate}>
          {item.date.toLocaleDateString()} • {item.method}
        </Text>
        {item.recurring && (
          <Chip mode="outlined" compact style={styles.recurringChip} textStyle={styles.recurringChipText}>
            {item.frequency}
          </Chip>
        )}
      </View>

      <View style={styles.transactionAmount}>
        <Text variant="titleMedium" style={styles.amountText}>
          {CurrencyHelper.formatCurrency(item.amount)}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
    </TouchableOpacity>
  );

  const renderRecurringItem = ({ item }: { item: any }) => (
    <Card style={styles.recurringCard}>
      <Card.Content style={styles.recurringContent}>
        <View style={styles.recurringIcon}>
          <MaterialIcons name="autorenew" size={24} color="#0D47A1" />
        </View>

        <View style={styles.recurringDetails}>
          <Text variant="titleMedium" style={styles.recurringFund}>
            {item.fund}
          </Text>
          <Text variant="bodyMedium" style={styles.recurringAmount}>
            {CurrencyHelper.formatCurrency(item.amount)} • {item.frequency}
          </Text>
          <Text variant="bodySmall" style={styles.recurringNext}>
            Next: {item.nextDate.toLocaleDateString()}
          </Text>
        </View>

        <Button mode="outlined" compact onPress={() => handleManageRecurring(item)} style={styles.manageButton}>
          Manage
        </Button>
      </Card.Content>
    </Card>
  );

  if (!currentUserChurch?.person?.id) {
    return (
      <Card style={styles.loginPromptCard}>
        <Card.Content style={styles.loginPromptContent}>
          <MaterialIcons name="login" size={48} color="#9E9E9E" style={styles.loginPromptIcon} />
          <Text variant="titleMedium" style={styles.loginPromptTitle}>
            Please login to view your giving history
          </Text>
          <Text variant="bodyMedium" style={styles.loginPromptSubtitle}>
            Access your donation records, recurring gifts, and giving statements.
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Giving Summary
            </Text>
            <Menu
              visible={showPeriodMenu}
              onDismiss={() => setShowPeriodMenu(false)}
              anchor={
                <TouchableOpacity style={styles.periodSelector} onPress={() => setShowPeriodMenu(true)}>
                  <Text variant="bodyMedium" style={styles.periodText}>
                    {getPeriodLabel(selectedPeriod)}
                  </Text>
                  <MaterialIcons name="expand-more" size={20} color="#9E9E9E" />
                </TouchableOpacity>
              }>
              {periods.map(period => (
                <Menu.Item
                  key={period.value}
                  onPress={() => {
                    setSelectedPeriod(period.value);
                    setShowPeriodMenu(false);
                  }}
                  title={period.label}
                />
              ))}
            </Menu>
          </View>

          {donationsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0D47A1" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading giving summary...
              </Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statValue}>
                  {CurrencyHelper.formatCurrency(givingStats.total)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Total Given
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.miniStat}>
                  <Text variant="titleLarge" style={styles.miniStatValue}>
                    {givingStats.count}
                  </Text>
                  <Text variant="bodySmall" style={styles.miniStatLabel}>
                    Gifts
                  </Text>
                </View>

                <View style={styles.miniStat}>
                  <Text variant="titleLarge" style={styles.miniStatValue}>
                    {givingStats.recurring}
                  </Text>
                  <Text variant="bodySmall" style={styles.miniStatLabel}>
                    Recurring
                  </Text>
                </View>

                <View style={styles.miniStat}>
                  <Text variant="titleLarge" style={styles.miniStatValue}>
                    {CurrencyHelper.formatCurrency(givingStats.fees)}
                  </Text>
                  <Text variant="bodySmall" style={styles.miniStatLabel}>
                    Fees Covered
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Recurring Donations */}
      {recurringLoading ? (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Active Recurring Gifts
          </Text>
          <Card style={styles.loadingCard}>
            <Card.Content style={styles.loadingCardContent}>
              <ActivityIndicator size="small" color="#0D47A1" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading recurring donations...
              </Text>
            </Card.Content>
          </Card>
        </View>
      ) : (
        recurringDonations.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Active Recurring Gifts
            </Text>
            <FlatList data={recurringDonations} renderItem={renderRecurringItem} keyExtractor={item => item.id} scrollEnabled={false} showsVerticalScrollIndicator={false} />
          </View>
        )
      )}

      {/* Transaction History */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Transactions
        </Text>
        <Card style={styles.transactionsCard}>
          {donationsLoading ? (
            <Card.Content style={styles.loadingCardContent}>
              <ActivityIndicator size="small" color="#0D47A1" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading transactions...
              </Text>
            </Card.Content>
          ) : (
            <FlatList data={filteredDonations} renderItem={renderTransactionItem} keyExtractor={item => item.id} scrollEnabled={false} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <Divider style={styles.divider} />} />
          )}
        </Card>
      </View>

      {/* Transaction Detail Modal */}
      <Modal visible={selectedTransaction !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedTransaction(null)}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalContent}>
            <Card style={styles.detailModal}>
              <Card.Content>
                <View style={styles.detailHeader}>
                  <Text variant="titleLarge" style={styles.detailTitle}>
                    Transaction Details
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                    <MaterialIcons name="close" size={24} color="#9E9E9E" />
                  </TouchableOpacity>
                </View>

                {selectedTransaction && (
                  <>
                    <View style={styles.detailAmount}>
                      <Text variant="displayMedium" style={styles.detailAmountText}>
                        {CurrencyHelper.formatCurrency(selectedTransaction.amount)}
                      </Text>
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedTransaction.status) }]} />
                        <Text variant="labelMedium" style={styles.statusText}>
                          {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailBreakdown}>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Gift Amount
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {CurrencyHelper.formatCurrency(selectedTransaction.amount - selectedTransaction.fees)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Processing Fee
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {CurrencyHelper.formatCurrency(selectedTransaction.fees)}
                        </Text>
                      </View>
                      <Divider style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <Text variant="titleMedium" style={styles.detailTotalLabel}>
                          Total
                        </Text>
                        <Text variant="titleMedium" style={styles.detailTotalValue}>
                          {CurrencyHelper.formatCurrency(selectedTransaction.amount)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailInfo}>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Fund
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedTransaction.fund}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Date
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedTransaction.date.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Method
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedTransaction.method}
                        </Text>
                      </View>
                      {selectedTransaction.recurring && (
                        <View style={styles.detailRow}>
                          <Text variant="bodyMedium" style={styles.detailLabel}>
                            Frequency
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {selectedTransaction.frequency}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </Modal>

      {/* Recurring Donation Management Modal */}
      <Modal visible={selectedRecurring !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedRecurring(null)}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalContent}>
            <Card style={styles.detailModal}>
              <Card.Content>
                <View style={styles.detailHeader}>
                  <Text variant="titleLarge" style={styles.detailTitle}>
                    Manage Recurring Donation
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedRecurring(null)}>
                    <MaterialIcons name="close" size={24} color="#9E9E9E" />
                  </TouchableOpacity>
                </View>

                {selectedRecurring && (
                  <>
                    <View style={styles.detailAmount}>
                      <Text variant="displayMedium" style={styles.detailAmountText}>
                        {CurrencyHelper.formatCurrency(selectedRecurring.amount)}
                      </Text>
                      <Text variant="titleMedium" style={styles.recurringFreqText}>
                        {selectedRecurring.frequency}
                      </Text>
                    </View>

                    <View style={styles.recurringInfo}>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Fund
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedRecurring.fund}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Next Payment
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedRecurring.nextDate?.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text variant="bodyMedium" style={styles.detailLabel}>
                          Payment Method
                        </Text>
                        <Text variant="bodyMedium" style={styles.detailValue}>
                          {selectedRecurring.method}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.managementActions}>
                      <Button 
                        mode="contained" 
                        onPress={() => {
                          Alert.alert(
                            "Stop Recurring Donation",
                            "Are you sure you want to stop this recurring donation? You can always set up a new recurring donation later.",
                            [
                              { text: "Keep Donation", style: "cancel" },
                              { 
                                text: "Stop Donation", 
                                style: "destructive",
                                onPress: () => {
                                  console.log("Stop recurring donation:", selectedRecurring.id);
                                  setSelectedRecurring(null);
                                }
                              }
                            ]
                          );
                        }} 
                        style={styles.stopButton}
                        buttonColor="#B0120C"
                        textColor="#FFFFFF"
                      >
                        Stop Recurring Donation
                      </Button>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16
  },

  // Summary Card
  summaryCard: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  summaryTitle: {
    color: "#3c3c3c",
    fontWeight: "700"
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F6F6F8",
    borderRadius: 20
  },
  periodText: {
    color: "#0D47A1",
    fontWeight: "600",
    marginRight: 4
  },
  statsGrid: {
    gap: 16
  },
  statItem: {
    alignItems: "center"
  },
  statValue: {
    color: "#0D47A1",
    fontWeight: "800",
    marginBottom: 4
  },
  statLabel: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  miniStat: {
    alignItems: "center",
    flex: 1
  },
  miniStatValue: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 2
  },
  miniStatLabel: {
    color: "#9E9E9E",
    textAlign: "center"
  },

  // Section
  section: {
    gap: 12
  },
  sectionTitle: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginLeft: 4
  },

  // Recurring Cards
  recurringCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 8
  },
  recurringContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4
  },
  recurringIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  recurringDetails: {
    flex: 1
  },
  recurringFund: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  recurringAmount: {
    color: "#0D47A1",
    fontWeight: "600",
    marginBottom: 2
  },
  recurringNext: {
    color: "#9E9E9E"
  },
  manageButton: {
    borderColor: "#0D47A1"
  },

  // Transactions
  transactionsCard: {
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden"
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  transactionDetails: {
    flex: 1
  },
  transactionFund: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 2
  },
  transactionDate: {
    color: "#9E9E9E",
    marginBottom: 4
  },
  recurringChip: {
    alignSelf: "flex-start",
    height: 24,
    borderColor: "#0D47A1"
  },
  recurringChipText: {
    fontSize: 10,
    color: "#0D47A1"
  },
  transactionAmount: {
    alignItems: "flex-end"
  },
  amountText: {
    color: "#3c3c3c",
    fontWeight: "700",
    marginBottom: 4
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  divider: {
    marginHorizontal: 16
  },

  // Detail Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  modalScrollView: {
    flex: 1
  },
  modalContent: {
    padding: 16,
    paddingTop: 50 // Safe area
  },
  detailModal: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: "#FFFFFF"
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  detailTitle: {
    color: "#3c3c3c",
    fontWeight: "700"
  },
  detailAmount: {
    alignItems: "center",
    marginBottom: 24
  },
  detailAmountText: {
    color: "#3c3c3c",
    fontWeight: "800",
    marginBottom: 8
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#F6F6F8",
    borderRadius: 12
  },
  statusText: {
    color: "#3c3c3c",
    marginLeft: 6
  },
  detailBreakdown: {
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "#F6F6F8",
    borderRadius: 12,
    paddingHorizontal: 16
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  detailLabel: {
    color: "#9E9E9E"
  },
  detailValue: {
    color: "#3c3c3c",
    fontWeight: "500"
  },
  detailDivider: {
    marginVertical: 8
  },
  detailTotalLabel: {
    color: "#3c3c3c",
    fontWeight: "700"
  },
  detailTotalValue: {
    color: "#0D47A1",
    fontWeight: "700"
  },
  detailInfo: {
    gap: 8
  },

  // Recurring Management
  recurringFreqText: {
    color: "#0D47A1",
    fontWeight: "600",
    textAlign: "center"
  },
  recurringInfo: {
    marginBottom: 24,
    gap: 8
  },
  managementActions: {
    marginTop: 16
  },
  stopButton: {
    borderRadius: 12,
    paddingVertical: 4
  },

  // Loading States
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12
  },
  loadingCard: {
    borderRadius: 16,
    elevation: 2
  },
  loadingCardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12
  },
  loadingText: {
    color: "#9E9E9E",
    textAlign: "center"
  },

  // Login Prompt
  loginPromptCard: {
    borderRadius: 16,
    elevation: 2
  },
  loginPromptContent: {
    alignItems: "center",
    padding: 32
  },
  loginPromptIcon: {
    marginBottom: 16
  },
  loginPromptTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  loginPromptSubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});
