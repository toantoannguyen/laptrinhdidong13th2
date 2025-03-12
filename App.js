import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

// Dữ liệu ban đầu cho các ô thống kê
const initialStatsData = [
  {
    id: "1",
    title: "Scan new",
    value: "Scanned 433",
    color: "#E6F0FA",
    icon: "📷",
  },
  {
    id: "2",
    title: "Counterfeits",
    value: "Counterfeited 32",
    color: "#FFE6E6",
    icon: "⚠️",
  },
  {
    id: "3",
    title: "Success",
    value: "Checkouts 8",
    color: "#E6FAF0",
    icon: "✅",
  },
  {
    id: "4",
    title: "Directory",
    value: "History 20",
    color: "#F5F5F5",
    icon: "📅",
  },
];

// Màn hình Home
const HomeScreen = ({ navigation, statsData, setStatsData }) => {
  const renderStatItem = ({ item }) => (
    <View style={[styles.statBox, { backgroundColor: item.color }]}>
      <Text style={styles.statIcon}>{item.icon}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
      <Text style={styles.statValue}>{item.value}</Text>
    </View>
  );

  const handleMorePress = () => {
    Alert.alert("Thông báo", "Xem thêm thông tin");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Hello 👋<Text style={styles.headerSubText}> Christie Doe</Text>
        </Text>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/women/1.jpg" }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.sectionTitle}>YOUR INSIGHTS</Text>
      <FlatList
        data={statsData}
        renderItem={renderStatItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.statRow}
        contentContainerStyle={styles.statList}
      />
      <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
        <Text style={styles.moreButtonText}>MORE</Text>
      </TouchableOpacity>
    </View>
  );
};

// Màn hình Scan
const ScanScreen = ({ navigation, addToHistory, incrementScanCount }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedProduct, setScannedProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const onBarCodeScanned = ({ barcodeData }) => {
    if (!scannedProduct) {
      const productData = {
        id: Date.now().toString(), // Tạo ID duy nhất dựa trên thời gian
        name: "Orange Juice",
        brand: "Lauren's",
        image: "https://via.placeholder.com/150x300.png?text=JUICE",
        date: new Date().toLocaleString(), // Lưu ngày giờ quét
      };
      setScannedProduct(productData);
      incrementScanCount(); // Tăng giá trị "Scan new"
    }
  };

  const handleAddProduct = () => {
    if (scannedProduct) {
      addToHistory(scannedProduct); // Lưu sản phẩm vào lịch sử
      Alert.alert("Thông báo", "Đã thêm sản phẩm");
      setScannedProduct(null);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang yêu cầu quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Không có quyền truy cập camera!
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅️</Text>
      </TouchableOpacity>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128"],
        }}
        onBarcodeScanned={scannedProduct ? undefined : onBarCodeScanned}
      />
      <View style={styles.scanOverlay}>
        <View style={styles.scanCornerTopLeft} />
        <View style={styles.scanCornerTopRight} />
        <View style={styles.scanCornerBottomLeft} />
        <View style={styles.scanCornerBottomRight} />
      </View>
      {scannedProduct && (
        <>
          <Image
            source={{ uri: scannedProduct.image }}
            style={styles.productImage}
          />
          <View style={styles.productPopup}>
            <Image
              source={{ uri: scannedProduct.image }}
              style={styles.popupImage}
            />
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupName}>{scannedProduct.name}</Text>
              <Text style={styles.popupBrand}>{scannedProduct.brand}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// Màn hình History
const HistoryScreen = ({ history }) => {
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Image source={{ uri: item.image }} style={styles.historyImage} />
      <View style={styles.historyTextContainer}>
        <Text style={styles.historyName}>{item.name}</Text>
        <Text style={styles.historyBrand}>{item.brand}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>HISTORY</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>
          Chưa có sản phẩm nào trong lịch sử.
        </Text>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
        />
      )}
    </View>
  );
};

// Màn hình Placeholder cho các tab khác
const PlaceholderScreen = ({ name }) => (
  <View style={styles.container}>
    <Text style={styles.placeholderText}>{name} Screen</Text>
  </View>
);

// Cấu hình Stack Navigator
const Stack = createStackNavigator();
const HomeStack = ({ statsData, setStatsData }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home">
      {(props) => (
        <HomeScreen
          {...props}
          statsData={statsData}
          setStatsData={setStatsData}
        />
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

const ScanStack = ({ addToHistory, incrementScanCount }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Scan">
      {(props) => (
        <ScanScreen
          {...props}
          addToHistory={addToHistory}
          incrementScanCount={incrementScanCount}
        />
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

const HistoryStack = ({ history }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="History">
      {(props) => <HistoryScreen {...props} history={history} />}
    </Stack.Screen>
  </Stack.Navigator>
);

// Cấu hình Bottom Tabs Navigator
const Tab = createBottomTabNavigator();

const TabNavigator = ({
  statsData,
  setStatsData,
  history,
  addToHistory,
  incrementScanCount,
}) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "Notifications") {
          iconName = focused ? "notifications" : "notifications-outline";
        } else if (route.name === "Scan") {
          iconName = focused ? "scan" : "scan-outline";
        } else if (route.name === "History") {
          iconName = focused ? "time" : "time-outline";
        } else if (route.name === "Cart") {
          iconName = focused ? "cart" : "cart-outline";
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff",
      tabBarInactiveTintColor: "#666",
      tabBarStyle: {
        height: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "#f5f5f5",
        paddingBottom: 5,
        paddingTop: 5,
        elevation: 5,
      },
    })}
  >
    <Tab.Screen name="Home">
      {(props) => (
        <HomeStack
          {...props}
          statsData={statsData}
          setStatsData={setStatsData}
        />
      )}
    </Tab.Screen>
    <Tab.Screen
      name="Notifications"
      component={() => <PlaceholderScreen name="Notifications" />}
    />
    <Tab.Screen name="Scan">
      {(props) => (
        <ScanStack
          {...props}
          addToHistory={addToHistory}
          incrementScanCount={incrementScanCount}
        />
      )}
    </Tab.Screen>
    <Tab.Screen name="History">
      {(props) => <HistoryStack {...props} history={history} />}
    </Tab.Screen>
    <Tab.Screen
      name="Cart"
      component={() => <PlaceholderScreen name="Cart" />}
    />
  </Tab.Navigator>
);

// Ứng dụng chính
export default function App() {
  const [statsData, setStatsData] = useState(initialStatsData);
  const [history, setHistory] = useState([]);

  const addToHistory = (product) => {
    setHistory((prevHistory) => [product, ...prevHistory]); // Thêm sản phẩm vào đầu danh sách
  };

  const incrementScanCount = () => {
    setStatsData((prevStats) => {
      const newStats = [...prevStats];
      const scanNewIndex = newStats.findIndex(
        (item) => item.title === "Scan new"
      );
      if (scanNewIndex !== -1) {
        const currentCount =
          parseInt(newStats[scanNewIndex].value.replace("Scanned ", "")) || 0;
        newStats[scanNewIndex].value = `Scanned ${currentCount + 1}`;
      }
      return newStats;
    });
  };

  return (
    <NavigationContainer>
      <TabNavigator
        statsData={statsData}
        setStatsData={setStatsData}
        history={history}
        addToHistory={addToHistory}
        incrementScanCount={incrementScanCount}
      />
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  headerSubText: { fontSize: 20, fontWeight: "normal", color: "#000" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  statList: { paddingBottom: 15 },
  statRow: { justifyContent: "space-between", marginBottom: 10 },
  statBox: {
    flex: 1,
    height: 100,
    margin: 5,
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 5 },
  statTitle: { fontSize: 14, color: "#666", textAlign: "center" },
  statValue: { fontSize: 16, fontWeight: "bold", marginTop: 5, color: "#000" },
  moreButton: {
    backgroundColor: "#E6F0FA",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  moreButtonText: { fontSize: 16, color: "#007bff", fontWeight: "bold" },
  backButton: { position: "absolute", top: 40, left: 15, zIndex: 1 },
  backButtonText: { fontSize: 24, color: "#000" },
  camera: { flex: 1, width: "100%", height: "100%" },
  scanOverlay: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    bottom: "25%",
    borderWidth: 2,
    borderColor: "transparent",
  },
  scanCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },
  scanCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },
  scanCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },
  scanCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },
  productImage: {
    position: "absolute",
    top: "20%",
    alignSelf: "center",
    width: 150,
    height: 300,
  },
  productPopup: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  popupImage: { width: 50, height: 50, marginRight: 10 },
  popupTextContainer: { flex: 1 },
  popupName: { fontSize: 16, fontWeight: "bold" },
  popupBrand: { fontSize: 14, color: "#666" },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { fontSize: 20, color: "#fff" },
  permissionText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "red",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  placeholderText: { fontSize: 24, textAlign: "center", marginTop: 50 },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // Styles cho History
  historyList: { paddingBottom: 15 },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyImage: { width: 50, height: 50, marginRight: 10 },
  historyTextContainer: { flex: 1 },
  historyName: { fontSize: 16, fontWeight: "bold" },
  historyBrand: { fontSize: 14, color: "#666" },
  historyDate: { fontSize: 12, color: "#999", marginTop: 5 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
