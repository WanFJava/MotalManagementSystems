import React, { useState } from 'react';
import { roomClientService } from '../services/roomClientService';

export default function RoomSearchScreen({ onSelectRoom }) {
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'AVAILABLE', // Mặc định tìm phòng trống cho khách thuê
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    amenity: ''
  });

  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const amenitiesList = [
    'Tất cả tiện ích',
    'Wifi',
    'Điều hòa',
    'Bình nóng lạnh',
    'Gác lửng',
    'Ban công',
    'Tủ lạnh',
    'Tủ quần áo'
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setSearching(true);
      const data = await roomClientService.searchRooms(filters);
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      alert('Lỗi tìm kiếm phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      status: 'AVAILABLE',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      amenity: ''
    });
    setResults(null);
    setHasSearched(false);
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '24px' }}>
          🔍 Tìm Kiếm & Lọc Phòng Trọ Thông Minh
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Tìm kiếm phòng theo mức giá, diện tích, tiện ích và tình trạng sẵn sàng để thuê
        </p>
      </div>

      {/* Filter Form Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        marginBottom: '32px'
      }}>
        <form onSubmit={handleSearch}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* 1. Keyword */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Từ khóa (Số phòng / Mô tả):
              </label>
              <input
                type="text"
                placeholder="VD: 101, gác lửng..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
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

            {/* 2. Status */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Tình trạng phòng:
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="AVAILABLE">🟢 Chỉ tìm phòng còn trống</option>
                <option value="ALL">📋 Tất cả các phòng</option>
                <option value="RENTED">🔴 Phòng đã thuê</option>
                <option value="MAINTENANCE">🛠️ Đang bảo trì</option>
              </select>
            </div>

            {/* 3. Min Price */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Giá tối thiểu (VNĐ):
              </label>
              <input
                type="number"
                placeholder="VD: 2000000"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
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

            {/* 4. Max Price */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Giá tối đa (VNĐ):
              </label>
              <input
                type="number"
                placeholder="VD: 3500000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
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

            {/* 5. Min Area */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Diện tích tối thiểu (m²):
              </label>
              <input
                type="number"
                placeholder="VD: 20"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
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

            {/* 6. Amenity */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Tiện ích đi kèm:
              </label>
              <select
                value={filters.amenity}
                onChange={(e) => setFilters({ ...filters, amenity: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                {amenitiesList.map((item, idx) => (
                  <option key={idx} value={item === 'Tất cả tiện ích' ? '' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={searching}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: searching ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
              }}
            >
              {searching ? '⏳ Đang tìm kiếm...' : '🔍 Áp dụng tìm kiếm'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Đặt lại
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>
            📋 Kết Quả Tìm Kiếm {results !== null && `(${results.length} phòng)`}
          </h3>
          {hasSearched && (
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Đã lọc theo tiêu chí bạn đã chọn
            </span>
          )}
        </div>

        {searching ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Đang tìm kiếm phòng phù hợp...
          </div>
        ) : results === null ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔎</div>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Hãy nhấn nút <strong>"Áp dụng tìm kiếm"</strong> ở trên để lọc các phòng phù hợp với nhu cầu của bạn!
            </p>
          </div>
        ) : results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>Không có phòng nào thỏa mãn các điều kiện lọc!</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Hãy thử nới lỏng khoảng giá hoặc chọn tất cả trạng thái phòng.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px'
          }}>
            {results.map((room) => {
              const isAvail = room.status === 'AVAILABLE';
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
                  <div style={{ position: 'relative', height: '170px' }}>
                    <img
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: isAvail ? '#16a34a' : '#dc2626',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      {isAvail ? 'Còn trống' : room.status}
                    </span>
                  </div>

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                        Phòng {room.roomNumber}
                      </h4>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb' }}>
                        {room.basePrice?.toLocaleString('vi-VN')} đ/th
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '14px', marginBottom: '10px' }}>
                      <span>📐 {room.area || 20} m²</span>
                      <span>👥 Tối đa {room.maxOccupants || 2} người</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                      {room.amenities?.map((amenity, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button
                        onClick={() => onSelectRoom(room)}
                        style={{
                          width: '100%',
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
                        Xem chi tiết & Đặt phòng →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
