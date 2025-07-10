import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Card, Text, Button, Chip, Menu, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
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

  // Sample data - in real app this would come from API
  const { data: donations = [] } = useQuery<DonationRecord[]>({
    queryKey: ["/donations/history", customerId],
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
    staleTime: 5 * 60 * 1000
  });

  const { data: recurringDonations = [] } = useQuery({
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
    staleTime: 10 * 60 * 1000
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
        <MaterialIcons name={item.recurring ? "repeat" : "favorite"} size={24} color="#1565C0" />
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
          <MaterialIcons name="autorenew" size={24} color="#1565C0" />
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

        <Button mode="outlined" compact onPress={() => {}} style={styles.manageButton}>
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
        </Card.Content>
      </Card>

      {/* Recurring Donations */}
      {recurringDonations.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Active Recurring Gifts
          </Text>
          <FlatList data={recurringDonations} renderItem={renderRecurringItem} keyExtractor={item => item.id} scrollEnabled={false} showsVerticalScrollIndicator={false} />
        </View>
      )}

      {/* Transaction History */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Transactions
        </Text>
        <Card style={styles.transactionsCard}>
          <FlatList data={filteredDonations} renderItem={renderTransactionItem} keyExtractor={item => item.id} scrollEnabled={false} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <Divider style={styles.divider} />} />
        </Card>
      </View>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
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
          </Card.Content>
        </Card>
      )}
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
    shadowColor: "#1565C0",
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
    color: "#1565C0",
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
    color: "#1565C0",
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
    color: "#1565C0",
    fontWeight: "600",
    marginBottom: 2
  },
  recurringNext: {
    color: "#9E9E9E"
  },
  manageButton: {
    borderColor: "#1565C0"
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
    borderColor: "#1565C0"
  },
  recurringChipText: {
    fontSize: 10,
    color: "#1565C0"
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
  detailModal: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
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
    color: "#1565C0",
    fontWeight: "700"
  },
  detailInfo: {
    gap: 8
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
