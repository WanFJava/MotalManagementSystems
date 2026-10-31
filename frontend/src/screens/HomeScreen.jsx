import React from 'react';

/**
 * Màn hình Trang chủ (HomeScreen)
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management & Room Search)
 * Tích hợp hiển thị giao diện theo vai trò (Role-Aware UI):
 * - Guest (Chưa đăng nhập): Giới thiệu khu trọ, tìm phòng, xem phòng trống, nút Đăng nhập/Đăng ký.
 * - Tenant (Khách thuê): Lời chào khách, tìm phòng, xem phòng trống, xem hồ sơ cá nhân.
 * - Staff / Manager: Bảng điều khiển quản trị, thống kê KPI phòng, thanh thao tác nghiệp vụ nhanh.
 */
export default function HomeScreen({ rooms, loading, onSelectRoom, setCurrentScreen, currentUser }) {
  const total = rooms.length;
  const available = rooms.filter(r => r.status === 'AVAILABLE').length;
  const rented = rooms.filter(r => r.status === 'RENTED').length;
  const maintenance = rooms.filter(r => r.status === 'MAINTENANCE').length;

  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').slice(0, 3);
  const isStaffOrManager = currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'MANAGER');
  const isTenant = currentUser && currentUser.role === 'TENANT';

  return (
    <div style={{ padding: '24px 0' }}>
      {/* 1. HERO BANNER - PHÂN BIỆT THEO VAI TRÒ */}
      <div style={{
        background: isStaffOrManager 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #3b82f6 100%)'
          : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '36px 32px',
        marginBottom: '32px',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
      }}>
        <div style={{ maxWidth: '850px' }}>
          {/* Badge phân quyền */}
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            marginBottom: '14px'
          }}>
            {!currentUser && '🌟 HỆ THỐNG NHÀ TRỌ THÔNG MINH • TIỆN NGHI & AN NINH'}
            {isTenant && `🙋 KHÁCH THUÊ • XIN CHÀO ${currentUser.fullName.toUpperCase()}`}
            {currentUser?.role === 'STAFF' && `🛡️ BẢNG ĐIỀU KHIỂN NHÂN VIÊN VẬN HÀNH`}
            {currentUser?.role === 'MANAGER' && `👑 BẢNG ĐIỀU KHIỂN CHỦ TRỌ / QUẢN LÝ CẤP CAO`}
          </span>

          {/* Tiêu đề & Mô tả */}
          {!currentUser && (
            <>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.25' }}>
                Không Gian Sống Tiện Nghi, Giờ Giấc Tự Do
              </h1>
              <p style={{ fontSize: '16px', color: '#e0f2fe', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                Khám phá hệ thống phòng trọ sạch đẹp, an ninh với camera giám sát 24/7 và khóa cửa vân tay. Dễ dàng tìm kiếm phòng trống theo mức giá, xem ảnh thực tế và gửi yêu cầu giữ phòng trực tuyến.
              </p>
            </>
          )}

          {isTenant && (
            <>
              <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.25' }}>
                Xin chào, {currentUser.fullName}!
              </h1>
              <p style={{ fontSize: '16px', color: '#e0f2fe', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                Chào mừng bạn quay lại hệ thống quản lý nhà trọ. Bạn có thể tra cứu thông tin các phòng, tìm kiếm phòng mới hoặc xem lại hồ sơ định danh cá nhân của mình.
              </p>
            </>
          )}

          {isStaffOrManager && (
            <>
              <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.25' }}>
                Trung Tâm Quản Trị & Vận Hành Nhà Trọ
              </h1>
              <p style={{ fontSize: '16px', color: '#e0f2fe', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                Theo dõi tình trạng phòng theo thời gian thực, duyệt các yêu cầu thuê từ khách hàng, thiết lập hợp đồng thuê mới và quản lý hồ sơ tạm trú khách thuê.
              </p>
            </>
          )}

          {/* Nút hành động tương ứng từng vai trò */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!currentUser && (
              <>
                <button
                  onClick={() => setCurrentScreen('rooms')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e3a8a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
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
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Tìm kiếm & Lọc phòng trống
                </button>
                <button
                  onClick={() => setCurrentScreen('auth')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🔑 Đăng nhập / Đăng ký
                </button>
              </>
            )}

            {isTenant && (
              <>
                <button
                  onClick={() => setCurrentScreen('rooms')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e3a8a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🛏️ Xem phòng trọ
                </button>
                <button
                  onClick={() => setCurrentScreen('search')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Tìm phòng trống
                </button>
                <button
                  onClick={() => setCurrentScreen('my-requests')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📋 Yêu cầu của tôi
                </button>
                <button
                  onClick={() => setCurrentScreen('my-contracts')}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📄 Hợp đồng của tôi
                </button>
                <button
                  onClick={() => setCurrentScreen('auth')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  👤 Hồ sơ cá nhân
                </button>
              </>
            )}

            {isStaffOrManager && (
              <>
                <button
                  onClick={() => setCurrentScreen('manage')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  ⚙️ Quản lý phòng (UC04)
                </button>
                <button
                  onClick={() => setCurrentScreen('requests')}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📋 Duyệt yêu cầu thuê (UC03)
                </button>
                <button
                  onClick={() => setCurrentScreen('contracts')}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  📄 Hợp đồng (UC05)
                </button>
                <button
                  onClick={() => setCurrentScreen('tenants')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  👥 Khách thuê & Tạm trú (UC06)
                </button>
                {currentUser?.role === 'MANAGER' && (
                  <button
                    onClick={() => setCurrentScreen('staff')}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 22px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ Quản lý nhân viên (UC15)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. KHỐI THỐNG KÊ (Dành cho Quản trị viên & Nhân viên) */}
      {isStaffOrManager ? (
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Tình Trạng Quản Trị Phòng Trọ Toàn Hệ Thống
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
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
        </div>
      ) : (
        /* Tiện ích nổi bật dành cho Khách vãng lai & Khách thuê */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>An Ninh 24/7</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Camera giám sát hành lang và khóa cửa vân tay bảo mật cao.</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏰</div>
            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Giờ Giấc Tự Do</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Đi lại tự do, không chung chủ, có chìa khóa và lối đi riêng.</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📶</div>
            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Full Tiện Nghi</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Wifi cáp quang tốc độ cao, điều hòa, bình nóng lạnh, gác lửng.</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Hợp Đồng Rõ Ràng</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Hợp đồng thuê minh bạch, hỗ trợ đăng ký tạm trú đúng pháp luật.</div>
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH PHÒNG TRỐNG NỔI BẬT */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
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
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Xem tất cả phòng ({rooms.length}) →
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
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Ảnh phòng */}
                <div style={{ position: 'relative', height: '170px', backgroundColor: '#f1f5f9' }}>
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                    alt={`Phòng ${room.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    🟢 Còn trống
                  </div>
                </div>

                {/* Thông tin phòng */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#1e293b' }}>
                      Phòng {room.roomNumber}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
                      📐 {room.area || 20} m² • 👥 Tối đa {room.maxOccupants || 2} người
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb', marginBottom: '12px' }}>
                      {Number(room.basePrice).toLocaleString('vi-VN')} đ/tháng
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectRoom(room)}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 Xem chi tiết & Giữ phòng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
