import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { StoreContext } from '../../stores';
import DeliveryDriverHeader from '../../components/delivery-driver/DeliveryDriverHeader';
import { colors } from '../../styles/colors';

const DeliveryDriverProfile = observer(() => {
  const navigation = useNavigation();
  const { deliveryDriverStore, userDetailsStore, authStore } = useContext(StoreContext);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    isActive: true,
    vehicleType: '',
    vehicleModel: '',
    plateNumber: '',
  });

  useEffect(() => {
    if (userDetailsStore.userDetails?.customerId) {
      deliveryDriverStore.getProfile(userDetailsStore.userDetails.customerId);
      // deliveryDriverStore.getEarnings(userDetailsStore.userDetails.customerId);
    }
  }, [userDetailsStore.userDetails?.customerId]);

  useEffect(() => {
    if (deliveryDriverStore.profile) {
      setFormData({
        fullName: deliveryDriverStore.profile.fullName || '',
        phone: deliveryDriverStore.profile.phone || '',
        email: deliveryDriverStore.profile.email || '',
        isActive: deliveryDriverStore.profile.isActive !== false,
        vehicleType: deliveryDriverStore.profile.vehicleInfo?.type || '',
        vehicleModel: deliveryDriverStore.profile.vehicleInfo?.model || '',
        plateNumber: deliveryDriverStore.profile.vehicleInfo?.plateNumber || '',
      });
    }
  }, [deliveryDriverStore.profile]);

  const updateProfile = async () => {
    if (!userDetailsStore.userDetails?.customerId) return;
    
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        isActive: formData.isActive,
        vehicleInfo: {
          type: formData.vehicleType,
          model: formData.vehicleModel,
          plateNumber: formData.plateNumber,
        },
      };

      await deliveryDriverStore.updateProfile(userDetailsStore.userDetails.customerId, updateData);
      setEditing(false);
      Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الملف الشخصي');
    }
  };

  const updateActiveStatus = async (value: boolean) => {
    console.log("xxx", value)
    if (!userDetailsStore.userDetails?.customerId) return;
    try {
      await deliveryDriverStore.updateProfile(userDetailsStore.userDetails.customerId, {
        ...deliveryDriverStore.profile,
        isActive: value,
      });
      setFormData((prev) => ({ ...prev, isActive: value }));
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الحالة');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: () => {
          // Handle logout logic here
          authStore.logOut();
          navigation.navigate('login' as never);
        }},
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (deliveryDriverStore.profileLoading) {
    return (
      <View style={styles.container}>
        <DeliveryDriverHeader 
          driverName="سائق"
          totalOrders={0}
          activeOrders={0}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحميل الملف الشخصي...</Text>
        </View>
      </View>
    );
  }

  if (!deliveryDriverStore.profile) {
    return (
      <View style={styles.container}>
        <DeliveryDriverHeader 
          driverName="سائق"
          totalOrders={0}
          activeOrders={0}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>الملف الشخصي غير موجود</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DeliveryDriverHeader 
        driverName={deliveryDriverStore.profile.fullName || 'سائق'}
        totalOrders={deliveryDriverStore.profile.totalDeliveries || 0}
        activeOrders={0}
        isActive={formData.isActive}
        onToggleActive={updateActiveStatus}
      />
      
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {deliveryDriverStore.profile.fullName?.charAt(0)?.toUpperCase() || 'س'}
            </Text>
          </View>
          <Text style={styles.driverName}>{deliveryDriverStore.profile.fullName}</Text>
          <Text style={styles.driverPhone}>{deliveryDriverStore.profile.phone}</Text>
          {deliveryDriverStore.profile.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>التقييم: {deliveryDriverStore.profile.rating.toFixed(1)} ⭐</Text>
            </View>
          )}
        </View>

        {/* Edit/View Mode Toggle */}
        <View style={styles.editToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, !editing && styles.activeToggle]}
            onPress={() => setEditing(false)}
          >
            <Text style={[styles.toggleText, !editing && styles.activeToggleText]}>عرض</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, editing && styles.activeToggle]}
            onPress={() => setEditing(true)}
          >
            <Text style={[styles.toggleText, editing && styles.activeToggleText]}>تعديل</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          <View style={styles.infoCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({...formData, fullName: text})}
                  placeholder="أدخل اسمك الكامل"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.fullName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="أدخل رقم هاتفك"
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.phone}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="أدخل بريدك الإلكتروني"
                  keyboardType="email-address"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.email || 'غير محدد'}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الحالة النشطة</Text>
              {editing ? (
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({...formData, isActive: value})}
                  trackColor={{ false: colors.lightGray, true: colors.primary }}
                  thumbColor={colors.white}
                />
              ) : (
                <Text style={[styles.value, { color: deliveryDriverStore.profile.isActive ? colors.green : colors.red }]}>
                  {deliveryDriverStore.profile.isActive ? 'نشط' : 'غير نشط'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المركبة</Text>
          <View style={styles.infoCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع المركبة</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.vehicleType}
                  onChangeText={(text) => setFormData({...formData, vehicleType: text})}
                  placeholder="مثال: سيارة، دراجة نارية، دراجة"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.vehicleInfo?.type || 'غير محدد'}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>موديل المركبة</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.vehicleModel}
                  onChangeText={(text) => setFormData({...formData, vehicleModel: text})}
                  placeholder="مثال: تويوتا كورولا"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.vehicleInfo?.model || 'غير محدد'}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم اللوحة</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.plateNumber}
                  onChangeText={(text) => setFormData({...formData, plateNumber: text})}
                  placeholder="أدخل رقم اللوحة"
                  autoCapitalize="characters"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.value}>{deliveryDriverStore.profile.vehicleInfo?.plateNumber || 'غير محدد'}</Text>
              )}
            </View>
          </View>
        </View> */}

        {/* Statistics */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{deliveryDriverStore.profile.totalDeliveries || 0}</Text>
              <Text style={styles.statLabel}>إجمالي التوصيلات</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>₪{deliveryDriverStore.profile.totalEarnings || 0}</Text>
              <Text style={styles.statLabel}>إجمالي الأرباح</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{deliveryDriverStore.profile.rating?.toFixed(1) || 'غير متوفر'}</Text>
              <Text style={styles.statLabel}>التقييم</Text>
            </View>
          </View>
        </View> */}

        {/* Company Information */}
        {deliveryDriverStore.profile.companyName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الشركة</Text>
            <View style={styles.infoCard}>
              <Text style={styles.label}>الشركة:</Text>
              <Text style={styles.value}>{deliveryDriverStore.profile.companyName}</Text>
              <Text style={styles.label}>عضو منذ:</Text>
              <Text style={styles.value}>{formatDate(deliveryDriverStore.profile.createdAt)}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {editing && (
          <View style={styles.section}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={updateProfile}
              >
                <Text style={styles.actionButtonText}>حفظ التغييرات</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  // Reset form data
                  if (deliveryDriverStore.profile) {
                    setFormData({
                      fullName: deliveryDriverStore.profile.fullName || '',
                      phone: deliveryDriverStore.profile.phone || '',
                      email: deliveryDriverStore.profile.email || '',
                      isActive: deliveryDriverStore.profile.isActive !== false,
                      vehicleType: deliveryDriverStore.profile.vehicleInfo?.type || '',
                      vehicleModel: deliveryDriverStore.profile.vehicleInfo?.model || '',
                      plateNumber: deliveryDriverStore.profile.vehicleInfo?.plateNumber || '',
                    });
                  }
                }}
              >
                <Text style={styles.actionButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: colors.red,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: colors.orange,
    fontWeight: '600',
  },
  editToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  activeToggleText: {
    color: colors.white,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'left',
  },
  infoCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
    textAlign: 'left',
  },
  value: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'left',

  },
  input: {
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.green,
  },
  cancelButton: {
    backgroundColor: colors.gray,
  },
  logoutButton: {
    backgroundColor: colors.red,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeliveryDriverProfile; 