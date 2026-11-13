import React, { useState, useEffect } from 'react';
import { contractClientService } from '../services/contractClientService';
import { roomClientService } from '../services/roomClientService';
import axios from 'axios';

/**
 * Màn hình Thông Tin Phòng Đang Thuê (Dành cho Khách thuê - Tenant)
 * Cho phép khách theo dõi thông tin phòng, tiện ích, hợp đồng hiệu lực & chủ trọ
 */
export default function MyRoomScreen({ currentUser, setCurrentScreen, onNotify }) {
  const [loading, setLoading] = useState(true);
  const [activeContract, setActiveContract] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [latestUtility, setLatestUtility] = useState(null);

  useEffect(() => {
    fetchMyRoomData();
  }, [currentUser]);

  const fetchMyRoomData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const tenantId = currentUser._id || currentUser.id;
      // 1. Tìm tất cả hợp đồng của khách thuê
      const contracts = await contractClientService.getAllContracts({
        tenantId,
        tenantPhone: currentUser.phone,
        tenantIdentityNumber: currentUser.identityNumber
      });

      // Lọc các hợp đồng thuộc về khách thuê
      const myContracts = contracts.filter((c) => {
        const cTenantId = c.tenantId?._id || c.tenantId;
        const matchId = cTenantId && tenantId && cTenantId.toString() === tenantId.toString();
        const matchPhone = currentUser.phone && c.tenantPhone === currentUser.phone;
        const matchCccd = currentUser.identityNumber && (c.tenantCccd === currentUser.identityNumber || c.tenantIdentityNumber === currentUser.identityNumber);
        const matchName = currentUser.fullName && c.tenantName && c.tenantName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
        return matchId || matchPhone || matchCccd || matchName;
      });

      // Ưu tiên hợp đồng ACTIVE, nếu chưa có thì lấy hợp đồng mới nhất
      const active = myContracts.find((c) => c.status === 'ACTIVE') || myContracts[0];

      if (active) {
        setActiveContract(active);
        const roomObj = (active.room && typeof active.room === 'object') ? active.room :
                        (active.roomId && typeof active.roomId === 'object') ? active.roomId : null;
        if (roomObj && roomObj.roomNumber) {
          setRoomDetail(roomObj);
        }

        const rawRoomId = roomObj?._id || active.roomId || active.room;
        if (rawRoomId) {
          const actualRoomId = typeof rawRoomId === 'object' ? rawRoomId._id : rawRoomId;
          try {
            const roomData = await roomClientService.getRoomById(actualRoomId);
            if (roomData) setRoomDetail(roomData);
          } catch (e) {
            console.error('Lỗi tải thông tin phòng:', e);
          }

          // Lấy chỉ số điện nước mới nhất của phòng
          try {
            const res = await axios.get(`http://localhost:5000/api/utilities?roomId=${actualRoomId}`);
            const utilities = res.data?.data || [];
            if (utilities.length > 0) {
              setLatestUtility(utilities[0]);
            }
          } catch (e) {
            console.error('Lỗi tải chỉ số điện nước:', e);
          }
        }
      } else if (currentUser.currentRoom) {
        // Fallback nếu có currentRoom trong hồ sơ
        const roomId = currentUser.currentRoom._id || currentUser.currentRoom;
        const roomData = await roomClientService.getRoomById(roomId);
        if (roomData) setRoomDetail(roomData);
      }
    } catch (err) {
      console.error('Lỗi tải thông tin phòng đang thuê:', err);
      if (onNotify) onNotify('Không thể tải dữ liệu phòng đang thuê!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return d;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
        <div>Đang tải thông tin phòng đang thuê của bạn...</div>
      </div>
    );
  }

  // Nếu khách chưa có phòng thuê hoặc hợp đồng
  if (!activeContract && !roomDetail) {
    return (
      <div style={{
        maxWidth: '650px',
        margin: '50px auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px 30px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '54px', marginBottom: '16px' }}>🛏️</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
          Bạn Hiện Chưa Có Phòng Đang Thuê
        </h2>
        <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '24px' }}>
          Bạn chưa kích hoạt hợp đồng thuê phòng nào trong hệ thống. Hãy duyệt qua danh sách các phòng trống đang có sẵn để chọn phòng ưng ý và gửi yêu cầu giữ phòng ngay!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentScreen('rooms')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔍 Khám Phá Phòng Trống Ngay
          </button>
          <button
            onClick={() => setCurrentScreen('my-requests')}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#1e3a8a',
              border: '1px solid #cbd5e1',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📋 Xem Yêu Cầu Đã Gửi
          </button>
        </div>
      </div>
    );
  }

  const room = roomDetail || activeContract?.room || activeContract?.roomId;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & Shortcut */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🏠 Phòng Đang Thuê: {room?.roomNumber || 'Phòng Của Tôi'}
            </h1>
            <span style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              border: '1px solid #bbf7d0',
              fontSize: '12px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px'
            }}>
              🟢 Đang Thuê (Hợp Đồng Hiệu Lực)
            </span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Thông tin chi tiết về căn phòng, tiện ích, hợp đồng thuê phòng và người cho thuê (Bên A).
          </p>
        </div>

        {/* Nút thao tác nhanh chuyển sang Hóa đơn & Hợp đồng */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentScreen('my-invoices')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}
          >
            🧾 Xem Hóa Đơn & Đóng Tiền VNPay
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('my-contracts')}
            style={{
              backgroundColor: '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 Toàn Văn Hợp Đồng
          </button>
        </div>
      </div>

      {/* Grid 2 cột: Cột trái (Thông tin phòng & Tiện ích) - Cột phải (Hợp đồng & Chủ trọ) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* CỘT TRÁI: THÔNG TIN PHÒNG & CHỈ SỐ ĐIỆN NƯỚC */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card Thông số phòng */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            {/* Ảnh phòng nếu có */}
            {room?.images && room.images.length > 0 ? (
              <img
                src={room.images[0]}
                alt={`Phòng ${room.roomNumber}`}
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                height: '140px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#3b82f6'
              }}>
                🛏️
              </div>
            )}

            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
                Phòng Số: {room?.roomNumber}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Giá thuê hợp đồng:</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>
                    {formatCurrency(activeContract?.rentalPrice || room?.basePrice)}/tháng
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Diện tích phòng:</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                    {room?.area || 25} m²
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Tầng:</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    Tầng {room?.floor || 1}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Số người tối đa:</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    {room?.maxOccupants || 2} người
                  </div>
                </div>
              </div>

              {/* Tiện ích có sẵn trong phòng */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  ✨ Tiện ích phòng trang bị:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(room?.amenities || ['Điều hòa', 'Nóng lạnh', 'Wifi tốc độ cao', 'Giờ giấc tự do']).map((am, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#1e293b',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: '500',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Địa chỉ cơ sở */}
              <div style={{ fontSize: '13px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                📍 <strong>Địa chỉ khu trọ:</strong> {room?.address || 'Tòa nhà Motel Management System, Cầu Giấy, Hà Nội'}
              </div>
            </div>
          </div>

          {/* Card Chỉ số Điện Nước tháng gần nhất */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> Chỉ Số Điện & Nước Gần Nhất
            </h3>

            {latestUtility ? (
              <div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                  Kỳ ghi nhận gần nhất: <strong>Tháng {latestUtility.month}</strong> (Ghi ngày {formatDate(latestUtility.readingDate)})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  <div style={{ border: '1px solid #fed7aa', backgroundColor: '#fff7ed', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 'bold' }}>⚡ ĐIỆN SINH HOẠT</div>
                    <div style={{ fontSize: '13px', color: '#7c2d12', marginTop: '4px' }}>
                      Cũ: <strong>{latestUtility.oldElec}</strong> ➔ Mới: <strong>{latestUtility.newElec}</strong>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#ea580c', marginTop: '4px' }}>
                      Tiêu thụ: {latestUtility.electricUsage || (latestUtility.newElec - latestUtility.oldElec)} kWh
                    </div>
                  </div>

                  <div style={{ border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 'bold' }}>💧 NƯỚC SINH HOẠT</div>
                    <div style={{ fontSize: '13px', color: '#0c4a6e', marginTop: '4px' }}>
                      Cũ: <strong>{latestUtility.oldWater}</strong> ➔ Mới: <strong>{latestUtility.newWater}</strong>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                      Tiêu thụ: {latestUtility.waterUsage || (latestUtility.newWater - latestUtility.oldWater)} m³
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                Chưa có chỉ số điện nước được chốt cho kỳ gần nhất.
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: HỢP ĐỒNG HIỆU LỰC & BÊN CHO THUÊ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card Hợp đồng hiệu lực */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📄</span> Hợp Đồng Thuê Phòng Đang Hiệu Lực
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Mã hợp đồng:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{activeContract?.contractCode || activeContract?._id}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Ngày bắt đầu thuê:</span>
                <span style={{ fontWeight: '600' }}>{formatDate(activeContract?.startDate)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Ngày kết thúc hợp đồng:</span>
                <span style={{ fontWeight: '600' }}>{formatDate(activeContract?.endDate)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Tiền cọc phòng đã đóng:</span>
                <span style={{ fontWeight: '800', color: '#16a34a' }}>{formatCurrency(activeContract?.depositAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Chữ ký điện tử Bên B:</span>
                <span style={{ fontWeight: '700', color: '#166534' }}>
                  ✓ {activeContract?.tenantSignature || currentUser?.fullName} ({formatDate(activeContract?.tenantSignedAt)})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ color: '#64748b' }}>Trạng thái hợp đồng:</span>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  ● ACTIVE (Đang có hiệu lực)
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setCurrentScreen('my-contracts')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#1e3a8a',
                  border: '1px solid #cbd5e1',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                🔍 Xem Chi Tiết & Tải Hợp Đồng (PDF)
              </button>
            </div>
          </div>

          {/* Card Thông tin Bên Cho Thuê (Chủ trọ / Quản lý) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤</span> Thông Tin Bên Cho Thuê (Chủ Trọ / Bên A)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Họ và tên đại diện:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                  {activeContract?.landlordName || 'Lê Văn An (Quản lý nhà trọ)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Số điện thoại liên hệ:</span>
                <a
                  href={`tel:${activeContract?.landlordPhone || '0901234567'}`}
                  style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}
                >
                  📞 {activeContract?.landlordPhone || '0901234567'}
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Số CCCD Bên A:</span>
                <span style={{ fontWeight: '600' }}>
                  {activeContract?.landlordCccd ? `${activeContract.landlordCccd.slice(0, 4)}****${activeContract.landlordCccd.slice(-4)}` : '001202008899'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: '#64748b' }}>Địa chỉ liên hệ:</span>
                <span style={{ fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>
                  {activeContract?.landlordCurrentAddress || activeContract?.landlordAddress || 'Tòa nhà Quản lý, Cầu Giấy, Hà Nội'}
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#1e40af',
              lineHeight: '1.5'
            }}>
              💡 <strong>Lưu ý hỗ trợ:</strong> Khi gặp sự cố điện nước, thiết bị hư hỏng hoặc cần gia hạn hợp đồng, bạn hãy liên hệ trực tiếp số điện thoại trên để được hỗ trợ nhanh nhất.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
