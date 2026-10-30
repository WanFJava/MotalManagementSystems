import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from 'react-native';

import RentalRequestScreen from './screens/RentalRequestScreen';
import MyRentalRequestScreen from './screens/MyRentalRequestScreen';
import RequestManagementScreen from './screens/RequestManagementScreen';
import ContractListScreen from './screens/ContractListScreen';
import ContractDetailScreen from './screens/ContractDetailScreen';
import ManageContractScreen from './screens/ManageContractScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('RentalRequest');
  const [params, setParams] = useState({});

  const navigation = {
    navigate: (screenName, screenParams = {}) => {
      setParams(screenParams);
      setCurrentScreen(screenName);
    },
    goBack: () => {
      setCurrentScreen('ContractList');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
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
      default:
        return <RentalRequestScreen navigation={navigation} route={{ params }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Navigation Bar / Quick Switcher for Demo & Testing */}
      <View style={styles.topTabBar}>
        <ScrollViewHorizontal>
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
        </ScrollViewHorizontal>
      </View>

      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

function ScrollViewHorizontal({ children }) {
  return (
    <View style={styles.tabsRow}>
      {children}
    </View>
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
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  tabBtnActive: {
    backgroundColor: '#eff6ff'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: 'bold'
  },
  screenContainer: {
    flex: 1
  }
});

