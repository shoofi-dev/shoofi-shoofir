import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import themeStyle from '../../styles/theme.style';
import { StoreContext } from '../../stores';
import { useContext } from 'react';
import { userDetailsStore } from '../../stores/user-details';

interface DeliveryDriverHeaderProps {
  driverName: string;
  totalOrders: number;
  activeOrders: number;
  isActive: boolean;
  onToggleActive: (value: boolean) => void;
  hasUnreadNotifications?: boolean;
}

const DeliveryDriverHeader: React.FC<DeliveryDriverHeaderProps> = ({
  driverName,
  totalOrders,
  activeOrders,
  isActive,
  onToggleActive,
  hasUnreadNotifications = false,
}) => {
  const navigation = useNavigation();
  const { deliveryDriverStore } = useContext(StoreContext);

  useEffect(() => {
    deliveryDriverStore.getNotifications(userDetailsStore.userDetails?.customerId, 20, 0);
  }, [])
  const handleProfilePress = () => {
    navigation.navigate('delivery-driver-profile' as never);
  };

  const handleNotificationsPress = () => {
    navigation.navigate('delivery-driver-notifications' as never);
  };

  const handleDashboardPress = () => {
    navigation.navigate('delivery-driver-dashboard' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>مرحبا, {driverName}</Text>
          <Text style={styles.subtitle}>شوفر</Text>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {deliveryDriverStore.unreadNotificationsCount > 0 && (
              <View style={styles.redDot} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={handleDashboardPress}
          >
            <Text style={styles.dashboardIcon}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, {color: isActive ? themeStyle.SUCCESS_COLOR : themeStyle.ERROR_COLOR}]}>{isActive ? 'شغال' : 'غير شغال'}</Text>
        <Switch
          value={isActive}
          onValueChange={onToggleActive}
          trackColor={{ false: colors.lightGray, true: colors.green }}
          thumbColor={colors.white}
        />
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalOrders}</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeOrders}</Text>
          <Text style={styles.statLabel}>الطلبات النشطة</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationIcon: {
    fontSize: 18,
  },
  dashboardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dashboardIcon: {
    fontSize: 18,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
    width: 65,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 16,
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
    zIndex: 10,
  },
});

export default DeliveryDriverHeader; 