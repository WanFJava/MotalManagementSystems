import React, { useState, useEffect } from 'react';
import { utilityClientService } from '../services/utilityClientService';
import { roomClientService } from '../services/roomClientService';

export default function ManageUtilitiesScreen({ onNotify, onNavigateToInvoice }) {
  const [utilities, setUtilities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterRoom, setFilterRoom] = useState('');

  // Form ghi chỉ số
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    roomId: '',
    month: currentMonthStr,
    oldElec: 0,
    newElec: 0,
    oldWater: 0,
    newWater: 0,
    recordedBy: 'Nhân viên quản lý',
    note: ''
  });

  const [loadingLatest, setLoadingLatest] = useState(false);

  useEffect(() => {
    fetchUtilities();
    fetchRooms();
  }, []);

  const fetchUtilities = async () => {
    try {
      setLoading(true);
      const data = await utilityClientService.getAllUtilities();
      setUtilities(data);
    } catch (err) {
      if (onNotify) onNotify('Lỗi tải danh sách chỉ số điện nước!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await roomClientService.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Khi người dùng chọn phòng trong form, tự động tìm chỉ số mới nhất của phòng đó để điền vào số cũ
  const handleSelectRoom = async (roomId) => {
    setFormData((prev) => ({ ...prev, roomId }));
    if (!roomId) return;

    try {
      setLoadingLatest(true);
      const latest = await utilityClientService.getLatestUtility(roomId);
      if (latest) {
        setFormData((prev) => ({
          ...prev,
          oldElec: latest.newElec,
          newElec: latest.newElec,
          oldWater: latest.newWater,
          newWater: latest.newWater
        }));
        if (onNotify) onNotify(`Đã tự động lấy chỉ số tháng trước của phòng (${latest.month})`, 'info');
      }
    } catch (err) {
      console.error('Không tìm thấy chỉ số cũ', err);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Tính toán real-time
  const electricUsage = Math.max(0, Number(formData.newElec || 0) - Number(formData.oldElec || 0));
  const waterUsage = Math.max(0, Number(formData.newWater || 0) - Number(formData.oldWater || 0));
  const isElecInvalid = Number(formData.newElec) < Number(formData.oldElec);
  const isWaterInvalid = Number(formData.newWater) < Number(formData.oldWater);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      if (onNotify) onNotify('Vui lòng chọn phòng!', 'error');
      return;
    }
    if (isElecInvalid) {
      if (onNotify) onNotify('Chỉ số điện mới không được nhỏ hơn chỉ số cũ!', 'error');
      return;
    }
    if (isWaterInvalid) {
      if (onNotify) onNotify('Chỉ số nước mới không được nhỏ hơn chỉ số cũ!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editId) {
        await utilityClientService.updateUtility(editId, formData);
        if (onNotify) onNotify('Cập nhật chỉ số điện nước thành công!', 'success');
      } else {
        await utilityClientService.recordUtility(formData);
        if (onNotify) onNotify('Ghi nhận chỉ số điện nước thành công!', 'success');
      }
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchUtilities();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      roomId: item.room?._id || item.roomId,
      month: item.month,
      oldElec: item.oldElec,
      newElec: item.newElec,
      oldWater: item.oldWater,
      newWater: item.newWater,
      recordedBy: item.recordedBy || 'Nhân viên quản lý',
      note: item.note || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi chỉ số này không?')) return;
    try {
      await utilityClientService.deleteUtility(id);
      if (onNotify) onNotify('Đã xóa bản ghi chỉ số điện nước!', 'success');
      fetchUtilities();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(msg, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      roomId: '',
      month: currentMonthStr,
      oldElec: 0,
      newElec: 0,
      oldWater: 0,
      newWater: 0,
      recordedBy: 'Nhân viên quản lý',
      note: ''
    });
    setEditId(null);
  };

  // Lọc dữ liệu
  const filteredUtilities = utilities.filter((u) => {
    const matchMonth = !filterMonth || u.month === filterMonth;
    const matchRoom = !filterRoom || u.room?.roomNumber === filterRoom;
    return matchMonth && matchRoom;
  });

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & Nút thêm mới */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            ⚡ Quản lý Chỉ số Điện & Nước (UC07)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Ghi nhận số công tơ điện nước hàng tháng, tự động tính kWh điện, m³ nước tiêu thụ và chuẩn bị số liệu lập hóa đơn.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          style={{
            backgroundColor: showForm ? '#64748b' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
          }}
        >
          {showForm ? '✖ Đóng biểu mẫu' : '➕ Ghi chỉ số mới'}
        </button>
      </div>

      {/* Form Ghi chỉ số */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', marginTop: 0, marginBottom: '20px' }}>
            {editId ? '✏️ Cập nhật chỉ số điện nước' : '📝 Nhập chỉ số công tơ điện & nước'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Chọn phòng */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Phòng trọ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => handleSelectRoom(e.target.value)}
                  disabled={!!editId}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: editId ? '#f1f5f9' : '#ffffff'
                  }}
                >
                  <option value="">-- Chọn phòng trọ --</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Phòng {r.roomNumber} ({r.status === 'RENTED' ? '🔴 Đang thuê' : r.status === 'AVAILABLE' ? '🟢 Còn trống' : '🛠️ Bảo trì'})
                    </option>
                  ))}
                </select>
                {loadingLatest && <small style={{ color: '#2563eb' }}>Đang tra cứu số liệu cũ...</small>}
              </div>

              {/* Tháng ghi */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Tháng chốt số (YYYY-MM) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Người ghi */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Nhân viên ghi nhận
                </label>
                <input
                  type="text"
                  value={formData.recordedBy}
                  onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Khối Điện & Nước */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {/* Điện */}
              <div style={{
                backgroundColor: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '10px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <strong style={{ fontSize: '16px', color: '#854d0e' }}>Chỉ số Điện (kWh)</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#713f12', display: 'block', marginBottom: '4px' }}>Số điện cũ:</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.oldElec}
                      onChange={(e) => setFormData({ ...formData, oldElec: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #facc15',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#713f12', display: 'block', marginBottom: '4px' }}>Số điện mới:</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.newElec}
                      onChange={(e) => setFormData({ ...formData, newElec: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: isElecInvalid ? '2px solid #ef4444' : '1px solid #facc15',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                </div>

                {isElecInvalid ? (
                  <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>
                    ⚠️ Lỗi: Số mới không được nhỏ hơn số cũ!
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#854d0e', fontWeight: '600' }}>
                    💡 Tiêu thụ: <span style={{ color: '#b45309', fontSize: '15px' }}>{electricUsage} kWh</span>
                    {' '}(Ước tính: {(electricUsage * 3500).toLocaleString('vi-VN')} đ)
                  </div>
                )}
              </div>

              {/* Nước */}
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px' }}>💧</span>
                  <strong style={{ fontSize: '16px', color: '#1e40af' }}>Chỉ số Nước (m³)</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>Số nước cũ:</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.oldWater}
                      onChange={(e) => setFormData({ ...formData, oldWater: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #93c5fd',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>Số nước mới:</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.newWater}
                      onChange={(e) => setFormData({ ...formData, newWater: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: isWaterInvalid ? '2px solid #ef4444' : '1px solid #93c5fd',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                </div>

                {isWaterInvalid ? (
                  <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>
                    ⚠️ Lỗi: Số mới không được nhỏ hơn số cũ!
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>
                    🌊 Tiêu thụ: <span style={{ color: '#1d4ed8', fontSize: '15px' }}>{waterUsage} m³</span>
                    {' '}(Ước tính: {(waterUsage * 20000).toLocaleString('vi-VN')} đ)
                  </div>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Ghi chú thêm
              </label>
              <input
                type="text"
                placeholder="VD: Khách mới vào từ ngày 15, số công tơ niêm phong bình thường..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Nút hành động */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting || isElecInvalid || isWaterInvalid}
                style={{
                  backgroundColor: submitting || isElecInvalid || isWaterInvalid ? '#94a3b8' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: '600',
                  cursor: submitting || isElecInvalid || isWaterInvalid ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.2)'
                }}
              >
                {submitting ? 'Đang lưu...' : editId ? '💾 Cập nhật chỉ số' : '✅ Lưu chỉ số chốt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bộ lọc */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Lọc theo tháng:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          {filterMonth && (
            <button
              onClick={() => setFilterMonth('')}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            >
              ✕ Xóa lọc tháng
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Lọc theo phòng:</span>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="">-- Tất cả phòng --</option>
            {rooms.map((r) => (
              <option key={r._id} value={r.roomNumber}>Phòng {r.roomNumber}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
          Tổng số bản ghi: <strong>{filteredUtilities.length}</strong>
        </div>
      </div>

      {/* Danh sách bản ghi */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Đang tải dữ liệu chỉ số điện nước...
        </div>
      ) : filteredUtilities.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
          <p style={{ margin: 0, fontWeight: '600' }}>Chưa có bản ghi điện nước nào phù hợp.</p>
          <small>Nhấn nút "➕ Ghi chỉ số mới" phía trên để chốt số công tơ cho từng phòng.</small>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Phòng</th>
                <th style={{ padding: '12px 16px' }}>Tháng</th>
                <th style={{ padding: '12px 16px' }}>Chỉ số Điện (Cũ ➔ Mới)</th>
                <th style={{ padding: '12px 16px' }}>Tiêu thụ Điện</th>
                <th style={{ padding: '12px 16px' }}>Chỉ số Nước (Cũ ➔ Mới)</th>
                <th style={{ padding: '12px 16px' }}>Tiêu thụ Nước</th>
                <th style={{ padding: '12px 16px' }}>Người ghi</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUtilities.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      Phòng {item.room?.roomNumber || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                    {item.month}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#64748b' }}>{item.oldElec}</span>
                    {' ➔ '}
                    <span style={{ fontWeight: '700', color: '#854d0e' }}>{item.newElec}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      backgroundColor: '#fef9c3',
                      color: '#a16207',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      ⚡ {item.electricUsage} kWh
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: '#64748b' }}>{item.oldWater}</span>
                    {' ➔ '}
                    <span style={{ fontWeight: '700', color: '#1d4ed8' }}>{item.newWater}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      💧 {item.waterUsage} m³
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    <div>{item.recordedBy || 'Quản lý'}</div>
                    <small style={{ color: '#94a3b8' }}>
                      {new Date(item.createdAt || item.readingDate).toLocaleDateString('vi-VN')}
                    </small>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {onNavigateToInvoice && (
                        <button
                          onClick={() => onNavigateToInvoice({ roomId: item.room?._id, month: item.month })}
                          title="Lập hóa đơn từ kỳ chốt này"
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🧾 Lập HĐ
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
