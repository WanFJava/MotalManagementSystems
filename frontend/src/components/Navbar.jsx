import React from 'react';

export default function Navbar({ currentScreen, setCurrentScreen, currentUser, onLogout }) {
  const navItems = [
    { key: 'home', label: '🏠 Trang chủ', desc: 'Tổng quan hệ thống' },
    { key: 'rooms', label: '🛏️ Phòng trọ', desc: 'Danh sách phòng' },
    { key: 'search', label: '🔍 Tìm phòng', desc: 'Tìm kiếm & lọc' },
    { key: 'manage', label: '⚙️ Quản lý phòng', desc: 'Dành cho quản trị' },
    { key: 'tenants', label: '👥 Khách thuê', desc: 'Quản lý CCCD & Tạm trú (UC06)' },
    { key: 'staff', label: '🛡️ Nhân viên', desc: 'Quản lý nhân viên (UC15)' }
  ];

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
              SWD392 • Nhóm 4 Thành Viên
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
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {currentUser.role}
                </span>
              </button>
              <button
                onClick={onLogout}
                title="Đăng xuất"
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
