import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView
} from 'react-native';

// Phân hệ 2: User Authentication & Tenant Management (Khánh)
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import TenantManagementScreen from './screens/TenantManagementScreen';
import StaffManagementScreen from './screens/StaffManagementScreen';

// Phân hệ 3: Rental Request & Contract Management (Đức)
import RentalRequestScreen from './screens/RentalRequestScreen';
import MyRentalRequestScreen from './screens/MyRentalRequestScreen';
import RequestManagementScreen from './screens/RequestManagementScreen';
import ContractListScreen from './screens/ContractListScreen';
import ContractDetailScreen from './screens/ContractDetailScreen';
import ManageContractScreen from './screens/ManageContractScreen';

// Phân hệ 4: Utility, Invoice & VNPay Payment (Mạnh)
import UtilityScreen from './screens/UtilityScreen';
import InvoiceListScreen from './screens/InvoiceListScreen';
import InvoiceDetailScreen from './screens/InvoiceDetailScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [params, setParams] = useState({});

  const navigation = {
    navigate: (screenName, screenParams = {}) => {
      setParams(screenParams);
      setCurrentScreen(screenName);
    },
    goBack: () => {
      setCurrentScreen('Login');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // User & Tenant Screens (Khánh)
      case 'Login':
        return <LoginScreen navigation={navigation} route={{ params }} />;
      case 'Register':
        return <RegisterScreen navigation={navigation} route={{ params }} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} route={{ params }} />;
      case 'TenantManagement':
        return <TenantManagementScreen navigation={navigation} route={{ params }} />;
      case 'StaffManagement':
        return <StaffManagementScreen navigation={navigation} route={{ params }} />;

      // Rental & Contract Screens (Đức)
      case 'RentalRequest':
        return <RentalRequestScreen navigation={navigation} route={{ params }} />;
      case 'MyRentalRequests':
        return <MyRentalRequestScreen navigation={navigation} route={{ params }} />;
      case 'RequestManagement':
        return <RequestManagementScreen navigation={navigation} route={{ params }} />;
      case 'ContractList':
        return <ContractListScreen navigation={navigation} route={{ params }} />;
      case 'ContractDetail':
        return <ContractDetailScreen navigation={navigation} route={{ params }} />;
      case 'ManageContract':
        return <ManageContractScreen navigation={navigation} route={{ params }} />;

      // Utility, Invoice & Payment Screens (Mạnh)
      case 'Utility':
        return <UtilityScreen navigation={navigation} route={{ params }} />;
      case 'InvoiceList':
        return <InvoiceListScreen navigation={navigation} route={{ params }} />;
      case 'InvoiceDetail':
        return <InvoiceDetailScreen navigation={navigation} route={{ params }} />;
      case 'Payment':
        return <PaymentScreen navigation={navigation} route={{ params }} />;
      case 'PaymentHistory':
        return <PaymentHistoryScreen navigation={navigation} route={{ params }} />;

      default:
        return <LoginScreen navigation={navigation} route={{ params }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Navigation Bar / Quick Switcher for Demo & Testing */}
      <View style={styles.topTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {/* Nhóm Xác thực & Khách thuê (Khánh) */}
          <TabButton
            title="🔑 Đăng nhập"
            active={currentScreen === 'Login'}
            onPress={() => setCurrentScreen('Login')}
          />
          <TabButton
            title="📝 Đăng ký"
            active={currentScreen === 'Register'}
            onPress={() => setCurrentScreen('Register')}
          />
          <TabButton
            title="👤 Hồ sơ"
            active={currentScreen === 'Profile'}
            onPress={() => setCurrentScreen('Profile')}
          />
          <TabButton
            title="👥 Khách thuê"
            active={currentScreen === 'TenantManagement'}
            onPress={() => setCurrentScreen('TenantManagement')}
          />
          <TabButton
            title="👔 Nhân viên"
            active={currentScreen === 'StaffManagement'}
            onPress={() => setCurrentScreen('StaffManagement')}
          />

          {/* Nhóm Thuê phòng & Hợp đồng (Đức) */}
          <TabButton
            title="🚪 Thuê phòng"
            active={currentScreen === 'RentalRequest'}
            onPress={() => setCurrentScreen('RentalRequest')}
          />
          <TabButton
            title="📋 YC của tôi"
            active={currentScreen === 'MyRentalRequests'}
            onPress={() => setCurrentScreen('MyRentalRequests')}
          />
          <TabButton
            title="✅ Duyệt YC"
            active={currentScreen === 'RequestManagement'}
            onPress={() => setCurrentScreen('RequestManagement')}
          />
          <TabButton
            title="📄 Hợp đồng"
            active={currentScreen === 'ContractList'}
            onPress={() => setCurrentScreen('ContractList')}
          />
          <TabButton
            title="✍️ Lập HĐ"
            active={currentScreen === 'ManageContract'}
            onPress={() => setCurrentScreen('ManageContract')}
          />

          {/* Nhóm Điện nước & Hóa đơn (Mạnh) */}
          <TabButton
            title="⚡ Điện Nước"
            active={currentScreen === 'Utility'}
            onPress={() => setCurrentScreen('Utility')}
          />
          <TabButton
            title="🧾 Hóa Đơn"
            active={currentScreen === 'InvoiceList'}
            onPress={() => setCurrentScreen('InvoiceList')}
          />
          <TabButton
            title="💳 Thanh Toán"
            active={currentScreen === 'Payment'}
            onPress={() => setCurrentScreen('Payment')}
          />
          <TabButton
            title="📜 Lịch Sử GD"
            active={currentScreen === 'PaymentHistory'}
            onPress={() => setCurrentScreen('PaymentHistory')}
          />
        </ScrollView>
      </View>

      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

function TabButton({ title, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  topTabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 6,
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  tabBtnActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
  },
});
