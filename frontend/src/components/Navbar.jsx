import React from 'react';

export default function Navbar({ currentScreen, setCurrentScreen }) {
  const navItems = [
    { key: 'home', label: '🏠 Trang chủ', desc: 'Tổng quan hệ thống' },
    { key: 'rooms', label: '🛏️ Danh sách phòng', desc: 'Tất cả phòng trọ' },
    { key: 'search', label: '🔍 Tìm kiếm & Lọc', desc: 'Tìm phòng trống' },
    { key: 'manage', label: '⚙️ Quản lý phòng', desc: 'Dành cho quản lý/chủ trọ' }
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 24px',
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
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            🏠
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Motel Management System
            </div>
            <div style={{ fontSize: '12px', color: '#93c5fd' }}>
              Hệ thống Quản lý Nhà trọ & Căn hộ Dịch vụ
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  padding: '9px 16px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
