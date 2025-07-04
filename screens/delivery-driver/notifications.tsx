import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { StoreContext } from '../../stores';
import DeliveryDriverHeader from '../../components/delivery-driver/DeliveryDriverHeader';
import { colors } from '../../styles/colors';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  data?: {
    orderId?: string;
    bookId?: string;
  };
}

const DeliveryDriverNotifications = observer(() => {
  const navigation = useNavigation();
  const { deliveryDriverStore, userDetailsStore } = useContext(StoreContext);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const handleToggleActive = async (value: boolean) => {
    console.log("xxx2", value)
    if (!userDetailsStore.userDetails?.customerId) return;
    try {
      await deliveryDriverStore.updateProfile(userDetailsStore.userDetails.customerId, {
        ...deliveryDriverStore.profile,
        isActive: value,
      });
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الحالة');
    }
  };
  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      loadNotifications();
    }
  }, [userDetailsStore.userDetails?.customerId]);

  const loadNotifications = async (isRefresh = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const currentOffset = isRefresh ? 0 : offset;
      
      const response = await deliveryDriverStore.getNotifications(userDetailsStore.userDetails?.customerId, limit, currentOffset);
      
      if (response && response) {
        if (isRefresh) {
          setNotifications(response);
          setOffset(limit);
        } else {
          setNotifications(prev => [...prev, ...response]);
          setOffset(prev => prev + limit);
        }
        setHasMore(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(true);
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      // Find the notification object
      const notif = notifications.find(n => n._id === notificationId);
      if (notif && notif.type === 'order') {
        // Extract orderId and bookId from notification data
        const orderId = notif.data?.orderId;
        const bookId = notif.data?.bookId;
        
        if (orderId && bookId && userDetailsStore.userDetails?.customerId) {
          Alert.alert(
            'إجراء الطلب',
            'هل تريد الموافقة على هذا الطلب أو إلغاؤه؟',
            [
              // {
              //   text: 'إلغاء',
              //   style: 'destructive',
              //   onPress: async () => {
              //     try {
              //       await deliveryDriverStore.cancelOrder(orderId, userDetailsStore.userDetails.customerId, bookId);
              //       Alert.alert('تم إلغاء الطلب');
              //     } catch (e) {
              //       Alert.alert('خطأ', 'فشل في إلغاء الطلب');
              //     }
              //   },
              // },
              {
                text: 'موافقة',
                style: 'default',
                onPress: async () => {
                  try {
                    await deliveryDriverStore.approveOrder(orderId, userDetailsStore.userDetails.customerId, bookId);
                    await deliveryDriverStore.markNotificationRead(notificationId);
                    await loadNotifications(true);
                    Alert.alert('تمت الموافقة على الطلب');
                  } catch (e) {
                    Alert.alert('خطأ', 'فشل في الموافقة على الطلب');
                  }
                },
              },
              { text: 'إغلاق', style: 'cancel' },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      case 'alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return colors.blue;
      case 'payment':
        return colors.green;
      case 'system':
        return colors.gray;
      case 'alert':
        return colors.orange;
      default:
        return colors.primary;
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification._id}
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => markAsRead(notification._id)}
    >
      <View style={styles.notificationHeader}>
   
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>
            {formatDate(notification.createdAt)}
          </Text>
        </View>
        {!notification.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(notification.type) }]} />
        )}
             <Text style={styles.notificationIcon}>
          {getNotificationIcon(notification.type)}
        </Text>
      </View>
      <Text style={styles.notificationMessage}>{notification.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <DeliveryDriverHeader 
        driverName={deliveryDriverStore.profile?.fullName || userDetailsStore.userDetails?.name || 'السائق'}
        totalOrders={deliveryDriverStore.totalOrders}
        activeOrders={deliveryDriverStore.activeOrdersCount}
        isActive={!!deliveryDriverStore.profile?.isActive}
        onToggleActive={handleToggleActive}
        hasUnreadNotifications={deliveryDriverStore.unreadNotificationsCount > 0}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {/* <TouchableOpacity
          style={styles.markAllReadButton}
          onPress={() => {
            // Mark all notifications as read
            notifications.forEach(notification => {
              if (!notification.isRead) {
                markAsRead(notification._id);
              }
            });
          }}
        >
          <Text style={styles.markAllReadText}>تحديد الكل كمقروء</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView
        style={styles.notificationsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom && hasMore && !loading) {
            loadNotifications();
          }
        }}
        scrollEventThrottle={400}
      >
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
            <Text style={styles.emptyMessage}>
              أنت محدث! ستظهر الإشعارات الجديدة هنا.
            </Text>
          </View>
        )}
        
        {loading && notifications.length > 0 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل المزيد من الإشعارات...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  markAllReadText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationCard: {
    backgroundColor: colors.white,
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.lightGray,
    left:10,
    right:10,
  },
  unreadNotification: {
    borderLeftColor: colors.primary,
    backgroundColor: colors.white,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    textAlign: 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
  },
});

export default DeliveryDriverNotifications; 