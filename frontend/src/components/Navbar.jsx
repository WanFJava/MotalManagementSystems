import React, { useState, useEffect } from 'react';
import './Navbar.css';

/**
 * Thanh điều hướng ứng dụng dạng Sidebar dọc bên trái (Navbar)
 * Tích hợp Phân quyền người dùng (Role-Based Access Control - RBAC)
 * - Guest (Chưa đăng nhập): Chỉ xem Trang chủ, Danh sách phòng, Tìm phòng, Đăng nhập.
 * - Tenant (Khách thuê): Trang chủ, Phòng trọ, Tìm phòng, Yêu cầu của tôi, Hợp đồng của tôi, Hồ sơ cá nhân.
 * - Staff (Nhân viên): Quản lý phòng, Yêu cầu thuê, Hợp đồng, Điện & Nước, Hóa đơn & VNPay, Quản lý khách thuê & CCCD.
 * - Manager (Chủ trọ): Kế thừa Staff + Quản trị nhân viên (UC15).
 */

// Bộ lọc menu điều hướng theo quyền hạn (chia nhóm để hiển thị trên sidebar)
export const getNavSections = (currentUser) => {
  // 1. Khách vãng lai (Chưa đăng nhập)
  if (!currentUser) {
    return [
      {
        title: 'Khám phá',
        items: [
          { key: 'home', icon: '🏠', label: 'Trang chủ', desc: 'Giới thiệu & Tổng quan' },
          { key: 'rooms', icon: '🛏️', label: 'Phòng trọ', desc: 'Danh sách phòng' },
          { key: 'search', icon: '🔍', label: 'Tìm phòng', desc: 'Tìm kiếm & lọc phòng trống' }
        ]
      }
    ];
  }

  // 2. Khách thuê (Tenant)
  if (currentUser.role === 'TENANT') {
    return [
      {
        title: 'Tổng quan',
        items: [
          { key: 'home', icon: '🏠', label: 'Trang chủ', desc: 'Trang chủ khách thuê' },
          { key: 'my-room', icon: '🔑', label: 'Phòng đang thuê', desc: 'Chi tiết phòng đang ở & hợp đồng' }
        ]
      },
      {
        title: 'Thuê phòng',
        items: [
          { key: 'my-invoices', icon: '🧾', label: 'Hóa đơn & VNPay', desc: 'Tiền điện nước & thanh toán online' },
          { key: 'my-contracts', icon: '📄', label: 'Hợp đồng của tôi', desc: 'Xem lại hợp đồng thuê phòng đã ký kết' },
          { key: 'my-requests', icon: '📋', label: 'Yêu cầu của tôi', desc: 'Xem lại trạng thái gửi yêu cầu thuê' },
          { key: 'rooms', icon: '🛏️', label: 'Xem phòng', desc: 'Danh sách phòng' }
        ]
      },
      {
        title: 'Tài khoản',
        items: [
          { key: 'profile', icon: '👤', label: 'Hồ sơ của tôi', desc: 'Xem & cập nhật hồ sơ cá nhân' }
        ]
      }
    ];
  }

  // 3. Nhân viên (Staff) & 4. Chủ trọ (Manager)
  const sections = [
    {
      title: 'Tổng quan',
      items: [
        { key: 'home', icon: '🏠', label: 'Trang chủ', desc: currentUser.role === 'MANAGER' ? 'Bảng điều khiển quản trị' : 'Bảng điều khiển nhân viên' },
        { key: 'rooms', icon: '🛏️', label: 'Phòng trọ', desc: 'Danh sách phòng' },
        { key: 'search', icon: '🔍', label: 'Tìm phòng', desc: 'Tìm kiếm & lọc' }
      ]
    },
    {
      title: 'Vận hành',
      items: [
        { key: 'manage', icon: '⚙️', label: 'Quản lý phòng', desc: 'Quản lý phòng trọ' },
        { key: 'requests', icon: '📋', label: 'Yêu cầu thuê', desc: 'Duyệt yêu cầu thuê' },
        { key: 'contracts', icon: '📄', label: 'Hợp đồng', desc: 'Quản lý hợp đồng' }
      ]
    },
    {
      title: 'Tài chính',
      items: [
        { key: 'utilities', icon: '⚡', label: 'Điện & Nước', desc: 'Chốt số điện nước' },
        { key: 'invoices', icon: '🧾', label: 'Hóa đơn & VNPay', desc: 'Quản lý hóa đơn & thanh toán' }
      ]
    },
    {
      title: 'Con người',
      items: [
        { key: 'tenants', icon: '👥', label: 'Khách thuê', desc: 'Quản lý CCCD & Tạm trú' },
        ...(currentUser.role === 'MANAGER'
          ? [{ key: 'staff', icon: '🛡️', label: 'Nhân viên', desc: 'Quản lý nhân viên' }]
          : []),
        { key: 'profile', icon: '👤', label: 'Hồ sơ', desc: 'Hồ sơ cá nhân' }
      ]
    }
  ];
  return sections;
};

// Lấy thông tin tiêu đề trang hiện tại (dùng cho Topbar)
const EXTRA_TITLES = {
  detail: { icon: '🛏️', label: 'Chi tiết phòng', desc: 'Thông tin chi tiết phòng trọ' },
  auth: { icon: '🔑', label: 'Đăng nhập / Đăng ký', desc: 'Truy cập tài khoản của bạn' },
  profile: { icon: '👤', label: 'Hồ sơ cá nhân', desc: 'Xem & cập nhật hồ sơ cá nhân' }
};

export const getScreenMeta = (currentScreen, currentUser) => {
  for (const section of getNavSections(currentUser)) {
    const found = section.items.find((i) => i.key === currentScreen);
    if (found) return found;
  }
  return EXTRA_TITLES[currentScreen] || { icon: '📌', label: 'Motel Management', desc: '' };
};

const ROLE_LABEL = { MANAGER: 'Chủ Trọ', STAFF: 'Nhân Viên', TENANT: 'Khách Thuê' };

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Navbar({ currentScreen, setCurrentScreen, currentUser, onLogout, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('motel_sidebar_collapsed') === '1');

  useEffect(() => {
    localStorage.setItem('motel_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const sections = getNavSections(currentUser);

  const go = (key) => {
    setCurrentScreen(key);
    if (setMobileOpen) setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className={`sidebar__backdrop ${mobileOpen ? 'is-visible' : ''}`}
        onClick={() => setMobileOpen && setMobileOpen(false)}
      />

      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        {/* Logo & Brand */}
        <div className="sidebar__brand" onClick={() => go('home')}>
          <div className="sidebar__logo">🏠</div>
          <div className="sidebar__brand-text">
            <div className="sidebar__brand-title">Motel Manager</div>
            <div className="sidebar__brand-sub">Hệ thống Quản lý Nhà trọ</div>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
        >
          ‹
        </button>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {sections.map((section) => (
            <div className="sidebar__section" key={section.title}>
              <div className="sidebar__section-title">{section.title}</div>
              {section.items.map((item) => {
                const isActive = currentScreen === item.key || (item.key === 'rooms' && currentScreen === 'detail');
                return (
                  <button
                    key={item.key}
                    type="button"
                    data-label={item.label}
                    title={collapsed ? undefined : item.desc}
                    className={`sidebar__item ${isActive ? 'is-active' : ''}`}
                    onClick={() => go(item.key)}
                  >
                    <span className="sidebar__icon">{item.icon}</span>
                    <span className="sidebar__label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User / Auth */}
        <div className="sidebar__footer">
          {currentUser ? (
            <>
              <div
                className="sidebar__user"
                onClick={() => go('profile')}
                title="Bấm để xem và cập nhật hồ sơ cá nhân"
              >
                <div className="sidebar__avatar">{getInitials(currentUser.fullName)}</div>
                <div className="sidebar__user-info">
                  <div className="sidebar__user-name">{currentUser.fullName || 'Người dùng'}</div>
                  <span className={`sidebar__role sidebar__role--${currentUser.role}`}>
                    {ROLE_LABEL[currentUser.role] || currentUser.role}
                  </span>
                </div>
              </div>
              <button type="button" className="sidebar__logout" onClick={onLogout} title="Đăng xuất khỏi hệ thống">
                <span>🚪</span>
                <span className="sidebar__logout-text">Đăng xuất</span>
              </button>
            </>
          ) : (
            <button type="button" className="sidebar__login" onClick={() => go('auth')} title="Đăng nhập / Đăng ký">
              <span>🔑</span>
              <span className="sidebar__logout-text">Đăng nhập / Đăng ký</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
