import React from 'react';

/**
 * Thanh điều hướng ứng dụng (Navbar)
 * Tích hợp Phân quyền người dùng (Role-Based Access Control - RBAC)
 * - Guest (Chưa đăng nhập): Chỉ xem Trang chủ, Danh sách phòng, Tìm phòng, Đăng nhập.
 * - Tenant (Khách thuê): Xem Trang chủ, Danh sách phòng, Tìm phòng, Hồ sơ cá nhân.
 * - Staff (Nhân viên): Quản lý phòng, Yêu cầu thuê, Hợp đồng, Quản lý khách thuê & CCCD.
 * - Manager (Chủ trọ): Kế thừa Staff + Quản trị nhân viên (UC15).
 */
export default function Navbar({ currentScreen, setCurrentScreen, currentUser, onLogout }) {
  // Bộ lọc menu điều hướng theo quyền hạn
  const getNavItems = () => {
    // 1. Khách vãng lai (Chưa đăng nhập)
    if (!currentUser) {
      return [
        { key: 'home', label: '🏠 Trang chủ', desc: 'Giới thiệu & Tổng quan' },
        { key: 'rooms', label: '🛏️ Phòng trọ', desc: 'Danh sách phòng' },
        { key: 'search', label: '🔍 Tìm phòng', desc: 'Tìm kiếm & lọc phòng trống' }
      ];
    }

    // 2. Khách thuê (Tenant)
    if (currentUser.role === 'TENANT') {
      return [
        { key: 'home', label: '🏠 Trang chủ', desc: 'Trang chủ khách thuê' },
        { key: 'rooms', label: '🛏️ Phòng trọ', desc: 'Danh sách phòng' },
        { key: 'search', label: '🔍 Tìm phòng', desc: 'Tìm kiếm & lọc' },
        { key: 'my-requests', label: '📋 Yêu cầu của tôi', desc: 'Xem lại trạng thái gửi yêu cầu thuê' },
        { key: 'my-contracts', label: '📄 Hợp đồng của tôi', desc: 'Xem lại hợp đồng thuê phòng đã ký kết' }
      ];
    }

    // 3. Nhân viên quản lý (Staff)
    if (currentUser.role === 'STAFF') {
      return [
        { key: 'home', label: '🏠 Trang chủ', desc: 'Bảng điều khiển nhân viên' },
        { key: 'rooms', label: '🛏️ Phòng trọ', desc: 'Danh sách phòng' },
        { key: 'search', label: '🔍 Tìm phòng', desc: 'Tìm kiếm & lọc' },
        { key: 'manage', label: '⚙️ Quản lý phòng', desc: 'Quản lý phòng trọ (UC04)' },
        { key: 'requests', label: '📋 Yêu cầu thuê', desc: 'Duyệt yêu cầu thuê (UC03)' },
        { key: 'contracts', label: '📄 Hợp đồng', desc: 'Quản lý hợp đồng (UC05)' },
        { key: 'tenants', label: '👥 Khách thuê', desc: 'Quản lý CCCD & Tạm trú (UC06)' }
      ];
    }

    // 4. Chủ trọ / Quản lý cấp cao (Manager) - Có thêm UC15 Quản lý nhân viên
    return [
      { key: 'home', label: '🏠 Trang chủ', desc: 'Bảng điều khiển quản trị' },
      { key: 'rooms', label: '🛏️ Phòng trọ', desc: 'Danh sách phòng' },
      { key: 'search', label: '🔍 Tìm phòng', desc: 'Tìm kiếm & lọc' },
      { key: 'manage', label: '⚙️ Quản lý phòng', desc: 'Quản lý phòng trọ (UC04)' },
      { key: 'requests', label: '📋 Yêu cầu thuê', desc: 'Duyệt yêu cầu thuê (UC03)' },
      { key: 'contracts', label: '📄 Hợp đồng', desc: 'Quản lý hợp đồng (UC05)' },
      { key: 'tenants', label: '👥 Khách thuê', desc: 'Quản lý CCCD & Tạm trú (UC06)' },
      { key: 'staff', label: '🛡️ Nhân viên', desc: 'Quản lý nhân viên (UC15)' }
    ];
  };

  const navItems = getNavItems();

  return (
    <header style={{
      backgroundColor: '#1e3a8a',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Logo & Brand */}
        <div 
          onClick={() => setCurrentScreen('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            🏠
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Motel Management System
            </div>
            <div style={{ fontSize: '11px', color: '#93c5fd' }}>
              SWD392 • Hệ thống Quản lý Nhà trọ & Căn hộ
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {navItems.map((item) => {
            const isActive = currentScreen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentScreen(item.key)}
                style={{
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#1e3a8a' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}

          {/* User Auth Tab */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <button
                onClick={() => setCurrentScreen('auth')}
                title="Xem thông tin tài khoản"
                style={{
                  backgroundColor: currentScreen === 'auth' ? '#ffffff' : '#3b82f6',
                  color: currentScreen === 'auth' ? '#1e3a8a' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>👤</span>
                <span>{currentUser.fullName?.split(' ').pop() || 'User'}</span>
                <span style={{
                  fontSize: '10px',
                  backgroundColor: currentUser.role === 'MANAGER' ? '#dc2626' : currentUser.role === 'STAFF' ? '#d97706' : '#1d4ed8',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  {currentUser.role === 'MANAGER' ? 'Chủ Trọ' : currentUser.role === 'STAFF' ? 'Nhân Viên' : 'Khách Thuê'}
                </span>
              </button>
              <button
                onClick={onLogout}
                title="Đăng xuất khỏi hệ thống"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🚪 Thoát
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentScreen('auth')}
              style={{
                backgroundColor: currentScreen === 'auth' ? '#ffffff' : '#10b981',
                color: currentScreen === 'auth' ? '#1e3a8a' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '6px'
              }}
            >
              🔑 Đăng nhập / Đăng ký
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
