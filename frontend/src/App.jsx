import React, { useState, useEffect } from 'react';
import Navbar, { getScreenMeta } from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import ManageRoomScreen from './screens/ManageRoomScreen';
import ManageRentalRequestsScreen from './screens/ManageRentalRequestsScreen';
import MyRentalRequestsScreen from './screens/MyRentalRequestsScreen';
import MyContractsScreen from './screens/MyContractsScreen';
import MyRoomScreen from './screens/MyRoomScreen';
import MyInvoicesScreen from './screens/MyInvoicesScreen';
import ManageContractsScreen from './screens/ManageContractsScreen';
import ManageUtilitiesScreen from './screens/ManageUtilitiesScreen';
import ManageInvoicesScreen from './screens/ManageInvoicesScreen';
import ManageTenantScreen from './screens/ManageTenantScreen';
import ManageStaffScreen from './screens/ManageStaffScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import { roomClientService } from './services/roomClientService';
import { invoiceClientService } from './services/invoiceClientService';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // State prefill khi duyệt yêu cầu thuê -> chuyển sang tạo hợp đồng
  const [contractPrefill, setContractPrefill] = useState(null);

  // State prefill khi từ chỉ số điện nước -> chuyển sang lập hóa đơn
  const [invoicePrefill, setInvoicePrefill] = useState(null);

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

  // Kiểm tra callback VNPay Return URL trên trang chủ nếu có query parameters
  useEffect(() => {
    fetchRooms();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('vnp_ResponseCode') || urlParams.get('vnpay') === 'return') {
      const targetScreen = urlParams.get('screen') || (currentUser?.role === 'TENANT' ? 'my-invoices' : 'invoices');
      setCurrentScreen(targetScreen);
      const paramsObj = {};
      urlParams.forEach((val, key) => { paramsObj[key] = val; });

      invoiceClientService.confirmVNPayReturn(paramsObj)
        .then((res) => {
          if (res.success) {
            showToast('🎉 Thanh toán VNPay thành công! Hóa đơn đã chuyển sang trạng thái ĐÃ THANH TOÁN.', 'success');
          } else {
            showToast(res.message || 'Thanh toán VNPay không thành công hoặc đã bị hủy.', 'error');
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
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

  // Chuyển từ duyệt yêu cầu sang lập hợp đồng
  const handleNavigateToCreateContract = (prefillData) => {
    setContractPrefill(prefillData);
    setCurrentScreen('contracts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chuyển từ quản lý điện nước sang lập hóa đơn
  const handleNavigateToInvoice = (prefillData) => {
    setInvoicePrefill(prefillData);
    setCurrentScreen('invoices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đăng xuất người dùng
  const handleLogout = () => {
    userClientService.logout();
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản thành công!', 'info');
    setCurrentScreen('home');
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
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
          onRentalRequestSuccess={(msg) => showToast(msg, 'success')}
        />
      );
    }

    if (currentScreen === 'profile') {
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

    // 2.3. MÀN HÌNH THÔNG TIN PHÒNG ĐANG THUÊ (Dành riêng cho TENANT)
    if (currentScreen === 'my-room') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập"
            message="Vui lòng đăng nhập bằng tài khoản Khách thuê (Tenant) để xem thông tin phòng đang thuê của bạn."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      return (
        <MyRoomScreen
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    // 2.4. MÀN HÌNH HÓA ĐƠN & THANH TOÁN VNPAY (Dành riêng cho TENANT - UC09)
    if (currentScreen === 'my-invoices') {
      if (!currentUser) {
        return (
          <AccessDeniedCard
            icon="🔒"
            title="Yêu Cầu Đăng Nhập"
            message="Vui lòng đăng nhập bằng tài khoản Khách thuê (Tenant) để theo dõi hóa đơn và thanh toán qua VNPay."
            onAction={() => setCurrentScreen('auth')}
            actionText="Đăng nhập ngay"
          />
        );
      }

      return (
        <MyInvoicesScreen
          currentUser={currentUser}
          setCurrentScreen={setCurrentScreen}
          onNotify={(msg, type) => showToast(msg, type)}
        />
      );
    }

    // 3. MÀN HÌNH QUẢN TRỊ VẬN HÀNH (Dành riêng cho STAFF và MANAGER)
    const staffScreens = ['manage', 'requests', 'contracts', 'tenants', 'utilities', 'invoices'];
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
            message="Chức năng Quản lý Nhân viên chỉ dành riêng cho Chủ trọ / Quản lý cấp cao (Manager)."
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
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setCurrentScreen={setCurrentScreen}
          onNotify={(msg, type) => showToast(msg, type)}
          initialPrefill={contractPrefill}
          onClearPrefill={() => setContractPrefill(null)}
        />
      );
    }

    if (currentScreen === 'utilities') {
      return (
        <ManageUtilitiesScreen
          onNotify={(msg, type) => showToast(msg, type)}
          onNavigateToInvoice={handleNavigateToInvoice}
        />
      );
    }

    if (currentScreen === 'invoices') {
      return (
        <ManageInvoicesScreen
          onNotify={(msg, type) => showToast(msg, type)}
          initialPrefill={invoicePrefill}
          onClearPrefill={() => setInvoicePrefill(null)}
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

  const screenMeta = getScreenMeta(currentScreen, currentUser);
  const todayLabel = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="app-shell">
      {/* Toast Notification Popup */}
      {toast && (
        <div className={`app-toast app-toast--${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation dọc bên trái với phân quyền hiển thị */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      <div className="app-content">
        {/* Topbar: tiêu đề trang hiện tại */}
        <header className="app-topbar">
          <button
            type="button"
            className="sidebar__mobile-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Mở menu"
          >
            ☰
          </button>
          <div>
            <h1 className="app-topbar__title">{screenMeta.icon} {screenMeta.label}</h1>
            {screenMeta.desc && <div className="app-topbar__desc">{screenMeta.desc}</div>}
          </div>
          <div className="app-topbar__right">
            <span className="app-topbar__date">📅 {todayLabel}</span>
          </div>
        </header>

        {/* Main Content Area kèm Route Guard */}
        <main className="app-main">
          {renderCurrentScreen()}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <strong>Motel Management System</strong> • Hệ thống Quản lý Nhà trọ & Căn hộ Dịch vụ
        </footer>
      </div>
    </div>
  );
}
