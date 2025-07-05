import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { StoreContext } from '../../stores';
import { axiosInstance } from '../../utils/http-interceptor';
import themeStyle from '../../styles/theme.style';
import Icon from '../../components/icon';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import DeliveryDriverHeader from '../../components/delivery-driver/DeliveryDriverHeader';

const { width } = Dimensions.get('window');

interface PaymentSummary {
  totalDeliveries: number;
  totalDeliveryFees: number;
  totalCommission: number;
  totalEarnings: number;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface DailyData {
  date: string;
  deliveries: number;
  fees: number;
  commission: number;
  earnings: number;
}

const DriverPaymentScreen = observer(() => {
  const { t } = useTranslation();
  const { userDetailsStore, deliveryDriverStore } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      fetchPaymentData();
    }
  }, [userDetailsStore.userDetails?.customerId, selectedPeriod]);

  const fetchPaymentData = async () => {
    if (!userDetailsStore.userDetails?.customerId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post('/payments/driver/summary', {
        driverId: userDetailsStore.userDetails.customerId,
        period: selectedPeriod,
      }, {
        headers: {
          'app-name': 'delivery-company',
        },
      });

      setSummary(response.summary);
      setDailyData(response.dailyData);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    
    return `₪0`;
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD/MM/YYYY');
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'day':
        return t('اليوم');
      case 'week':
        return t('الأسبوع');
      case 'month':
        return t('الشهر');
      default:
        return t('الشهر');
    }
  };

  const handleToggleActive = async (value: boolean) => {
    if (!userDetailsStore.userDetails?.customerId) return;
    try {
      await deliveryDriverStore.updateProfile(userDetailsStore.userDetails.customerId, {
        ...deliveryDriverStore.profile,
        isActive: value,
      });
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['day', 'week', 'month'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.selectedPeriodButtonText,
            ]}
          >
            {getPeriodText(period)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCards = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.cardGradient}
            >
              <Icon icon="delivery-active" size={24} style={styles.cardIcon} />
              <Text style={styles.cardValue}>{summary.totalDeliveries}</Text>
              <Text style={styles.cardLabel}>{t('إجمالي التوصيلات')}</Text>
            </LinearGradient>
          </View>

          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.cardGradient}
            >
              <Icon icon="money" size={24} style={styles.cardIcon} />
              <Text style={styles.cardValue}>{formatCurrency(summary.totalDeliveryFees)}</Text>
              <Text style={styles.cardLabel}>{t('إجمالي الرسوم')}</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.cardGradient}
            >
              <Icon icon="percent" size={24} style={styles.cardIcon} />
              <Text style={styles.cardValue}>{formatCurrency(summary.totalCommission)}</Text>
              <Text style={styles.cardLabel}>{t('العمولة')}</Text>
            </LinearGradient>
          </View>

          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.cardGradient}
            >
              <Icon icon="wallet" size={24} style={styles.cardIcon} />
              <Text style={styles.cardValue}>{formatCurrency(summary.totalEarnings)}</Text>
              <Text style={styles.cardLabel}>{t('أرباحك')}</Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  const renderDailyChart = () => {
    if (dailyData.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('الأرباح اليومية')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContent}>
            {dailyData.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(20, (day.earnings / Math.max(...dailyData.map(d => d.earnings))) * 100) },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{formatCurrency(day.earnings)}</Text>
                <Text style={styles.barDate}>{formatDate(day.date)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDailyTable = () => {
    if (dailyData.length === 0) return null;

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{t('تفاصيل الأرباح اليومية')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContent}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>{t('التاريخ')}</Text>
              <Text style={styles.tableHeaderCell}>{t('التوصيلات')}</Text>
              <Text style={styles.tableHeaderCell}>{t('الرسوم')}</Text>
              <Text style={styles.tableHeaderCell}>{t('العمولة')}</Text>
              <Text style={styles.tableHeaderCell}>{t('الأرباح')}</Text>
            </View>
            {dailyData.map((day, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{formatDate(day.date)}</Text>
                <Text style={styles.tableCell}>{day.deliveries}</Text>
                <Text style={styles.tableCell}>{formatCurrency(day.fees)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(day.commission)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(day.earnings)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <DeliveryDriverHeader 
          driverName={deliveryDriverStore.profile?.fullName || userDetailsStore.userDetails?.name || 'سائق'}
          totalOrders={deliveryDriverStore.totalOrders}
          activeOrders={deliveryDriverStore.activeOrdersCount}
          isActive={!!deliveryDriverStore.profile?.isActive}
          onToggleActive={handleToggleActive}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
          <Text style={styles.loadingText}>{t('جاري تحميل بيانات المدفوعات...')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DeliveryDriverHeader 
        driverName={deliveryDriverStore.profile?.fullName || userDetailsStore.userDetails?.name || 'سائق'}
        totalOrders={deliveryDriverStore.totalOrders}
        activeOrders={deliveryDriverStore.activeOrdersCount}
        isActive={!!deliveryDriverStore.profile?.isActive}
        onToggleActive={handleToggleActive}
      />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('لوحة المدفوعات')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('فترة')}: {getPeriodText(selectedPeriod)}
          </Text>
        </View>

        {renderPeriodSelector()}
        {renderSummaryCards()}
        {renderDailyChart()}
        {renderDailyTable()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('آخر تحديث')}: {moment().format('DD/MM/YYYY HH:mm')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: themeStyle.BACKGROUND_COLOR,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: themeStyle.WHITE_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_300,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: themeStyle.TEXT_SECONDARY_COLOR,
    textAlign: 'center',
    marginTop: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: themeStyle.WHITE_COLOR,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: themeStyle.GRAY_100,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  selectedPeriodButtonText: {
    color: themeStyle.WHITE_COLOR,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  cardIcon: {
    color: themeStyle.WHITE_COLOR,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.WHITE_COLOR,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: themeStyle.WHITE_COLOR,
    opacity: 0.9,
  },
  chartContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 60,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 30,
    backgroundColor: themeStyle.PRIMARY_COLOR,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 4,
  },
  barDate: {
    fontSize: 10,
    color: themeStyle.TEXT_SECONDARY_COLOR,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 16,
    textAlign: 'center',
  },
  tableContent: {
    minWidth: width - 64,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: themeStyle.GRAY_100,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_200,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: themeStyle.TEXT_SECONDARY_COLOR,
  },
});

export default DriverPaymentScreen; 