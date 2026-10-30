import React from 'react';

export default function HomeScreen({ rooms, loading, onSelectRoom, setCurrentScreen }) {
  const total = rooms.length;
  const available = rooms.filter(r => r.status === 'AVAILABLE').length;
  const rented = rooms.filter(r => r.status === 'RENTED').length;
  const maintenance = rooms.filter(r => r.status === 'MAINTENANCE').length;

  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').slice(0, 3);

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '36px 32px',
        marginBottom: '32px',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            marginBottom: '14px'
          }}>
            ✨ TIỆN NGHI • AN NINH • GIỜ GIẤC TỰ DO
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.25' }}>
            Hệ Thống Quản Lý Phòng Trọ Thông Minh
          </h1>
          <p style={{ fontSize: '16px', color: '#e0f2fe', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Khám phá các không gian sống tiện nghi, sạch sẽ và an toàn. Tìm kiếm phòng theo mức giá mong muốn, xem thông số chi tiết và gửi yêu cầu giữ phòng nhanh chóng.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentScreen('rooms')}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 22px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              🛏️ Xem danh sách phòng
            </button>
            <button
              onClick={() => setCurrentScreen('search')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                padding: '11px 22px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔍 Tìm kiếm & Lọc phòng
            </button>
            <button
              onClick={() => setCurrentScreen('manage')}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 22px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ⚙️ Quản lý phòng
            </button>
          </div>
        </div>
      </div>

      {/* Thống kê nhanh / KPI Cards */}
      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 Tổng Quan Phòng Trọ
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '36px'
      }}>
        {/* Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Tổng số phòng</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a8a', marginTop: '4px' }}>
              {loading ? '...' : total}
            </div>
          </div>
          <div style={{ fontSize: '32px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
            🏢
          </div>
        </div>

        {/* Available */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #dcfce7',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>Phòng còn trống</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>
              {loading ? '...' : available}
            </div>
          </div>
          <div style={{ fontSize: '32px', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '12px' }}>
            🟢
          </div>
        </div>

        {/* Rented */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #fee2e2',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500' }}>Đang cho thuê</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#b91c1c', marginTop: '4px' }}>
              {loading ? '...' : rented}
            </div>
          </div>
          <div style={{ fontSize: '32px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '12px' }}>
            🔴
          </div>
        </div>

        {/* Maintenance */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #fef3c7',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>Đang bảo trì</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
              {loading ? '...' : maintenance}
            </div>
          </div>
          <div style={{ fontSize: '32px', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
            🛠️
          </div>
        </div>
      </div>

      {/* Phòng trống nổi bật */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>
              🌟 Phòng Còn Trống Sẵn Sàng Chuyển Vào
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
              Các phòng trống tiêu biểu có thể đăng ký giữ phòng hoặc thuê ngay hôm nay
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('rooms')}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#1e3a8a',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Xem tất cả ({rooms.length}) →
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>Đang tải danh sách phòng...</p>
        ) : availableRooms.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
            Hiện tại tất cả các phòng đã được thuê hoặc đang bảo trì!
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {availableRooms.map((room) => (
              <div
                key={room._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                    alt={`Phòng ${room.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '20px'
                  }}>
                    Còn trống
                  </span>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                      Phòng {room.roomNumber}
                    </h4>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb' }}>
                      {room.basePrice?.toLocaleString('vi-VN')} đ
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>/tháng</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', display: 'flex', gap: '14px' }}>
                    <span>📐 {room.area || 20} m²</span>
                    <span>👥 Tối đa {room.maxOccupants || 2} người</span>
                  </div>

                  {/* Amenities tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {room.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}>
                        ✓ {amenity}
                      </span>
                    ))}
                    {room.amenities?.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>
                        +{room.amenities.length - 3} tiện ích
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <button
                      onClick={() => onSelectRoom(room)}
                      style={{
                        width: '100%',
                        backgroundColor: '#1e3a8a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Xem chi tiết & Đặt phòng →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cam kết & Tiện ích khu trọ */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '28px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
            🔒
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>An Ninh 24/7</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
              Camera giám sát hành lang, khóa vân tay ra vào cổng an toàn tuyệt đối.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '28px', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '12px' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Tiện Nghi Đầy Đủ</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
              Internet cáp quang tốc độ cao, điều hòa, bình nóng lạnh và gác lửng thoáng mát.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '28px', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
            🤝
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Hỗ Trợ Nhanh Chóng</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
              Tiếp nhận yêu cầu bảo trì, hỗ trợ khách thuê tận tình và chuyên nghiệp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
