import React, { useState } from 'react';

export default function RoomListScreen({ rooms, loading, onSelectRoom, setCurrentScreen }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [quickSearch, setQuickSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const filteredRooms = rooms.filter((room) => {
    const matchStatus = filterStatus === 'ALL' || room.status === filterStatus;
    const matchSearch =
      !quickSearch.trim() ||
      room.roomNumber.toLowerCase().includes(quickSearch.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(quickSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '24px' }}>
            🛏️ Danh Sách Phòng Trọ ({filteredRooms.length}/{rooms.length})
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Toàn bộ danh mục phòng trọ trong hệ thống quản lý
          </p>
        </div>

        {/* View mode toggle & Action button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: viewMode === 'grid' ? 'bold' : 'normal',
                cursor: 'pointer',
                color: viewMode === 'grid' ? '#1e3a8a' : '#64748b'
              }}
            >
              ⊞ Lưới
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: viewMode === 'table' ? 'bold' : 'normal',
                cursor: 'pointer',
                color: viewMode === 'table' ? '#1e3a8a' : '#64748b'
              }}
            >
              ☰ Bảng
            </button>
          </div>

          <button
            onClick={() => setCurrentScreen('manage')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ➕ Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'AVAILABLE', label: '🟢 Còn trống' },
            { id: 'RENTED', label: '🔴 Đã thuê' },
            { id: 'MAINTENANCE', label: '🛠️ Đang sửa' }
          ].map((statusTab) => (
            <button
              key={statusTab.id}
              onClick={() => setFilterStatus(statusTab.id)}
              style={{
                backgroundColor: filterStatus === statusTab.id ? '#1e3a8a' : '#f1f5f9',
                color: filterStatus === statusTab.id ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: filterStatus === statusTab.id ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {statusTab.label}
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Tìm theo số phòng hoặc mô tả..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#94a3b8' }}>
            🔍
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          Đang tải dữ liệu danh sách phòng trọ...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
          <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Không tìm thấy phòng trọ nào!</h4>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '20px'
        }}>
          {filteredRooms.map((room) => {
            const isAvail = room.status === 'AVAILABLE';
            const isRented = room.status === 'RENTED';
            return (
              <div
                key={room._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Image & Status Badge */}
                <div style={{ position: 'relative', height: '180px' }}>
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                    alt={`Phòng ${room.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: isAvail ? '#16a34a' : isRented ? '#dc2626' : '#d97706',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    {isAvail ? 'Còn trống' : isRented ? 'Đã cho thuê' : 'Đang bảo trì'}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                      Phòng {room.roomNumber}
                    </h3>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb' }}>
                      {room.basePrice?.toLocaleString('vi-VN')} đ
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>/th</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '14px', marginBottom: '10px' }}>
                    <span>📐 {room.area || 20} m²</span>
                    <span>👥 Tối đa {room.maxOccupants || 2} người</span>
                  </div>

                  {/* Description snippet */}
                  <p style={{
                    fontSize: '12px',
                    color: '#475569',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    height: '36px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {room.description || 'Phòng sạch sẽ, giờ giấc tự do, an ninh tốt.'}
                  </p>

                  {/* Amenities */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                    {room.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        ✓ {amenity}
                      </span>
                    ))}
                    {room.amenities?.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onSelectRoom(room)}
                      style={{
                        flex: 1,
                        backgroundColor: '#1e3a8a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Chi tiết & Đặt phòng
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px' }}>Ảnh & Số phòng</th>
                <th style={{ padding: '12px 16px' }}>Đơn giá</th>
                <th style={{ padding: '12px 16px' }}>Diện tích & Sức chứa</th>
                <th style={{ padding: '12px 16px' }}>Tiện ích chính</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const isAvail = room.status === 'AVAILABLE';
                const isRented = room.status === 'RENTED';
                return (
                  <tr key={room._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
                          Phòng {room.roomNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {room.amenities?.[0] || 'Phòng tiêu chuẩn'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#2563eb' }}>
                      {room.basePrice?.toLocaleString('vi-VN')} đ/tháng
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                      {room.area || 20} m² • {room.maxOccupants || 2} người
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                      {room.amenities?.slice(0, 2).join(', ') || 'Cơ bản'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: isAvail ? '#dcfce7' : isRented ? '#fee2e2' : '#fef3c7',
                        color: isAvail ? '#166534' : isRented ? '#991b1b' : '#92400e'
                      }}>
                        {isAvail ? 'Còn trống' : isRented ? 'Đã thuê' : 'Bảo trì'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => onSelectRoom(room)}
                        style={{
                          backgroundColor: '#1e3a8a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
