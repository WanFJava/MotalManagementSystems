import React, { useState } from 'react';
import { roomClientService } from '../services/roomClientService';

export default function RoomDetailScreen({ room, onBack, onRentalRequestSuccess }) {
  const [selectedImage, setSelectedImage] = useState(room?.images?.[0] || '');
  const [rentalForm, setRentalForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    moveInDate: '',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  if (!room) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Không tìm thấy dữ liệu phòng</h3>
        <button onClick={onBack} style={{ padding: '8px 16px', cursor: 'pointer' }}>Quay lại</button>
      </div>
    );
  }

  const isAvailable = room.status === 'AVAILABLE';

  const handleSubmitRental = async (e) => {
    e.preventDefault();
    if (!rentalForm.fullName || !rentalForm.phone) {
      alert('Vui lòng điền Họ tên và Số điện thoại liên hệ!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await roomClientService.submitRentalRequest(room._id, rentalForm);
      setSuccessInfo(res.data);
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
          ← Quay lại danh sách
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
              fontSize: '13px',
              fontWeight: '700',
              padding: '6px 14px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {isAvailable ? '🟢 Còn trống' : room.status === 'RENTED' ? '🔴 Đã thuê' : '🛠️ Đang bảo trì'}
            </span>
          </div>

          {/* Photo Thumbnails */}
          {room.images && room.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {room.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '70px',
                    height: '55px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid #2563eb' : '2px solid transparent',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Room Description & Overview */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '26px', color: '#1e293b' }}>
                Phòng Trọ Số {room.roomNumber}
              </h2>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>
                {room.basePrice?.toLocaleString('vi-VN')} đ
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}> /tháng</span>
              </div>
            </div>

            {/* Quick badges */}
            <div style={{ display: 'flex', gap: '16px', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155' }}>
                <span>📐</span> <strong>{room.area || 20} m²</strong> diện tích
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155' }}>
                <span>👥</span> Tối đa <strong>{room.maxOccupants || 2} người</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155' }}>
                <span>🕒</span> Giờ giấc tự do
              </div>
            </div>

            {/* Description */}
            <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Mô tả chi tiết:</h4>
            <p style={{ margin: '0 0 20px 0', color: '#475569', lineHeight: '1.6', fontSize: '14px' }}>
              {room.description || 'Phòng trọ đầy đủ tiện nghi, sạch sẽ thoáng mát, giờ giấc tự do không chung chủ, hệ thống camera an ninh 24/7.'}
            </p>

            {/* Amenities Grid */}
            <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Tiện ích phòng có sẵn:</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px'
            }}>
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> {item}
                  </div>
                ))
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Không có tiện ích ghi nhận</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Request Rental Form */}
        <div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
              📝 Gửi Yêu Cầu Thuê / Giữ Phòng
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>
              Điền thông tin bên dưới để gửi yêu cầu giữ phòng {room.roomNumber}. Quản lý sẽ liên hệ hẹn xem phòng trong 24h.
            </p>

            {successInfo ? (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '20px',
                color: '#166534',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎉</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Gửi Yêu Cầu Thành Công!</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                  {successInfo.message}
                </p>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', fontSize: '12px', border: '1px solid #dcfce7', textAlign: 'left' }}>
                  <strong>Mã yêu cầu:</strong> {successInfo.requestId}<br/>
                  <strong>Phòng:</strong> {successInfo.room?.roomNumber}<br/>
                  <strong>Người gửi:</strong> {successInfo.tenant?.fullName} ({successInfo.tenant?.phone})<br/>
                  <strong>Trạng thái:</strong> Chờ quản lý liên hệ
                </div>
                <button
                  onClick={() => setSuccessInfo(null)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                >
                  Gửi yêu cầu khác
                </button>
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
            ) : (
              <form onSubmit={handleSubmitRental}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Họ và tên của bạn: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={rentalForm.fullName}
                    onChange={(e) => setRentalForm({ ...rentalForm, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Số điện thoại liên hệ: *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={rentalForm.phone}
                    onChange={(e) => setRentalForm({ ...rentalForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Email (nếu có):
                  </label>
                  <input
                    type="email"
                    placeholder="VD: email@example.com"
                    value={rentalForm.email}
                    onChange={(e) => setRentalForm({ ...rentalForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Ngày dự kiến chuyển vào ở:
                  </label>
                  <input
                    type="date"
                    value={rentalForm.moveInDate}
                    onChange={(e) => setRentalForm({ ...rentalForm, moveInDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Ghi chú / Yêu cầu thêm:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Em nuôi 1 chú mèo ngoan, muốn hẹn xem phòng vào thứ 7 tuần này..."
                    value={rentalForm.note}
                    onChange={(e) => setRentalForm({ ...rentalForm, note: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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
                  {submitting ? '⏳ Đang gửi yêu cầu...' : '🚀 Gửi Yêu Cầu Giữ Phòng'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
