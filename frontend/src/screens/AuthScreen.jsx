import React, { useState } from 'react';
import { userClientService } from '../services/userClientService';

/**
 * Màn hình Đăng ký / Đăng nhập (UC01: Register / Login)
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * SWR2.1, SWR2.2, TC_USER_01, TC_USER_02
 */
export default function AuthScreen({ currentUser, setCurrentUser, onNotify, setCurrentScreen }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form Đăng nhập
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });

  // Form Đăng ký
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT'
  });

  // Xử lý Đăng nhập (TC_USER_02)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      onNotify('Vui lòng nhập tài khoản (SĐT/Email) và mật khẩu!', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await userClientService.login(loginForm);
      if (res.success) {
        setCurrentUser(res.data.user);
        onNotify(`🎉 Đăng nhập thành công! Xin chào ${res.data.user.fullName} (${res.data.user.role})`, 'success');
        if (res.data.user.role === 'TENANT') {
          setCurrentScreen('rooms');
        } else {
          setCurrentScreen('tenants');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại!';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng ký (TC_USER_01)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.phone || !regForm.email || !regForm.password) {
      onNotify('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    if (regForm.password !== regForm.confirmPassword) {
      onNotify('Mật khẩu xác nhận không khớp nhau!', 'error');
      return;
    }

    if (regForm.password.length < 6) {
      onNotify('Mật khẩu tối thiểu phải 6 ký tự!', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await userClientService.register({
        fullName: regForm.fullName,
        phone: regForm.phone,
        email: regForm.email,
        password: regForm.password,
        role: regForm.role
      });

      if (res.success) {
        onNotify('🎉 Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.', 'success');
        setIsLoginMode(true);
        setLoginForm({
          identifier: regForm.phone,
          password: regForm.password
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký thất bại!';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Chọn nhanh tài khoản demo để chấm bài nhanh
  const handleQuickLogin = (roleType) => {
    if (roleType === 'MANAGER') {
      setLoginForm({ identifier: '0901234567', password: 'Password123@' });
    } else if (roleType === 'STAFF') {
      setLoginForm({ identifier: '0902345678', password: 'Password123@' });
    } else {
      setLoginForm({ identifier: '0912345678', password: 'Password123@' });
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    userClientService.logout();
    setCurrentUser(null);
    onNotify('Đã đăng xuất tài khoản an toàn!', 'info');
  };

  return (
    <div style={{ padding: '30px 0', maxWidth: '800px', margin: '0 auto' }}>
      {/* Thẻ hiển thị khi đã đăng nhập */}
      {currentUser ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Thông Tin Tài Khoản Đang Đăng Nhập
          </h2>
          <div style={{ display: 'inline-block', marginBottom: '20px' }}>
            <span style={{
              backgroundColor: currentUser.role === 'MANAGER' ? '#fee2e2' : currentUser.role === 'STAFF' ? '#fef3c7' : '#e0e7ff',
              color: currentUser.role === 'MANAGER' ? '#991b1b' : currentUser.role === 'STAFF' ? '#92400e' : '#3730a3',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              Vai trò: {currentUser.role === 'MANAGER' ? '👑 Chủ Trọ (Manager)' : currentUser.role === 'STAFF' ? '🛡️ Nhân Viên (Staff)' : '🙋 Khách Thuê (Tenant)'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            textAlign: 'left',
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Họ và tên:</span>
              <strong style={{ fontSize: '15px', color: '#1e293b' }}>{currentUser.fullName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Số điện thoại:</span>
              <strong style={{ fontSize: '15px', color: '#1e293b' }}>{currentUser.phone}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Email:</span>
              <strong style={{ fontSize: '15px', color: '#1e293b' }}>{currentUser.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Số CCCD:</span>
              <strong style={{ fontSize: '15px', color: '#1e293b' }}>{currentUser.identityNumber || 'Chưa cập nhật'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentScreen('tenants')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👥 Quản lý Khách thuê
            </button>
            <button
              onClick={() => setCurrentScreen('staff')}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🛡️ Quản lý Nhân viên
            </button>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      ) : (
        /* Hộp thoại Đăng nhập / Đăng ký */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header Switch Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <button
              onClick={() => setIsLoginMode(true)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: isLoginMode ? '#ffffff' : 'transparent',
                color: isLoginMode ? '#2563eb' : '#64748b',
                fontWeight: isLoginMode ? '700' : '600',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: isLoginMode ? '3px solid #2563eb' : 'none'
              }}
            >
              🔑 Đăng Nhập Hệ Thống
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: !isLoginMode ? '#ffffff' : 'transparent',
                color: !isLoginMode ? '#2563eb' : '#64748b',
                fontWeight: !isLoginMode ? '700' : '600',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: !isLoginMode ? '3px solid #2563eb' : 'none'
              }}
            >
              📝 Đăng Ký Tài Khoản Mới
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Quick Demo Login Bar */}
            {isLoginMode && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px dashed #bfdbfe',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                  ⚡ Chọn nhanh tài khoản kiểm thử & chấm bài (Demo):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('MANAGER')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    👑 Quản lý (Manager)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('STAFF')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🛡️ Nhân viên (Staff)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('TENANT')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🙋 Khách thuê (Tenant)
                  </button>
                </div>
              </div>
            )}

            {isLoginMode ? (
              /* FORM ĐĂNG NHẬP */
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Số điện thoại hoặc Email *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 0912345678 hoặc khanh@gmail.com"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px'
                  }}
                >
                  {loading ? 'Đang xác thực đăng nhập...' : '🔑 Đăng Nhập'}
                </button>
              </form>
            ) : (
              /* FORM ĐĂNG KÝ */
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Phạm Văn Khánh"
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      placeholder="VD: 0912345678"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="VD: khanh@gmail.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Mật khẩu (tối thiểu 6 ký tự) *
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu..."
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Xác nhận mật khẩu *
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu..."
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Đăng ký với vai trò:
                  </label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="TENANT">🙋 Khách thuê phòng (Tenant)</option>
                    <option value="STAFF">🛡️ Nhân viên quản lý (Staff)</option>
                    <option value="MANAGER">👑 Chủ nhà trọ (Manager)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px'
                  }}
                >
                  {loading ? 'Đang tạo tài khoản...' : '📝 Đăng Ký Tài Khoản'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
