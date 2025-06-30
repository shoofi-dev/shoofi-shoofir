import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import StatusBadge from "./StatusBadge";
import { colors } from "../../styles/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import themeStyle from "../../styles/theme.style";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  extras?: string[];
}

interface Order {
  _id: string;
  fullName: string;
  phone: string;
  storeName: string;
  status: string;
  created: string;
  pickupTime?: string;
  deliveryTime?: string;
  totalPrice: number;
  items: OrderItem[];
  notes?: string;
  order?: {
    order?: {
      address?: {
        name?: string;
        street?: string;
        streetNumber?: string;
        city?: string;
      };
    };
  };
}

interface OrderCardProps {
  order: Order;
  onAction: (order: Order, action: string) => void;
  showActions?: boolean;
}

const getAddressText = (address: any) => {
  if (!address) return "";
  const { name, street, streetNumber, city } = address;
  const rest = [street, street && streetNumber, city].filter(Boolean);
  if (name && rest.length > 0) {
    return `${name}: ${rest.join(", ")}`;
  } else if (name) {
    return name;
  } else {
    return rest.join(", ");
  }
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAction,
  showActions = true,
}) => {
  const navigation = useNavigation();

  const handleViewDetails = () => {
    navigation.navigate(
      "delivery-driver-order-details" as never,
      { orderId: order._id } as never
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "في الانتظار";
      case "2":
        return "تم التعيين";
      case "3":
        return "تم الاستلام";
      case "0":
        return "تم التسليم";
      case "-1":
        return "ملغي";
      default:
        return "غير معروف";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "1":
        return colors.orange;
      case "2":
        return colors.blue;
      case "3":
        return colors.purple;
      case "0":
        return colors.green;
      case "-1":
        return colors.red;
      default:
        return colors.gray;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("AR", {
      month: "short",
      day: "numeric",
    });
  };

  const openWaze = (lat: number, lng: number) => {
    if (lat && lng) {
      const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      Linking.openURL(url);
    }
  };

  const callPhone = () => {
    if (order.phone) {
      Linking.openURL(`tel:${order.phone}`);
    }
  };

  const getActionButtons = () => {
    if (!showActions) return null;

    switch (order.status) {
      case "2": // Assigned
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pickupButton]}
              onPress={() => onAction(order, "pickup")}
            >
              <Text style={styles.actionButtonText}>استلام</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onAction(order, "cancel")}
            >
              <Text style={styles.actionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        );
      case "3": // Picked Up
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deliverButton]}
              onPress={() => onAction(order, "deliver")}
            >
              <Text style={styles.actionButtonText}>تسليم</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
    
  };
  const getOrderId= () => {
    const orderIdSplit = order.order?.orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return `${idPart1}-${idPart2}`;
  }
  return (
    <TouchableOpacity style={styles.container} onPress={handleViewDetails}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>طلب #{getOrderId()}</Text>
          <Text style={styles.orderTime}>
            {formatDate(order.created)} الساعة {formatTime(order.created)}
          </Text>
        </View>
        <StatusBadge
          status={order.status}
          text={getStatusText(order.status)}
          color={getStatusColor(order.status)}
        />
      </View>

      {/* Customer Information Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>معلومات الزبون</Text>
        <View style={styles.customerInfo}>
          <View style={styles.customerInfoItem}>
            <Text style={styles.label}>الاسم:</Text>
            <Text style={styles.customerName}>{order.fullName}</Text>
          </View>
          <View style={styles.customerInfoItem}>
            <Text style={styles.label}>الهاتف:</Text>
            <Text style={styles.customerPhone}>{order.phone}</Text>
            <TouchableOpacity
              onPress={callPhone}
              style={styles.phoneIconButton}
            >
              <Icon name="phone" size={22} color={themeStyle.SUCCESS_COLOR} />
            </TouchableOpacity>
          </View>
          <View style={styles.customerInfoItem}>
            <Text style={styles.label}>العنوان:</Text>
            <Text style={styles.customerAddress} numberOfLines={2}>
              {getAddressText(order?.order?.order?.address)}
            </Text>
            <View>
              {order?.customerLocation?.latitude &&
                order?.customerLocation?.longitude && (
                  <TouchableOpacity
                    onPress={() => {
                      openWaze(
                        order?.customerLocation?.latitude,
                        order?.customerLocation?.longitude
                      );
                    }}
                    style={styles.wazeButton}
                  >
                    <Icon name="waze" size={28} color="#33CCFF" />
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      </View>

      {/* Store Information Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>معلومات المتجر</Text>
        <View style={styles.storeInfo}>
          <View style={styles.storeInfoHeader}>
            <View style={styles.storeInfoHeaderLeft}>
              <Text style={styles.label}>الاسم:</Text>
              <Text style={styles.storeName}>
                {order.order?.storeData?.name_ar}
              </Text>
              <View>
                {order.order?.storeData?.location && (
                  <TouchableOpacity
                    onPress={() => {
                      openWaze(
                        order?.order?.storeData?.location?.lat,
                        order?.order?.storeData?.location?.lng
                      );
                    }}
                    style={styles.wazeButton}
                  >
                    <Icon name="waze" size={28} color="#33CCFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.pickupTimeContainer}>
        {order.pickupTime && (
          <Text style={styles.pickupTime}>
            وقت الاستلام: {order.pickupTime}
          </Text>
        )}
      </View>

      <View style={styles.totalContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>المجموع:</Text>
          <Text style={styles.totalPrice}>₪{order.order?.total}</Text>
        </View>
      </View>

      {getActionButtons()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",

    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  orderInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
    textAlign: "left",
  },
  orderTime: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "left",
  },
  content: {
    padding: 16,
  },
  customerInfo: {},
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "left",
  },
  customerPhone: {
    fontSize: 14,
    color: colors.black,
    textAlign: "left",
  },
  customerAddress: {
    fontSize: 14,
    color: colors.black,

    textAlign: "left",
  },
  storeInfo: {
    alignItems: "flex-start",
  },
  storeName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  pickupTime: {
    fontSize: 16,
    color: themeStyle.SUCCESS_COLOR,
    fontWeight: "600",
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  itemText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: "italic",
  },
  notesContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: "italic",
  },
  totalContainer: {
    padding: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    justifyContent: "space-around",
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 10,
  },
  pickupButton: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  deliverButton: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  cancelButton: {
    backgroundColor: themeStyle.ERROR_COLOR,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "left",
    fontWeight: "bold",
    marginRight: 5,
  },
  customerInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  wazeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  storeInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pickupTimeContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  storeInfoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",

    width: "100%",
  },
  sectionCard: {
    backgroundColor: themeStyle.GRAY_10,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeStyle.SECONDARY_COLOR,
    marginBottom: 10,
    textAlign: "left",
  },
  phoneIconButton: {
    marginLeft: 8,
    padding: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default OrderCard;
