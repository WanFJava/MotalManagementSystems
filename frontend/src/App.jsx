import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeScreen from './screens/HomeScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import ManageRoomScreen from './screens/ManageRoomScreen';
import ManageRentalRequestsScreen from './screens/ManageRentalRequestsScreen';
import ManageContractsScreen from './screens/ManageContractsScreen';
import { roomClientService } from './services/roomClientService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState(null);

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
      showToast('Không thể kết nối đến máy chủ Backend (Port 5000)!', 'error');
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

  // Chuyển từ duyệt yêu cầu sang lập hợp đồng
  const handleNavigateToCreateContract = (prefillData) => {
    setContractPrefill(prefillData);
    setCurrentScreen('contracts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <Navbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      {/* Main Content Area */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <strong>Motel Management System</strong> • Hệ thống Quản lý Nhà trọ & Căn hộ Dịch vụ (SWD392)
        </div>
      </footer>
    </div>
  );
}
