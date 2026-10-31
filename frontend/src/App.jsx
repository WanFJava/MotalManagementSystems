import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import ManageRoomScreen from './screens/ManageRoomScreen';
import ManageRentalRequestsScreen from './screens/ManageRentalRequestsScreen';
import ManageContractsScreen from './screens/ManageContractsScreen';
import ManageUtilitiesScreen from './screens/ManageUtilitiesScreen';
import ManageInvoicesScreen from './screens/ManageInvoicesScreen';
import ManageTenantScreen from './screens/ManageTenantScreen';
import ManageStaffScreen from './screens/ManageStaffScreen';
import AuthScreen from './screens/AuthScreen';
import { roomClientService } from './services/roomClientService';
import { invoiceClientService } from './services/invoiceClientService';
import { userClientService } from './services/userClientService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState(null);

  // User state từ Thành viên 2 (Khánh)
  const [currentUser, setCurrentUser] = useState(() => userClientService.getCurrentUser());

  // State prefill khi duyệt yêu cầu thuê -> chuyển sang tạo hợp đồng (Đức)
  const [contractPrefill, setContractPrefill] = useState(null);

  // State prefill khi từ chỉ số điện nước -> chuyển sang lập hóa đơn (Mạnh)
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
      setCurrentScreen('invoices');
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
    setCurrentScreen('auth');
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

      {/* Header Navigation */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        {/* Phân hệ 1: Quang - Phòng & Tìm kiếm phòng */}
        {currentScreen === 'home' && (
          <HomeScreen
            rooms={rooms}
            loading={loading}
            onSelectRoom={handleSelectRoom}
            setCurrentScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'rooms' && (
          <RoomListScreen
            rooms={rooms}
            loading={loading}
            onSelectRoom={handleSelectRoom}
            setCurrentScreen={setCurrentScreen}
          />
        )}

        {currentScreen === 'search' && (
          <RoomSearchScreen
            onSelectRoom={handleSelectRoom}
          />
        )}

        {currentScreen === 'detail' && (
          <RoomDetailScreen
            room={selectedRoom}
            onBack={handleBackToRooms}
            onRentalRequestSuccess={(msg) => showToast(msg, 'success')}
          />
        )}

        {currentScreen === 'manage' && (
          <ManageRoomScreen
            rooms={rooms}
            fetchRooms={fetchRooms}
            loading={loading}
            onNotify={(msg, type) => showToast(msg, type)}
          />
        )}

        {/* Phân hệ 3: Đức - Yêu cầu thuê & Hợp đồng */}
        {currentScreen === 'requests' && (
          <ManageRentalRequestsScreen
            onNotify={(msg, type) => showToast(msg, type)}
            onNavigateToCreateContract={handleNavigateToCreateContract}
          />
        )}

        {currentScreen === 'contracts' && (
          <ManageContractsScreen
            onNotify={(msg, type) => showToast(msg, type)}
            initialPrefill={contractPrefill}
            onClearPrefill={() => setContractPrefill(null)}
          />
        )}

        {/* Phân hệ 4: Mạnh - Điện nước, Hóa đơn & VNPay */}
        {currentScreen === 'utilities' && (
          <ManageUtilitiesScreen
            onNotify={(msg, type) => showToast(msg, type)}
            onNavigateToInvoice={handleNavigateToInvoice}
          />
        )}

        {currentScreen === 'invoices' && (
          <ManageInvoicesScreen
            onNotify={(msg, type) => showToast(msg, type)}
            initialPrefill={invoicePrefill}
            onClearPrefill={() => setInvoicePrefill(null)}
          />
        )}

        {/* Phân hệ 2: Khánh - Tài khoản, Khách thuê & Nhân viên */}
        {currentScreen === 'tenants' && (
          <ManageTenantScreen
            onNotify={(msg, type) => showToast(msg, type)}
          />
        )}

        {currentScreen === 'staff' && (
          <ManageStaffScreen
            currentUser={currentUser}
            onNotify={(msg, type) => showToast(msg, type)}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onNotify={(msg, type) => showToast(msg, type)}
            setCurrentScreen={setCurrentScreen}
          />
        )}
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
