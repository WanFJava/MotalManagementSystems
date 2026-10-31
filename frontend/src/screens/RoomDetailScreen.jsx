import React, { useState, useEffect } from 'react';
import { rentalRequestClientService } from '../services/rentalRequestClientService';

/**
 * Màn hình Chi tiết Phòng Trọ & Đặt Giữ Phòng (RoomDetailScreen)
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (kết hợp UC03 Đặt phòng)
 * Nghiệp vụ bắt buộc: Khách thuê bắt buộc phải cập nhật đầy đủ thông tin CCCD và định danh mới được gửi yêu cầu thuê
 */
export default function RoomDetailScreen({ room, onBack, onRentalRequestSuccess, currentUser, setCurrentScreen }) {
  const [selectedImage, setSelectedImage] = useState(room?.images?.[0] || '');
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // Form yêu cầu thuê phòng với đầy đủ thông tin CCCD bắt buộc
  const [rentalForm, setRentalForm] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    identityNumber: currentUser?.identityNumber || '',
    identityIssuedDate: currentUser?.identityIssuedDate ? currentUser.identityIssuedDate.slice(0, 10) : '',
    identityIssuedPlace: currentUser?.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
    dateOfBirth: currentUser?.dateOfBirth ? currentUser.dateOfBirth.slice(0, 10) : '',
    gender: currentUser?.gender || 'MALE',
    hometown: currentUser?.hometown || '',
    currentAddress: currentUser?.currentAddress || '',
    moveInDate: '',
    note: ''
  });

  useEffect(() => {
    if (currentUser) {
      setRentalForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        phone: prev.phone || currentUser.phone || '',
        email: prev.email || currentUser.email || '',
        identityNumber: prev.identityNumber || currentUser.identityNumber || '',
        hometown: prev.hometown || currentUser.hometown || '',
        currentAddress: prev.currentAddress || currentUser.currentAddress || currentUser.address || '',
        dateOfBirth: prev.dateOfBirth || (currentUser.dateOfBirth ? currentUser.dateOfBirth.slice(0, 10) : ''),
        gender: prev.gender || currentUser.gender || 'MALE',
        identityIssuedDate: prev.identityIssuedDate || (currentUser.identityIssuedDate ? currentUser.identityIssuedDate.slice(0, 10) : ''),
        identityIssuedPlace: prev.identityIssuedPlace || currentUser.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH'
      }));
    }
  }, [currentUser]);

  if (!room) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Không tìm thấy dữ liệu phòng</h3>
        <button onClick={onBack} style={{ padding: '8px 16px', cursor: 'pointer' }}>Quay lại</button>
      </div>
    );
  }

  const isAvailable = room.status === 'AVAILABLE';

  // Xử lý gửi yêu cầu thuê phòng - Bắt buộc đầy đủ thông tin theo CCCD
  const handleSubmitRental = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Vui lòng đăng nhập bằng tài khoản Khách thuê trước khi gửi yêu cầu giữ phòng!');
      if (setCurrentScreen) setCurrentScreen('auth');
      return;
    }

    // Kiểm tra tính đầy đủ của tất cả các trường CCCD
    const missing = [];
    if (!rentalForm.fullName?.trim()) missing.push('Họ và tên');
    if (!rentalForm.phone?.trim()) missing.push('Số điện thoại');
    if (!rentalForm.identityNumber?.trim()) missing.push('Số CCCD (12 chữ số)');
    if (!rentalForm.dateOfBirth) missing.push('Ngày sinh');
    if (!rentalForm.identityIssuedDate) missing.push('Ngày cấp CCCD');
    if (!rentalForm.identityIssuedPlace?.trim()) missing.push('Nơi cấp CCCD');
    if (!rentalForm.hometown?.trim()) missing.push('Quê quán');
    if (!rentalForm.currentAddress?.trim()) missing.push('Địa chỉ thường trú theo CCCD');
    if (!rentalForm.moveInDate) missing.push('Ngày dự kiến dọn vào');

    if (missing.length > 0) {
      alert(`⚠️ BẮT BUỘC ĐỊNH DANH CCCD:\nVui lòng nhập đầy đủ các trường thông tin theo Căn cước công dân:\n- ${missing.join('\n- ')}`);
      return;
    }

    if (!/^\d{9,12}$/.test(rentalForm.identityNumber.trim())) {
      alert('Số CCCD không hợp lệ! Vui lòng nhập từ 9 đến 12 chữ số.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        userId: currentUser._id,
        roomId: room._id,
        tenantName: rentalForm.fullName.trim(),
        tenantPhone: rentalForm.phone.trim(),
        identityNumber: rentalForm.identityNumber.trim(),
        identityIssuedDate: rentalForm.identityIssuedDate || null,
        identityIssuedPlace: rentalForm.identityIssuedPlace.trim(),
        dateOfBirth: rentalForm.dateOfBirth || null,
        gender: rentalForm.gender,
        hometown: rentalForm.hometown.trim(),
        currentAddress: rentalForm.currentAddress.trim(),
        expectedMoveInDate: rentalForm.moveInDate,
        note: rentalForm.note
      };

      const res = await rentalRequestClientService.createRequest(payload);
      setSuccessInfo(res.data);

      // Cập nhật lại thông tin user trong LocalStorage với toàn bộ thông tin CCCD vừa nhập
      const storedUser = JSON.parse(localStorage.getItem('motel_user') || '{}');
      const updatedUser = {
        ...storedUser,
        fullName: rentalForm.fullName.trim(),
        phone: rentalForm.phone.trim(),
        identityNumber: rentalForm.identityNumber.trim(),
        dateOfBirth: rentalForm.dateOfBirth,
        gender: rentalForm.gender,
        identityIssuedDate: rentalForm.identityIssuedDate,
        identityIssuedPlace: rentalForm.identityIssuedPlace.trim(),
        hometown: rentalForm.hometown.trim(),
        currentAddress: rentalForm.currentAddress.trim(),
        address: rentalForm.currentAddress.trim()
      };
      localStorage.setItem('motel_user', JSON.stringify(updatedUser));

      if (onRentalRequestSuccess) {
        onRentalRequestSuccess(res.message);
      }
    } catch (err) {
      alert('Gửi yêu cầu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Quay lại danh sách phòng
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Column: Photos & Details */}
        <div>
          {/* Main Photo */}
          <div style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#f1f5f9',
            height: '350px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            marginBottom: '12px'
          }}>
            <img
              src={selectedImage || room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
              alt={`Phòng ${room.roomNumber}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: isAvailable ? '#16a34a' : room.status === 'RENTED' ? '#dc2626' : '#d97706',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {isAvailable ? '🟢 Còn trống' : room.status === 'RENTED' ? '🔴 Đã cho thuê' : '🟡 Đang bảo trì'}
            </span>
          </div>

          {/* Thumbnail Gallery */}
          {room.images && room.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }}>
              {room.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    opacity: selectedImage === img ? 1 : 0.7
                  }}
                />
              ))}
            </div>
          )}

          {/* Room Specs */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '24px'
          }}>
            <h1 style={{ fontSize: '26px', color: '#1e293b', margin: '0 0 8px 0' }}>
              Phòng {room.roomNumber}
            </h1>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', marginBottom: '20px' }}>
              {Number(room.basePrice).toLocaleString('vi-VN')} đ/tháng
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Diện tích</span>
                <strong style={{ fontSize: '16px', color: '#1e293b' }}>📐 {room.area || 20} m²</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Sức chứa tối đa</span>
                <strong style={{ fontSize: '16px', color: '#1e293b' }}>👥 {room.maxOccupants || 2} người</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Trạng thái</span>
                <strong style={{ fontSize: '16px', color: isAvailable ? '#16a34a' : '#dc2626' }}>
                  {isAvailable ? 'Sẵn sàng ở' : room.status}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1e293b' }}>Mô tả chi tiết:</h4>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                {room.description || 'Chưa có thông tin mô tả chi tiết cho phòng trọ này.'}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1e293b' }}>Tiện ích đi kèm:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {room.amenities && room.amenities.length > 0 ? (
                  room.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      ✓ {item}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Chưa cập nhật tiện ích</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Thuê Phòng Bắt Buộc CCCD */}
        <div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '18px' }}>
              📝 Đăng Ký Thuê / Giữ Chỗ Phòng {room.roomNumber}
            </h3>
            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '13px' }}>
              Điền thông tin định danh và ngày dọn vào để ban quản lý xem xét và duyệt phòng cho bạn.
            </p>

            {successInfo ? (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '24px 20px',
                textAlign: 'center',
                color: '#15803d'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Đã Gửi Yêu Cầu Thuê Thành Công!</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '14px', lineHeight: '1.5', color: '#166534' }}>
                  Yêu cầu giữ phòng <strong>{room.roomNumber}</strong> của bạn đã được chuyển tới ban quản trị.
                </p>

                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  textAlign: 'left',
                  marginBottom: '20px',
                  border: '1px solid #dcfce7'
                }}>
                  <div>Mã yêu cầu: <strong>#{successInfo._id || successInfo.requestId}</strong></div>
                  <div>Khách thuê: <strong>{rentalForm.fullName}</strong></div>
                  <div>Số CCCD: <strong>{rentalForm.identityNumber}</strong></div>
                  <div>Trạng thái: <strong>🟡 Đang chờ duyệt</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentScreen && setCurrentScreen('my-requests')}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  >
                    📋 Xem lại trạng thái yêu cầu của tôi
                  </button>
                  <button
                    onClick={() => setSuccessInfo(null)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Gửi yêu cầu giữ phòng khác
                  </button>
                </div>
              </div>
            ) : !isAvailable ? (
              <div style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #ffedd5',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: '#9a3412'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
                <h4 style={{ margin: '0 0 6px 0' }}>Phòng Hiện Không Sẵn Sàng Để Thuê!</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Phòng này hiện đang ở trạng thái <strong>{room.status === 'RENTED' ? 'Đã có khách thuê' : 'Đang sửa chữa/bảo trì'}</strong>. Vui lòng chọn các phòng có trạng thái <strong>Còn trống (AVAILABLE)</strong> để gửi yêu cầu.
                </p>
              </div>
            ) : !currentUser ? (
              /* Yêu cầu đăng nhập trước khi gửi yêu cầu thuê */
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '24px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e40af' }}>
                  Yêu Cầu Đăng Nhập Tài Khoản Khách Thuê
                </h4>
                <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#3b82f6', lineHeight: '1.5' }}>
                  Để đảm bảo tính xác thực thông tin và theo dõi tiến độ xét duyệt hợp đồng, bạn cần đăng nhập tài khoản Khách thuê trước khi gửi yêu cầu giữ phòng.
                </p>
                <button
                  onClick={() => setCurrentScreen && setCurrentScreen('auth')}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  🔑 Đăng nhập / Đăng ký ngay
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRental}>
                {/* Banner cảnh báo bắt buộc CCCD */}
                <div style={{
                  backgroundColor: rentalForm.identityNumber ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${rentalForm.identityNumber ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: rentalForm.identityNumber ? '#15803d' : '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{rentalForm.identityNumber ? '✅' : '⚠️'}</span>
                  <div>
                    {rentalForm.identityNumber ? (
                      <span>Hồ sơ đã ghi nhận CCCD: <strong>{rentalForm.identityNumber}</strong>. Vui lòng kiểm tra lại thông tin bên dưới.</span>
                    ) : (
                      <span><strong>BẮT BUỘC:</strong> Bạn phải điền đầy đủ số CCCD (12 số) và Quê quán theo đúng quy định để ban quản lý đăng ký tạm trú!</span>
                    )}
                  </div>
                </div>

                {/* 1. Thông tin liên hệ cơ bản */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Họ và tên của bạn: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phạm Văn Khánh"
                    value={rentalForm.fullName}
                    onChange={(e) => setRentalForm({ ...rentalForm, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Số điện thoại: *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={rentalForm.phone}
                      onChange={(e) => setRentalForm({ ...rentalForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Email liên hệ:
                    </label>
                    <input
                      type="email"
                      placeholder="VD: khanh@gmail.com"
                      value={rentalForm.email}
                      onChange={(e) => setRentalForm({ ...rentalForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* 2. KHỐI THÔNG TIN CCCD BẮT BUỘC */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🪪</span> THÔNG TIN CĂN CƯỚC CÔNG DÂN (BẮT BUỘC)
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Số thẻ CCCD / Hộ chiếu (12 chữ số): *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="Nhập 12 chữ số CCCD (VD: 001202008899)"
                      value={rentalForm.identityNumber}
                      onChange={(e) => setRentalForm({ ...rentalForm, identityNumber: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: rentalForm.identityNumber ? '1px solid #cbd5e1' : '1px solid #f59e0b',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontWeight: '600'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Ngày sinh (theo CCCD): *
                      </label>
                      <input
                        type="date"
                        required
                        value={rentalForm.dateOfBirth}
                        onChange={(e) => setRentalForm({ ...rentalForm, dateOfBirth: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: rentalForm.dateOfBirth ? '1px solid #cbd5e1' : '1px solid #f59e0b',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Giới tính: *
                      </label>
                      <select
                        value={rentalForm.gender}
                        onChange={(e) => setRentalForm({ ...rentalForm, gender: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Ngày cấp CCCD: *
                      </label>
                      <input
                        type="date"
                        required
                        value={rentalForm.identityIssuedDate}
                        onChange={(e) => setRentalForm({ ...rentalForm, identityIssuedDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: rentalForm.identityIssuedDate ? '1px solid #cbd5e1' : '1px solid #f59e0b',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Nơi cấp CCCD: *
                      </label>
                      <input
                        type="text"
                        required
                        value={rentalForm.identityIssuedPlace}
                        onChange={(e) => setRentalForm({ ...rentalForm, identityIssuedPlace: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Quê quán (theo CCCD): *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Xã Yên Cường, Huyện Ý Yên, Tỉnh Nam Định"
                      value={rentalForm.hometown}
                      onChange={(e) => setRentalForm({ ...rentalForm, hometown: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Địa chỉ thường trú / hiện tại: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Xã Yên Cường, Ý Yên, Nam Định"
                      value={rentalForm.currentAddress}
                      onChange={(e) => setRentalForm({ ...rentalForm, currentAddress: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* 3. Ngày dọn vào & Ghi chú */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Ngày dự kiến chuyển vào ở: *
                  </label>
                  <input
                    type="date"
                    required
                    value={rentalForm.moveInDate}
                    onChange={(e) => setRentalForm({ ...rentalForm, moveInDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Ghi chú thêm cho chủ trọ:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Em muốn hẹn qua xem phòng vào chiều thứ 7..."
                    value={rentalForm.note}
                    onChange={(e) => setRentalForm({ ...rentalForm, note: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 10px rgba(22,163,74,0.2)'
                  }}
                >
                  {submitting ? '⏳ Đang xác thực & gửi yêu cầu...' : '🚀 Xác Nhận Gửi Yêu Cầu Thuê Phòng'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
