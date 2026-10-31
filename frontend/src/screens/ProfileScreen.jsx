import React, { useState, useEffect } from 'react';
import { userClientService } from '../services/userClientService';

/**
 * Màn hình Xem và Cập nhật Hồ sơ Cá nhân (ProfileScreen - UC01 / UC06)
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * SWR2.1, SWR2.3, TC_USER_03
 */
export default function ProfileScreen({ currentUser, setCurrentUser, onNotify, setCurrentScreen }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form dữ liệu hồ sơ cá nhân
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    identityNumber: '',
    identityIssuedDate: '',
    identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
    address: '',
    currentAddress: '',
    dateOfBirth: '',
    gender: 'Nam',
    identityCardFront: '',
    identityCardBack: '',
    temporaryResidenceStatus: 'NOT_REGISTERED'
  });

  // Load thông tin hồ sơ chi tiết từ Backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?._id) return;
      try {
        setLoading(true);
        const data = await userClientService.getProfile(currentUser._id);
        if (data) {
          setFormData({
            fullName: data.fullName || '',
            phone: data.phone || '',
            email: data.email || '',
            identityNumber: data.identityNumber || '',
            identityIssuedDate: data.identityIssuedDate ? data.identityIssuedDate.substring(0, 10) : '',
            identityIssuedPlace: data.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
            address: data.address || '',
            currentAddress: data.currentAddress || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
            gender: data.gender || 'Nam',
            identityCardFront: data.identityCardFront || data.cccdFrontImage || '',
            identityCardBack: data.identityCardBack || data.cccdBackImage || '',
            temporaryResidenceStatus: data.temporaryResidenceStatus || 'NOT_REGISTERED'
          });
        }
      } catch (err) {
        console.error('Lỗi tải hồ sơ cá nhân:', err);
        // Fallback dùng thông tin currentUser đang có trong state
        setFormData((prev) => ({
          ...prev,
          fullName: currentUser.fullName || '',
          phone: currentUser.phone || '',
          email: currentUser.email || '',
          identityNumber: currentUser.identityNumber || '',
          address: currentUser.address || ''
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  // Xử lý thay đổi trường nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Lưu thông tin hồ sơ cá nhân
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      onNotify('Họ và tên không được để trống!', 'error');
      return;
    }

    if (!formData.phone.trim()) {
      onNotify('Số điện thoại không được để trống!', 'error');
      return;
    }

    // Validate CCCD: nếu nhập thì phải đúng 12 chữ số
    if (formData.identityNumber && !/^\d{12}$/.test(formData.identityNumber.trim())) {
      onNotify('Số CCCD không hợp lệ! Bắt buộc phải đủ đúng 12 chữ số.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await userClientService.updateProfile(currentUser._id, {
        ...formData,
        identityNumber: formData.identityNumber.trim(),
        identityCardFront: formData.identityCardFront.trim(),
        identityCardBack: formData.identityCardBack.trim()
      });

      if (res.success) {
        setCurrentUser(res.data);
        onNotify('🎉 Cập nhật hồ sơ cá nhân thành công!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật hồ sơ thất bại!';
      onNotify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <p>Đang tải thông tin hồ sơ cá nhân...</p>
      </div>
    );
  }

  const roleLabel =
    currentUser?.role === 'MANAGER'
      ? '👑 Chủ Trọ (Manager)'
      : currentUser?.role === 'STAFF'
      ? '🛡️ Nhân Viên (Staff)'
      : '🙋 Khách Thuê (Tenant)';

  const roleColor =
    currentUser?.role === 'MANAGER'
      ? { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
      : currentUser?.role === 'STAFF'
      ? { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }
      : { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 0' }}>
      {/* Header Profile */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
          }}>
            👤
          </div>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>
              {currentUser?.fullName || 'Hồ Sơ Cá Nhân'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: roleColor.bg,
                color: roleColor.text,
                border: `1px solid ${roleColor.border}`,
                padding: '3px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {roleLabel}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                SĐT: <strong>{currentUser?.phone}</strong>
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                • Email: <strong>{currentUser?.email}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Nút thao tác nhanh theo vai trò */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {currentUser?.role === 'TENANT' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentScreen('my-requests')}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#1e3a8a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📋 Yêu cầu của tôi
              </button>
              <button
                type="button"
                onClick={() => setCurrentScreen('my-contracts')}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#1e3a8a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📄 Hợp đồng của tôi
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form Cập nhật Hồ sơ */}
      <form onSubmit={handleSubmit}>
        {/* Phần 1: Thông tin liên hệ cơ bản */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📌</span> Thông Tin Cá Nhân Cơ Bản
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Họ và tên đầy đủ *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Số điện thoại liên hệ *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Địa chỉ Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Ngày sinh
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phần 2: Hồ sơ định danh pháp lý (CCCD / Đăng ký tạm trú) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🪪</span> Hồ Sơ Định Danh Pháp Lý (CCCD / Tạm Trú)
            </h3>
            <span style={{
              backgroundColor: formData.temporaryResidenceStatus === 'REGISTERED' ? '#dcfce7' : '#fef3c7',
              color: formData.temporaryResidenceStatus === 'REGISTERED' ? '#166534' : '#92400e',
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              {formData.temporaryResidenceStatus === 'REGISTERED' ? '🟢 Đã Khai Báo Tạm Trú' : '🟡 Chưa Khai Báo Tạm Trú'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Số Căn cước công dân (12 chữ số) *
              </label>
              <input
                type="text"
                name="identityNumber"
                maxLength={12}
                placeholder="VD: 001202001234"
                value={formData.identityNumber}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  letterSpacing: '1px',
                  fontWeight: '700'
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Bắt buộc để ký hợp đồng thuê phòng và làm thủ tục tạm trú.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Ngày cấp CCCD
              </label>
              <input
                type="date"
                name="identityIssuedDate"
                value={formData.identityIssuedDate}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Nơi cấp CCCD
              </label>
              <input
                type="text"
                name="identityIssuedPlace"
                value={formData.identityIssuedPlace}
                onChange={handleChange}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Quê quán / Địa chỉ thường trú (ghi trên CCCD)
              </label>
              <input
                type="text"
                name="address"
                placeholder="VD: Xã Yên Phong, Huyện Yên Phong, Tỉnh Bắc Ninh"
                value={formData.address}
                onChange={handleChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Nơi ở hiện tại / Địa chỉ liên hệ
              </label>
              <input
                type="text"
                name="currentAddress"
                placeholder="VD: Phòng trọ số 101, Nhà trọ số 123 Cầu Giấy, Hà Nội"
                value={formData.currentAddress}
                onChange={handleChange}
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
        </div>

        {/* Phần 3: Ảnh chụp CCCD (Mặt trước / Mặt sau) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '28px'
        }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🖼️</span> Ảnh Chụp Căn Cước Công Dân (2 Mặt)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
            Tải lên link ảnh chụp 2 mặt CCCD rõ nét để Chủ trọ đối soát pháp lý khi làm hợp đồng và khai báo tạm trú.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Mặt trước */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Link ảnh mặt trước CCCD:
              </label>
              <input
                type="text"
                name="identityCardFront"
                placeholder="VD: https://images.unsplash.com/photo-..."
                value={formData.identityCardFront}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  marginBottom: '10px'
                }}
              />
              <div style={{
                height: '160px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {formData.identityCardFront ? (
                  <img
                    src={formData.identityCardFront}
                    alt="CCCD Mặt trước"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có ảnh mặt trước</span>
                )}
              </div>
            </div>

            {/* Mặt sau */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Link ảnh mặt sau CCCD:
              </label>
              <input
                type="text"
                name="identityCardBack"
                placeholder="VD: https://images.unsplash.com/photo-..."
                value={formData.identityCardBack}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  marginBottom: '10px'
                }}
              />
              <div style={{
                height: '160px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {formData.identityCardBack ? (
                  <img
                    src={formData.identityCardBack}
                    alt="CCCD Mặt sau"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có ảnh mặt sau</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nút Submit Form */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            {saving ? '⏳ Đang lưu hồ sơ...' : '💾 Lưu Thay Đổi Hồ Sơ Cá Nhân'}
          </button>
        </div>
      </form>
    </div>
  );
}
