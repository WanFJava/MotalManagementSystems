import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';

// Phân hệ 1: Room Management & Search (Quang)
import HomeScreen from './screens/HomeScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import ManageRoomScreen from './screens/ManageRoomScreen';
import MyRoomScreen from './screens/MyRoomScreen';

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

import { authApi, setAuthToken, setCurrentUserStore, getCurrentUserStore } from './services/api';

const SCREEN_TITLES = {
  Home: { title: 'Trang Chủ', icon: '🏠' },
  RoomList: { title: 'Danh Sách Phòng', icon: '🛏️' },
  RoomDetail: { title: 'Chi Tiết Phòng', icon: '🔍' },
  RoomSearch: { title: 'Tìm Kiếm Phòng', icon: '🔎' },
  ManageRoom: { title: 'Quản Lý Phòng', icon: '⚙️' },
  MyRoom: { title: 'Phòng Đang Thuê', icon: '🔑' },
  Login: { title: 'Đăng Nhập', icon: '🔑' },
  Register: { title: 'Đăng Ký', icon: '📝' },
  Profile: { title: 'Hồ Sơ Cá Nhân', icon: '👤' },
  TenantManagement: { title: 'Quản Lý Khách Thuê', icon: '👥' },
  StaffManagement: { title: 'Quản Lý Nhân Viên', icon: '🛡️' },
  RentalRequest: { title: 'Đặt Thuê Phòng', icon: '🚪' },
  MyRentalRequests: { title: 'Yêu Cầu Của Tôi', icon: '📋' },
  RequestManagement: { title: 'Duyệt Yêu Cầu Thuê', icon: '✅' },
  ContractList: { title: 'Hợp Đồng Thuê', icon: '📄' },
  ContractDetail: { title: 'Chi Tiết Hợp Đồng', icon: '📑' },
  ManageContract: { title: 'Lập Hợp Đồng Mới', icon: '✍️' },
  Utility: { title: 'Chốt Điện Nước', icon: '⚡' },
  InvoiceList: { title: 'Hóa Đơn & VNPay', icon: '🧾' },
  InvoiceDetail: { title: 'Chi Tiết Hóa Đơn', icon: '💵' },
  Payment: { title: 'Cổng Thanh Toán VNPay', icon: '💳' },
  PaymentHistory: { title: 'Lịch Sử Giao Dịch', icon: '📜' },
};

/**
 * Thẻ Route Guard trên Mobile - hiển thị khi chưa đăng nhập hoặc không đủ thẩm quyền
 * Tương thích chuẩn 100% với Web (AccessDeniedCard)
 */
function AccessDeniedView({ icon, title, message, onAction, actionText }) {
  return (
    <View style={styles.accessDeniedWrap}>
      <View style={styles.accessDeniedCard}>
        <Text style={styles.accessDeniedIcon}>{icon}</Text>
        <Text style={styles.accessDeniedTitle}>{title}</Text>
        <Text style={styles.accessDeniedMessage}>{message}</Text>
        <TouchableOpacity style={styles.accessDeniedBtn} onPress={onAction}>
          <Text style={styles.accessDeniedBtnText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [params, setParams] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUserStore());

  useEffect(() => {
    fetchProfile();
  }, [currentScreen]);

  const fetchProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.data?.data) {
        setCurrentUser(res.data.data);
        setCurrentUserStore(res.data.data);
      } else {
        setCurrentUser(null);
        setCurrentUserStore(null);
      }
    } catch (e) {
      // not logged in
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có muốn đăng xuất tài khoản hiện tại không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setAuthToken(null);
            setCurrentUser(null);
            setCurrentUserStore(null);
            setDrawerOpen(false);
            setCurrentScreen('Home');
          }
        }
      ]
    );
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setCurrentUserStore(user);
    setAuthToken(token);
    setCurrentScreen('Home');
  };

  const navigation = {
    navigate: (screenName, screenParams = {}) => {
      setParams(screenParams);
      setCurrentScreen(screenName);
      setDrawerOpen(false);
    },
    goBack: () => {
      setCurrentScreen('Home');
    }
  };

  const navTo = (name) => {
    navigation.navigate(name);
  };

  // ========================================================
  // ROUTE GUARD & RENDER MÀN HÌNH THEO PHÂN QUYỀN
  // ========================================================
  const renderScreen = () => {
    // 1. CÁC MÀN HÌNH CÔNG KHAI (Mọi đối tượng đều xem được)
    if (currentScreen === 'Home') {
      return (
        <HomeScreen
          navigation={navigation}
          route={{ params }}
          currentUser={currentUser}
          onOpenMenu={() => setDrawerOpen(true)}
        />
      );
    }
    if (currentScreen === 'RoomList') {
      return <RoomListScreen navigation={navigation} route={{ params }} />;
    }
    if (currentScreen === 'RoomDetail') {
      return <RoomDetailScreen navigation={navigation} route={{ params }} />;
    }
    if (currentScreen === 'RoomSearch') {
      return <RoomSearchScreen navigation={navigation} route={{ params }} />;
    }
    if (currentScreen === 'Login') {
      return (
        <LoginScreen
          navigation={navigation}
          route={{ params }}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }
    if (currentScreen === 'Register') {
      return <RegisterScreen navigation={navigation} route={{ params }} />;
    }

    // 2. ROUTE GUARD: KIỂM TRA ĐĂNG NHẬP
    if (!currentUser) {
      return (
        <AccessDeniedView
          icon="🔒"
          title="Yêu Cầu Đăng Nhập"
          message="Bạn cần đăng nhập tài khoản để truy cập tính năng này. Hãy đăng nhập bằng số điện thoại hoặc email đã đăng ký."
          actionText="🔑 Đến Trang Đăng Nhập"
          onAction={() => navTo('Login')}
        />
      );
    }

    // 3. ROUTE GUARD: CHỨC NĂNG CỦA RIÊNG KHÁCH THUÊ
    if (currentScreen === 'MyRoom') {
      if (currentUser.role !== 'TENANT') {
        return (
          <AccessDeniedView
            icon="ℹ️"
            title="Dành Cho Khách Thuê"
            message="Mục này chỉ hiển thị phòng thuê dành cho tài khoản Khách thuê (Tenant). Tài khoản Quản lý/Nhân viên vui lòng vào mục 'Quản lý phòng'."
            actionText="⚙️ Đến Quản Lý Phòng"
            onAction={() => navTo('ManageRoom')}
          />
        );
      }
      return <MyRoomScreen navigation={navigation} route={{ params }} currentUser={currentUser} />;
    }

    if (currentScreen === 'MyRentalRequests') {
      return <MyRentalRequestScreen navigation={navigation} route={{ params }} />;
    }

    if (currentScreen === 'RentalRequest') {
      return <RentalRequestScreen navigation={navigation} route={{ params }} />;
    }

    if (currentScreen === 'Payment') {
      return <PaymentScreen navigation={navigation} route={{ params }} />;
    }

    if (currentScreen === 'PaymentHistory') {
      return <PaymentHistoryScreen navigation={navigation} route={{ params }} />;
    }

    // 4. ROUTE GUARD: CHỨC NĂNG DÀNH CHO NHÂN VIÊN & QUẢN LÝ (STAFF / MANAGER)
    const isStaffOrManager = currentUser.role === 'STAFF' || currentUser.role === 'MANAGER';

    if (
      currentScreen === 'ManageRoom' ||
      currentScreen === 'RequestManagement' ||
      currentScreen === 'ManageContract' ||
      currentScreen === 'Utility' ||
      currentScreen === 'TenantManagement'
    ) {
      if (!isStaffOrManager) {
        return (
          <AccessDeniedView
            icon="⛔"
            title="Từ Chối Truy Cập"
            message="Chức năng quản trị và vận hành này chỉ dành cho Nhân viên hoặc Quản trị viên (Chủ trọ)."
            actionText="🏠 Quay Về Trang Chủ"
            onAction={() => navTo('Home')}
          />
        );
      }

      switch (currentScreen) {
        case 'ManageRoom':
          return <ManageRoomScreen navigation={navigation} route={{ params }} />;
        case 'RequestManagement':
          return <RequestManagementScreen navigation={navigation} route={{ params }} />;
        case 'ManageContract':
          return <ManageContractScreen navigation={navigation} route={{ params }} />;
        case 'Utility':
          return <UtilityScreen navigation={navigation} route={{ params }} />;
        case 'TenantManagement':
          return <TenantManagementScreen navigation={navigation} route={{ params }} />;
      }
    }

    // 5. ROUTE GUARD: CHỨC NĂNG ĐỘC QUYỀN CHỦ TRỌ (MANAGER ONLY)
    if (currentScreen === 'StaffManagement') {
      if (currentUser.role !== 'MANAGER') {
        return (
          <AccessDeniedView
            icon="🛡️"
            title="Quyền Hạn Cấp Cao"
            message="Chức năng Quản lý nhân sự (UC15) chỉ dành riêng cho Chủ trọ / Quản lý cấp cao."
            actionText="🏠 Quay Về Trang Chủ"
            onAction={() => navTo('Home')}
          />
        );
      }
      return <StaffManagementScreen navigation={navigation} route={{ params }} />;
    }

    // 6. CÁC MÀN HÌNH CHUNG DÀNH CHO USER ĐÃ ĐĂNG NHẬP
    if (currentScreen === 'ContractList') {
      return <ContractListScreen navigation={navigation} route={{ params }} currentUser={currentUser} />;
    }
    if (currentScreen === 'ContractDetail') {
      return <ContractDetailScreen navigation={navigation} route={{ params }} currentUser={currentUser} />;
    }
    if (currentScreen === 'InvoiceList') {
      return <InvoiceListScreen navigation={navigation} route={{ params }} currentUser={currentUser} />;
    }
    if (currentScreen === 'InvoiceDetail') {
      return <InvoiceDetailScreen navigation={navigation} route={{ params }} currentUser={currentUser} />;
    }
    if (currentScreen === 'Profile') {
      return (
        <ProfileScreen
          navigation={navigation}
          route={{ params: { ...params, currentUser, onLogout: handleLogout } }}
        />
      );
    }

    return (
      <HomeScreen
        navigation={navigation}
        route={{ params }}
        currentUser={currentUser}
        onOpenMenu={() => setDrawerOpen(true)}
      />
    );
  };

  const screenInfo = SCREEN_TITLES[currentScreen] || { title: 'Motel Manager', icon: '🏠' };

  // ========================================================
  // RENDER BOTTOM NAVIGATION BAR THEO VAI TRÒ
  // ========================================================
  const renderBottomNav = () => {
    // 1. Khách vãng lai (Guest)
    if (!currentUser) {
      return (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Home')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'Home' && styles.bottomNavIconActive]}>🏠</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'Home' && styles.bottomNavTextActive]}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('RoomList')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'RoomList' && styles.bottomNavIconActive]}>🛏️</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'RoomList' && styles.bottomNavTextActive]}>Phòng trọ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('RoomSearch')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'RoomSearch' && styles.bottomNavIconActive]}>🔍</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'RoomSearch' && styles.bottomNavTextActive]}>Tìm phòng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Login')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'Login' && styles.bottomNavIconActive]}>🔑</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'Login' && styles.bottomNavTextActive]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 2. Khách thuê (Tenant)
    if (currentUser.role === 'TENANT') {
      return (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Home')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'Home' && styles.bottomNavIconActive]}>🏠</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'Home' && styles.bottomNavTextActive]}>Trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('MyRoom')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'MyRoom' && styles.bottomNavIconActive]}>🔑</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'MyRoom' && styles.bottomNavTextActive]}>Phòng của tôi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('InvoiceList')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'InvoiceList' && styles.bottomNavIconActive]}>🧾</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'InvoiceList' && styles.bottomNavTextActive]}>Hóa đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('ContractList')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'ContractList' && styles.bottomNavIconActive]}>📄</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'ContractList' && styles.bottomNavTextActive]}>Hợp đồng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Profile')}>
            <Text style={[styles.bottomNavIcon, currentScreen === 'Profile' && styles.bottomNavIconActive]}>👤</Text>
            <Text style={[styles.bottomNavText, currentScreen === 'Profile' && styles.bottomNavTextActive]}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 3. Nhân viên / Quản lý (Staff / Manager)
    return (
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Home')}>
          <Text style={[styles.bottomNavIcon, currentScreen === 'Home' && styles.bottomNavIconActive]}>🏠</Text>
          <Text style={[styles.bottomNavText, currentScreen === 'Home' && styles.bottomNavTextActive]}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('ManageRoom')}>
          <Text style={[styles.bottomNavIcon, currentScreen === 'ManageRoom' && styles.bottomNavIconActive]}>⚙️</Text>
          <Text style={[styles.bottomNavText, currentScreen === 'ManageRoom' && styles.bottomNavTextActive]}>QL Phòng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('RequestManagement')}>
          <Text style={[styles.bottomNavIcon, currentScreen === 'RequestManagement' && styles.bottomNavIconActive]}>📋</Text>
          <Text style={[styles.bottomNavText, currentScreen === 'RequestManagement' && styles.bottomNavTextActive]}>Yêu cầu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('Utility')}>
          <Text style={[styles.bottomNavIcon, currentScreen === 'Utility' && styles.bottomNavIconActive]}>⚡</Text>
          <Text style={[styles.bottomNavText, currentScreen === 'Utility' && styles.bottomNavTextActive]}>Điện nước</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navTo('InvoiceList')}>
          <Text style={[styles.bottomNavIcon, currentScreen === 'InvoiceList' && styles.bottomNavIconActive]}>🧾</Text>
          <Text style={[styles.bottomNavText, currentScreen === 'InvoiceList' && styles.bottomNavTextActive]}>Hóa đơn</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* TOP HEADER BAR CÓ NÚT MENU ☰ */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerIcon}>{screenInfo.icon}</Text>
          <Text style={styles.headerTitle}>{screenInfo.title}</Text>
        </View>

        {currentUser ? (
          <TouchableOpacity
            style={styles.headerUserPill}
            onPress={() => navTo('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.headerUserText}>
              {currentUser.fullName ? currentUser.fullName.split(' ').pop() : 'User'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerLoginBtn}
            onPress={() => navTo('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.headerLoginText}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MÀN HÌNH NỘI DUNG CHÍNH */}
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>

      {/* BOTTOM NAVIGATION BAR */}
      {renderBottomNav()}

      {/* ======================================================== */}
      {/* SIDEBAR TRƯỢT BÊN TRÁI ĐỒNG BỘ 100% VỚI WEB NAVBAR       */}
      {/* ======================================================== */}
      <Modal
        visible={drawerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableWithoutFeedback onPress={() => setDrawerOpen(false)}>
            <View style={styles.drawerBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer}>
            {/* Brand Logo Sidebar */}
            <TouchableOpacity style={styles.drawerBrand} onPress={() => navTo('Home')}>
              <View style={styles.drawerLogoBox}>
                <Text style={styles.drawerLogoIcon}>🏠</Text>
              </View>
              <View>
                <Text style={styles.drawerBrandTitle}>Motel Manager</Text>
                <Text style={styles.drawerBrandSub}>Hệ thống Quản lý Nhà trọ</Text>
              </View>
            </TouchableOpacity>

            {/* Menu List Groups theo vai trò đăng nhập */}
            <ScrollView style={styles.drawerScroll}>
              {/* 1. NẾU CHƯA ĐĂNG NHẬP (GUEST) */}
              {!currentUser && (
                <>
                  <Text style={styles.drawerSectionTitle}>KHÁM PHÁ</Text>
                  <DrawerItem icon="🏠" label="Trang chủ" active={currentScreen === 'Home'} onPress={() => navTo('Home')} />
                  <DrawerItem icon="🛏️" label="Phòng trọ" active={currentScreen === 'RoomList'} onPress={() => navTo('RoomList')} />
                  <DrawerItem icon="🔍" label="Tìm phòng trống" active={currentScreen === 'RoomSearch'} onPress={() => navTo('RoomSearch')} />

                  <Text style={styles.drawerSectionTitle}>TÀI KHOẢN</Text>
                  <DrawerItem icon="🔑" label="Đăng nhập" active={currentScreen === 'Login'} onPress={() => navTo('Login')} />
                  <DrawerItem icon="📝" label="Đăng ký tài khoản" active={currentScreen === 'Register'} onPress={() => navTo('Register')} />
                </>
              )}

              {/* 2. NẾU LÀ KHÁCH THUÊ (TENANT) */}
              {currentUser && currentUser.role === 'TENANT' && (
                <>
                  <Text style={styles.drawerSectionTitle}>TỔNG QUAN</Text>
                  <DrawerItem icon="🏠" label="Trang chủ" active={currentScreen === 'Home'} onPress={() => navTo('Home')} />
                  <DrawerItem icon="🔑" label="Phòng đang thuê" active={currentScreen === 'MyRoom'} onPress={() => navTo('MyRoom')} />

                  <Text style={styles.drawerSectionTitle}>THUÊ PHÒNG</Text>
                  <DrawerItem icon="🧾" label="Hóa đơn & VNPay" active={currentScreen === 'InvoiceList'} onPress={() => navTo('InvoiceList')} />
                  <DrawerItem icon="📄" label="Hợp đồng của tôi" active={currentScreen === 'ContractList'} onPress={() => navTo('ContractList')} />
                  <DrawerItem icon="📋" label="Yêu cầu của tôi" active={currentScreen === 'MyRentalRequests'} onPress={() => navTo('MyRentalRequests')} />
                  <DrawerItem icon="🛏️" label="Danh sách phòng" active={currentScreen === 'RoomList'} onPress={() => navTo('RoomList')} />
                  <DrawerItem icon="🔍" label="Tìm kiếm phòng" active={currentScreen === 'RoomSearch'} onPress={() => navTo('RoomSearch')} />

                  <Text style={styles.drawerSectionTitle}>TÀI KHOẢN</Text>
                  <DrawerItem icon="👤" label="Hồ sơ của tôi" active={currentScreen === 'Profile'} onPress={() => navTo('Profile')} />
                  <DrawerItem icon="📜" label="Lịch sử thanh toán" active={currentScreen === 'PaymentHistory'} onPress={() => navTo('PaymentHistory')} />
                </>
              )}

              {/* 3. NẾU LÀ NHÂN VIÊN (STAFF) HOẶC CHỦ TRỌ (MANAGER) */}
              {currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'MANAGER') && (
                <>
                  <Text style={styles.drawerSectionTitle}>TỔNG QUAN</Text>
                  <DrawerItem icon="🏠" label="Trang chủ" active={currentScreen === 'Home'} onPress={() => navTo('Home')} />
                  <DrawerItem icon="🛏️" label="Danh sách phòng" active={currentScreen === 'RoomList'} onPress={() => navTo('RoomList')} />
                  <DrawerItem icon="🔍" label="Tìm kiếm phòng" active={currentScreen === 'RoomSearch'} onPress={() => navTo('RoomSearch')} />

                  <Text style={styles.drawerSectionTitle}>VẬN HÀNH</Text>
                  <DrawerItem icon="⚙️" label="Quản lý phòng" active={currentScreen === 'ManageRoom'} onPress={() => navTo('ManageRoom')} />
                  <DrawerItem icon="📋" label="Duyệt yêu cầu thuê" active={currentScreen === 'RequestManagement'} onPress={() => navTo('RequestManagement')} />
                  <DrawerItem icon="✍️" label="Lập & QL Hợp đồng" active={currentScreen === 'ManageContract'} onPress={() => navTo('ManageContract')} />
                  <DrawerItem icon="📄" label="Danh sách hợp đồng" active={currentScreen === 'ContractList'} onPress={() => navTo('ContractList')} />

                  <Text style={styles.drawerSectionTitle}>TÀI CHÍNH</Text>
                  <DrawerItem icon="⚡" label="Chốt điện & nước" active={currentScreen === 'Utility'} onPress={() => navTo('Utility')} />
                  <DrawerItem icon="🧾" label="Hóa đơn & VNPay" active={currentScreen === 'InvoiceList'} onPress={() => navTo('InvoiceList')} />

                  <Text style={styles.drawerSectionTitle}>CON NGƯỜI</Text>
                  <DrawerItem icon="👥" label="Khách thuê & CCCD" active={currentScreen === 'TenantManagement'} onPress={() => navTo('TenantManagement')} />
                  {currentUser.role === 'MANAGER' && (
                    <DrawerItem icon="🛡️" label="Quản lý nhân viên" active={currentScreen === 'StaffManagement'} onPress={() => navTo('StaffManagement')} />
                  )}
                  <DrawerItem icon="👤" label="Hồ sơ cá nhân" active={currentScreen === 'Profile'} onPress={() => navTo('Profile')} />
                </>
              )}
            </ScrollView>

            {/* Footer User Info & Logout */}
            <View style={styles.drawerFooter}>
              {currentUser ? (
                <>
                  <View style={styles.drawerUserBox}>
                    <View style={styles.drawerAvatar}>
                      <Text style={styles.drawerAvatarText}>
                        {(currentUser.fullName || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.drawerUserName} numberOfLines={1}>
                        {currentUser.fullName}
                      </Text>
                      <Text style={styles.drawerUserRole}>
                        {currentUser.role === 'MANAGER'
                          ? '👑 Chủ Trọ'
                          : currentUser.role === 'STAFF'
                          ? '🛡️ Nhân Viên'
                          : '🙋 Khách Thuê'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.drawerLogoutBtn} onPress={handleLogout}>
                    <Text style={styles.drawerLogoutText}>🚪 Đăng xuất</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.drawerLoginBtn}
                  onPress={() => navTo('Login')}
                >
                  <Text style={styles.drawerLoginText}>🔑 Đăng nhập / Đăng ký</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DrawerItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, active && styles.drawerItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.drawerItemIcon}>{icon}</Text>
      <Text style={[styles.drawerItemLabel, active && styles.drawerItemLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.78, 300);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  topHeader: {
    height: 52,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  hamburgerText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIcon: { fontSize: 18 },
  headerTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  headerUserPill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  headerUserText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  headerLoginBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  headerLoginText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  mainContent: { flex: 1, backgroundColor: '#f8fafc' },

  // Bottom Nav
  bottomNav: {
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  bottomNavItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomNavIcon: { fontSize: 20, opacity: 0.6 },
  bottomNavIconActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  bottomNavText: { fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: '600' },
  bottomNavTextActive: { color: '#2563eb', fontWeight: '800' },

  // Route Guard
  accessDeniedWrap: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  accessDeniedIcon: { fontSize: 50, marginBottom: 14 },
  accessDeniedTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  accessDeniedMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  accessDeniedBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  accessDeniedBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },

  // Drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
  },
  drawerBackdrop: { flex: 1 },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0f172a',
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  drawerLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoIcon: { fontSize: 18 },
  drawerBrandTitle: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  drawerBrandSub: { fontSize: 11, color: '#94a3b8' },
  drawerScroll: { flex: 1, padding: 12 },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  drawerItemActive: {
    backgroundColor: '#2563eb',
  },
  drawerItemIcon: { fontSize: 16 },
  drawerItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  drawerItemLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  drawerUserBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  drawerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  drawerUserRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93c5fd',
    marginTop: 2,
  },
  drawerLogoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  drawerLogoutText: {
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 13,
  },
  drawerLoginBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  drawerLoginText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});
