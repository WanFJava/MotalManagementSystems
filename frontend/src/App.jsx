import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import ManageRoomScreen from './screens/ManageRoomScreen';
import ManageRentalRequestsScreen from './screens/ManageRentalRequestsScreen';
import MyRentalRequestsScreen from './screens/MyRentalRequestsScreen';
import MyContractsScreen from './screens/MyContractsScreen';
import ManageContractsScreen from './screens/ManageContractsScreen';
import ManageTenantScreen from './screens/ManageTenantScreen';
import ManageStaffScreen from './screens/ManageStaffScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import { roomClientService } from './services/roomClientService';
import { userClientService } from './services/userClientService';

/**
 * Thẻ hiển thị khi người dùng không đủ quyền hạn truy cập (Route Guard)
 */
function AccessDeniedCard({ icon, title, message, onAction, actionText }) {
  return (
    <div style={{
      maxWidth: '560px',
      margin: '60px auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '40px 32px',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
        {message}
      </p>
      <button
        onClick={onAction}
        style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
        }}
      >
        {actionText}
      </button>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => userClientService.getCurrentUser());

  // State prefill khi duyệt yêu cầu thuê -> chuyển sang tạo hợp đồng
  const [contractPrefill, setContractPrefill] = useState(null);

  // Hiển thị Toast thông báo tự động biến mất sau 3.5s
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Tải danh sách phòng từ Backend API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomClientService.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error('Lỗi kết nối API Rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Xử lý khi chọn xem chi tiết phòng
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setCurrentScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quay lại từ màn hình chi tiết
  const handleBackToRooms = () => {
    setCurrentScreen('rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đăng xuất người dùng
  const handleLogout = () => {
    userClientService.logout();
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản thành công!', 'info');
    setCurrentScreen('home');
  };

  // Chuyển từ duyệt yêu cầu sang lập hợp đồng
  const handleNavigateToCreateContract = (prefillData) => {
    setContractPrefill(prefillData);
    setCurrentScreen('contracts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render màn hình có áp dụng Route Guard / Phân quyền truy cập
  const renderCurrentScreen = () => {
    // 1. MÀN HÌNH CÔNG KHAI (Dành cho tất cả: Khách vãng lai, Khách thuê, Nhân viên, Quản lý)
    if (currentScreen === 'home') {
      return (
        <HomeScreen
          rooms={rooms}
          loading={loading}
          onSelectRoom={handleSelectRoom}
          setCurrentScreen={setCurrentScreen}
          currentUser={currentUser}
        />
      );
    }

    if (currentScreen === 'rooms') {
      return (
        <RoomListScreen
          rooms={rooms}
          loading={loading}
          onSelectRoom={handleSelectRoom}
          setCurrentScreen={setCurrentScreen}
          currentUser={currentUser}
        />
      );
    }

    if (currentScreen === 'search') {
      return (
        <RoomSearchScreen
          onSelectRoom={handleSelectRoom}
        />
      );
    }

    if (currentScreen === 'detail') {
      return (
        <RoomDetailScreen
          room={selectedRoom}
          onBack={handleBackToRooms}
          onRentalRequestSuccess={(msg) => showToast(msg, 'success')}
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

        if (currentScreen === 'profile') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập"
            message="Vui lòng đăng nhập để xem và cập nhật thông tin hồ sơ cá nhân của bạn."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      return (
        <ProfileScreen
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onNotify={(msg, type) => showToast(msg, type)}
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

if (currentScreen === 'auth') {
      return (
        <AuthScreen
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onNotify={(msg, type) => showToast(msg, type)}
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

    // 2. MÀN HÌNH YÊU CẦU THUÊ CỦA KHÁCH THUÊ (Dành riêng cho TENANT)
    if (currentScreen === 'my-requests') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập"
            message="Vui lòng đăng nhập bằng tài khoản Khách thuê (Tenant) để xem lại danh sách và tiến độ xét duyệt yêu cầu giữ phòng của bạn."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      return (
        <MyRentalRequestsScreen
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    // 2.2. MÀN HÌNH HỢP ĐỒNG CỦA KHÁCH THUÊ (Dành riêng cho TENANT)
    if (currentScreen === 'my-contracts') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập"
            message="Vui lòng đăng nhập bằng tài khoản Khách thuê (Tenant) để xem lại hợp đồng thuê phòng đã ký kết của bạn."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      return (
        <MyContractsScreen
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    // 3. MÀN HÌNH QUẢN TRỊ VẬN HÀNH (Dành riêng cho STAFF và MANAGER)
    const staffScreens = ['manage', 'requests', 'contracts', 'tenants'];
    if (staffScreens.includes(currentScreen)) {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập Quản Trị"
            message="Chức năng quản trị này yêu cầu bạn phải đăng nhập bằng tài khoản Nhân viên (Staff) hoặc Chủ trọ (Manager)."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      if (currentUser.role === 'TENANT') {
        return (
          <AccessDeniedCard
            icon="🚫"
            title="Không Có Quyền Truy Cập (403 Forbidden)"
            message="Tài khoản hiện tại của bạn là Khách thuê (Tenant). Bạn không có quyền truy cập vào các phân hệ quản trị khu trọ."
            onAction={() => setCurrentScreen('home')}
            actionText="Quay về Trang chủ"
          />
        );
      }
    }

    // 4. MÀN HÌNH QUẢN TRỊ NHÂN VIÊN (UC15 - DÀNH RIÊNG CHO MANAGER)
    if (currentScreen === 'staff') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Quyền Chủ Trọ"
            message="Chức năng Quản lý Nhân viên (UC15) chỉ dành riêng cho Chủ trọ / Quản lý cấp cao (Manager)."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập tài khoản Quản lý"
          />
        );
      }

      if (currentUser.role !== 'MANAGER') {
        return (
          <AccessDeniedCard
            icon="🛡️"
            title="Quyền Hạn Bị Từ Chối"
            message={`Tài khoản của bạn là [${currentUser.role}]. Chức năng Quản trị Nhân viên & Khóa tài khoản chỉ dành riêng cho Chủ trọ (MANAGER)!`}
            onAction={() => setCurrentScreen('home')}
            actionText="Quay về Trang chủ"
          />
        );
      }
    }

    // RENDER CÁC MÀN HÌNH QUẢN TRỊ KHI ĐÃ ĐẠT QUYỀN
    if (currentScreen === 'manage') {
      return (
        <ManageRoomScreen
          rooms={rooms}
          fetchRooms={fetchRooms}
          loading={loading}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    if (currentScreen === 'requests') {
      return (
        <ManageRentalRequestsScreen
          onNotify={(msg, type) => showToast(msg, type)}
          onNavigateToCreateContract={handleNavigateToCreateContract}
        />
      );
    }

    if (currentScreen === 'contracts') {
      return (
        <ManageContractsScreen
          onNotify={(msg, type) => showToast(msg, type)}
          initialPrefill={contractPrefill}
          onClearPrefill={() => setContractPrefill(null)}
        />
      );
    }

    if (currentScreen === 'tenants') {
      return (
        <ManageTenantScreen
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    if (currentScreen === 'staff') {
      return (
        <ManageStaffScreen
          currentUser={currentUser}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Toast Notification Popup */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Navigation với phân quyền hiển thị */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area kèm Route Guard */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        {renderCurrentScreen()}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <strong>Motel Management System</strong> • Hệ thống Quản lý Nhà trọ & Căn hộ Dịch vụ (SWD392)
        </div>
      </footer>
    </div>
  );
}
