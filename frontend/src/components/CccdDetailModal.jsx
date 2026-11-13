import React from 'react';

/**
 * Modal hiển thị Căn Cước Công Dân (CCCD) gắn chip chi tiết
 * Sử dụng được cho cả Khách thuê, Nhân viên và Quản lý
 */
export default function CccdDetailModal({ person, request, target: propTarget, onClose }) {
  const target = propTarget || person || request;
  if (!target) return null;

  // Hỗ trợ cả object person từ User, RentalRequest, hoặc Contract
  const fullName = target.tenantName || target.fullName || target.name || 'Chưa cập nhật';
  const phone = target.tenantPhone || target.phone || 'Chưa cập nhật';
  const idNum = target.tenantIdentityNumber || target.identityNumber || target.cccd || 'Chưa cập nhật';
  const dob = target.tenantDateOfBirth || target.dateOfBirth;
  const gender = target.tenantGender || target.gender;
  const hometown = target.tenantHometown || target.hometown || '';
  const permanentAddress = target.tenantAddress || target.address || target.tenantHometown || target.hometown || 'Chưa cập nhật';
  const currentAddress = target.tenantCurrentAddress || target.currentAddress || 'Chưa cập nhật';
  const issuedDate = target.tenantIdentityIssuedDate || target.identityIssuedDate;
  const issuedPlace = target.tenantIdentityIssuedPlace || target.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header Căn cước kiểu thẻ chip chuẩn */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #fbbf24'
        }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '1px', color: '#fef08a', textTransform: 'uppercase', fontWeight: 'bold' }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div style={{ fontSize: '11px', color: '#e0e7ff', fontStyle: 'italic', marginBottom: '4px' }}>
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🪪</span> CĂN CƯỚC CÔNG DÂN / IDENTITY CARD
            </div>
          </div>
          <button
            onClick={onClose}
            title="Đóng"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Thân thẻ CCCD */}
        <div style={{ padding: '24px' }}>
          {/* Chip điện tử & Số định danh */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '28px',
                backgroundColor: '#f59e0b',
                borderRadius: '5px',
                border: '1px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                CHIP
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Số / No.:
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '2px', fontFamily: 'monospace' }}>
                  {idNum}
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: idNum && idNum.length === 12 ? '#dcfce7' : '#fee2e2',
              color: idNum && idNum.length === 12 ? '#166534' : '#991b1b',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {idNum && idNum.length === 12 ? '✓ 12 SỐ HỢP LỆ' : '⚠️ CHƯA ĐỦ 12 SỐ'}
            </div>
          </div>

          {/* Chi tiết nhân thân */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 16px',
            fontSize: '13px',
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Họ và tên / Full name:</span>
              <strong style={{ color: '#1e293b', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {fullName}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Ngày sinh / Date of birth:</span>
              <strong style={{ color: '#1e293b' }}>
                {dob ? new Date(dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Giới tính / Sex:</span>
              <strong style={{ color: '#1e293b' }}>
                {gender === 'MALE' ? 'Nam / Male' : gender === 'FEMALE' ? 'Nữ / Female' : 'Khác'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Quốc tịch / Nationality:</span>
              <strong style={{ color: '#1e293b' }}>Việt Nam</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Số điện thoại liên hệ:</span>
              <strong style={{ color: '#2563eb' }}>{phone}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Quê quán / Địa chỉ thường trú (ghi trên CCCD):</span>
              <strong style={{ color: '#0f172a' }}>{permanentAddress}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Nơi ở hiện tại / Địa chỉ liên hệ:</span>
              <strong style={{ color: '#0f172a' }}>{currentAddress}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Ngày cấp / Date of issue:</span>
              <strong style={{ color: '#1e293b' }}>
                {issuedDate ? new Date(issuedDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>Nơi cấp / Place of issue:</span>
              <strong style={{ color: '#1e293b' }}>{issuedPlace}</strong>
            </div>
          </div>

          {/* Footer nút bấm */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              🔒 Hồ sơ định danh khách thuê được bảo mật theo luật
            </span>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '9px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Đóng xem thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
