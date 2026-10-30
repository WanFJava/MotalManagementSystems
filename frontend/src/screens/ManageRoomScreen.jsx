import React, { useState } from 'react';
import { roomClientService } from '../services/roomClientService';

export default function ManageRoomScreen({ rooms, fetchRooms, loading, onNotify }) {
  const [form, setForm] = useState({
    roomNumber: '',
    basePrice: '',
    area: 20,
    maxOccupants: 2,
    status: 'AVAILABLE',
    amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh'],
    description: '',
    images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const availableAmenities = [
    'Wifi',
    'Điều hòa',
    'Bình nóng lạnh',
    'Gác lửng',
    'Ban công',
    'Tủ lạnh',
    'Tủ quần áo',
    'Máy giặt chung',
    'Kệ bếp nấu ăn'
  ];

  const handleAmenityToggle = (amenity) => {
    if (form.amenities.includes(amenity)) {
      setForm({
        ...form,
        amenities: form.amenities.filter(a => a !== amenity)
      });
    } else {
      setForm({
        ...form,
        amenities: [...form.amenities, amenity]
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEditClick = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      basePrice: room.basePrice,
      area: room.area || 20,
      maxOccupants: room.maxOccupants || 2,
      status: room.status,
      amenities: room.amenities || ['Wifi', 'Điều hòa', 'Bình nóng lạnh'],
      description: room.description || '',
      images: room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      roomNumber: '',
      basePrice: '',
      area: 20,
      maxOccupants: 2,
      status: 'AVAILABLE',
      amenities: ['Wifi', 'Điều hòa', 'Bình nóng lạnh'],
      description: '',
      images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber.trim()) {
      alert('Vui lòng nhập số phòng!');
      return;
    }
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      alert('Giá thuê phòng phải lớn hơn 0 VNĐ!');
      return;
    }

    const payload = {
      ...form,
      roomNumber: form.roomNumber.trim(),
      basePrice: Number(form.basePrice),
      area: Number(form.area),
      maxOccupants: Number(form.maxOccupants),
      images: [form.images]
    };

    try {
      setSaving(true);
      if (editingId) {
        const res = await roomClientService.updateRoom(editingId, payload);
        if (onNotify) onNotify(res.message || 'Cập nhật thông tin phòng thành công!', 'success');
        setEditingId(null);
      } else {
        const res = await roomClientService.createRoom(payload);
        if (onNotify) onNotify(res.message || 'Thêm phòng mới thành công!', 'success');
      }

      handleCancelEdit();
      fetchRooms();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(errMsg, 'error');
      alert('Thao tác thất bại: ' + errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa phòng "${room.roomNumber}" không?`);
    if (!isConfirm) return;

    try {
      const res = await roomClientService.deleteRoom(room._id);
      if (onNotify) onNotify(res.message || 'Đã xóa phòng thành công!', 'success');
      fetchRooms();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(errMsg, 'error');
      alert('Không thể xóa phòng: ' + errMsg);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '24px' }}>
          ⚙️ Quản Trị Danh Mục Phòng Trọ
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Giao diện dành riêng cho Chủ trọ / Nhân viên quản lý thêm, sửa, xóa và kiểm soát trạng thái phòng
        </p>
      </div>

      {/* CRUD Form Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        marginBottom: '32px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e3a8a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editingId ? '✏️ Chỉnh Sửa Thông Tin Phòng' : '➕ Thêm Phòng Trọ Mới'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Room Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Số phòng: *
              </label>
              <input
                type="text"
                required
                name="roomNumber"
                placeholder="VD: 101, 203..."
                value={form.roomNumber}
                onChange={handleInputChange}
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

            {/* Base Price */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Giá thuê cơ bản (VNĐ/tháng): *
              </label>
              <input
                type="number"
                required
                name="basePrice"
                placeholder="VD: 2500000"
                value={form.basePrice}
                onChange={handleInputChange}
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

            {/* Area */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Diện tích (m²): *
              </label>
              <input
                type="number"
                required
                name="area"
                placeholder="VD: 22"
                value={form.area}
                onChange={handleInputChange}
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

            {/* Max occupants */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Số người ở tối đa:
              </label>
              <input
                type="number"
                name="maxOccupants"
                value={form.maxOccupants}
                onChange={handleInputChange}
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

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Trạng thái phòng:
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="AVAILABLE">🟢 Còn trống (AVAILABLE)</option>
                <option value="RENTED">🔴 Đang cho thuê (RENTED)</option>
                <option value="MAINTENANCE">🛠️ Đang bảo trì (MAINTENANCE)</option>
              </select>
            </div>
          </div>

          {/* Amenities checkboxes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Tiện ích phòng trọ:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableAmenities.map((amenity) => {
                const checked = form.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    style={{
                      backgroundColor: checked ? '#dbeafe' : '#f1f5f9',
                      color: checked ? '#1e40af' : '#475569',
                      border: checked ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: checked ? '700' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {checked ? '✓ ' : '+ '} {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image & Description */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Link ảnh phòng:
              </label>
              <input
                type="text"
                name="images"
                value={form.images}
                onChange={handleInputChange}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Mô tả chi tiết phòng:
              </label>
              <input
                type="text"
                name="description"
                placeholder="VD: Phòng sạch sẽ, view ban công đón gió..."
                value={form.description}
                onChange={handleInputChange}
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

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: editingId ? '#0284c7' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '⏳ Đang lưu...' : editingId ? '💾 Cập nhật phòng' : '➕ Lưu phòng mới'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table of all rooms */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>
            📋 Danh Sách Tất Cả Phòng ({rooms.length})
          </h3>
          <button
            onClick={fetchRooms}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155'
            }}
          >
            🔄 Tải lại
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>Đang tải...</p>
        ) : rooms.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>Chưa có phòng nào trong CSDL.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>
                  <th style={{ padding: '12px 14px' }}>Số phòng</th>
                  <th style={{ padding: '12px 14px' }}>Giá thuê (VNĐ)</th>
                  <th style={{ padding: '12px 14px' }}>Diện tích</th>
                  <th style={{ padding: '12px 14px' }}>Sức chứa</th>
                  <th style={{ padding: '12px 14px' }}>Tiện ích</th>
                  <th style={{ padding: '12px 14px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const isAvail = room.status === 'AVAILABLE';
                  const isRented = room.status === 'RENTED';
                  return (
                    <tr key={room._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#1e293b' }}>
                        Phòng {room.roomNumber}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#2563eb', fontWeight: '700' }}>
                        {room.basePrice?.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                        {room.area || 20} m²
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                        {room.maxOccupants || 2} người
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>
                        {room.amenities?.slice(0, 3).join(', ') || 'Cơ bản'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: isAvail ? '#dcfce7' : isRented ? '#fee2e2' : '#fef3c7',
                          color: isAvail ? '#166534' : isRented ? '#991b1b' : '#92400e'
                        }}>
                          {isAvail ? 'Còn trống' : isRented ? 'Đã thuê' : 'Bảo trì'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(room)}
                          style={{
                            marginRight: '6px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Xóa
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
    </div>
  );
}
