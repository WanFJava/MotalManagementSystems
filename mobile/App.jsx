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

// Màn hình Thành viên 3 (Đức)
import RentalRequestScreen from './screens/RentalRequestScreen';
import MyRentalRequestScreen from './screens/MyRentalRequestScreen';
import RequestManagementScreen from './screens/RequestManagementScreen';
import ContractListScreen from './screens/ContractListScreen';
import ContractDetailScreen from './screens/ContractDetailScreen';
import ManageContractScreen from './screens/ManageContractScreen';

// Màn hình Thành viên 4 (Mạnh)
import UtilityScreen from './screens/UtilityScreen';
import InvoiceListScreen from './screens/InvoiceListScreen';
import InvoiceDetailScreen from './screens/InvoiceDetailScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Utility');
  const [params, setParams] = useState({});

  const navigation = {
    navigate: (screenName, screenParams = {}) => {
      setParams(screenParams);
      setCurrentScreen(screenName);
    },
    goBack: () => {
      setCurrentScreen('InvoiceList');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // Phân hệ Hợp đồng & Yêu cầu thuê (Đức)
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

      // Phân hệ Điện nước, Hóa đơn & Thanh toán (Mạnh)
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
        return <UtilityScreen navigation={navigation} route={{ params }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Navigation Bar / Quick Switcher for Demo & Testing */}
      <View style={styles.topTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Tabs Mạnh */}
          <TabButton
            title="⚡ Điện Nước"
            active={currentScreen === 'Utility'}
            onPress={() => setCurrentScreen('Utility')}
          />
          <TabButton
            title="🧾 DS Hóa Đơn"
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

          {/* Tabs Đức */}
          <TabButton
            title="Thuê phòng"
            active={currentScreen === 'RentalRequest'}
            onPress={() => setCurrentScreen('RentalRequest')}
          />
          <TabButton
            title="YC của tôi"
            active={currentScreen === 'MyRentalRequests'}
            onPress={() => setCurrentScreen('MyRentalRequests')}
          />
          <TabButton
            title="Duyệt YC"
            active={currentScreen === 'RequestManagement'}
            onPress={() => setCurrentScreen('RequestManagement')}
          />
          <TabButton
            title="DS Hợp đồng"
            active={currentScreen === 'ContractList'}
            onPress={() => setCurrentScreen('ContractList')}
          />
          <TabButton
            title="Lập HĐ"
            active={currentScreen === 'ManageContract'}
            onPress={() => setCurrentScreen('ManageContract')}
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  topTabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#f1f5f9'
  },
  tabBtnActive: {
    backgroundColor: '#2563eb'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  screenContainer: {
    flex: 1
  }
});
