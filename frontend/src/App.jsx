import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rooms';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    roomNumber: '',
    basePrice: '',
    maxOccupants: 2,
    status: 'AVAILABLE'
  });
  const [editingId, setEditingId] = useState(null);

  // 1. Tải danh sách phòng
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL);
      setRooms(res.data.data || []);
    } catch (err) {
      alert('Lỗi lấy danh sách phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 2. Thêm mới hoặc Cập nhật phòng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber || !form.basePrice) {
      alert('Vui lòng điền đầy đủ số phòng và giá!');
      return;
    }

    try {
      if (editingId) {
        // Update
        await axios.put(`${API_BASE_URL}/${editingId}`, {
          ...form,
          basePrice: Number(form.basePrice),
          maxOccupants: Number(form.maxOccupants)
        });
        alert('Cập nhật phòng thành công!');
        setEditingId(null);
      } else {
        // Create
        await axios.post(API_BASE_URL, {
          ...form,
          basePrice: Number(form.basePrice),
          maxOccupants: Number(form.maxOccupants)
        });
        alert('Thêm phòng mới thành công!');
      }

      setForm({ roomNumber: '', basePrice: '', maxOccupants: 2, status: 'AVAILABLE' });
      fetchRooms();
    } catch (err) {
      alert('Thao tác thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // 3. Chuẩn bị chỉnh sửa
  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      basePrice: room.basePrice,
      maxOccupants: room.maxOccupants,
      status: room.status
    });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ roomNumber: '', basePrice: '', maxOccupants: 2, status: 'AVAILABLE' });
  };

  // 4. Xóa phòng
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      alert('Đã xóa phòng thành công!');
      fetchRooms();
    } catch (err) {
      alert('Lỗi xóa phòng: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: '30px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: '8px' }}>
        🏠 Hệ Thống Quản Lý Phòng Trọ - Motel Management
      </h2>
      <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
        Giao diện Test chức năng CRUD (Lớp «boundary» kết nối với RESTful API Backend)
      </p>

      {/* Form thêm / sửa */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>
          {editingId ? '✏️ Cập nhật thông tin phòng' : '➕ Thêm phòng trọ mới'}
        </h4>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Số phòng:</label>
            <input
              type="text"
              name="roomNumber"
              placeholder="VD: 101, 202"
              value={form.roomNumber}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Giá thuê (VNĐ):</label>
            <input
              type="number"
              name="basePrice"
              placeholder="VD: 2500000"
              value={form.basePrice}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Số người tối đa:</label>
            <input
              type="number"
              name="maxOccupants"
              value={form.maxOccupants}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Trạng thái:</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <option value="AVAILABLE">Còn trống (AVAILABLE)</option>
              <option value="RENTED">Đã thuê (RENTED)</option>
              <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: editingId ? '#0284c7' : '#16a34a',
                color: '#fff',
                padding: '9px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {editingId ? 'Cập nhật phòng' : 'Thêm phòng'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{ backgroundColor: '#64748b', color: '#fff', padding: '9px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bảng danh sách phòng */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>📋 Danh Sách Phòng Trọ ({rooms.length})</h3>
          <button
            onClick={fetchRooms}
            style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
          >
            🔄 Làm mới
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</p>
        ) : rooms.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Chưa có phòng nào. Hãy thêm phòng mới ở trên!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 12px' }}>Số phòng</th>
                <th style={{ padding: '10px 12px' }}>Giá cơ bản</th>
                <th style={{ padding: '10px 12px' }}>Số người</th>
                <th style={{ padding: '10px 12px' }}>Trạng thái</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{room.roomNumber}</td>
                  <td style={{ padding: '12px' }}>{room.basePrice?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ padding: '12px' }}>{room.maxOccupants} người</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          room.status === 'AVAILABLE' ? '#dcfce7' : room.status === 'RENTED' ? '#fee2e2' : '#fef3c7',
                        color:
                          room.status === 'AVAILABLE' ? '#166534' : room.status === 'RENTED' ? '#991b1b' : '#92400e'
                      }}
                    >
                      {room.status === 'AVAILABLE' ? 'Còn trống' : room.status === 'RENTED' ? 'Đã thuê' : 'Bảo trì'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(room)}
                      style={{ marginRight: '8px', padding: '5px 10px', border: 'none', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      style={{ padding: '5px 10px', border: 'none', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
