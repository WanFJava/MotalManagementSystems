import React, { useState, useEffect } from 'react';
import { contractClientService } from '../services/contractClientService';
import { roomClientService } from '../services/roomClientService';

export default function ManageContractsScreen({ onNotify, initialPrefill, onClearPrefill }) {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form Lập Hợp đồng mới
  const [showCreateForm, setShowCreateForm] = useState(!!initialPrefill);
  const [form, setForm] = useState({
    roomId: initialPrefill?.roomId || '',
    tenantName: initialPrefill?.tenantName || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    depositAmount: '',
    rentalPrice: initialPrefill?.rentalPrice || ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContracts();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (initialPrefill) {
      setShowCreateForm(true);
      setForm((prev) => ({
        ...prev,
        roomId: initialPrefill.roomId || '',
        tenantName: initialPrefill.tenantName || '',
        rentalPrice: initialPrefill.rentalPrice || ''
      }));
    }
  }, [initialPrefill]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractClientService.getAllContracts();
      setContracts(data);
    } catch (err) {
      if (onNotify) onNotify('Lỗi tải danh sách hợp đồng!', 'error');
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

  const handleSelectRoom = (roomId) => {
    const r = rooms.find(item => item._id === roomId);
    setForm({
      ...form,
      roomId,
      rentalPrice: r?.basePrice || form.rentalPrice
    });
  };

  // UC05: Tạo hợp đồng mới
  const handleSubmitContract = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.tenantName || !form.startDate || !form.endDate || !form.depositAmount || !form.rentalPrice) {
      alert('Vui lòng điền đầy đủ tất cả các trường thông tin hợp đồng!');
      return;
    }

    try {
      setSubmitting(true);
      await contractClientService.createContract({
        ...form,
        depositAmount: Number(form.depositAmount),
        rentalPrice: Number(form.rentalPrice)
      });
      if (onNotify) onNotify('Lập hợp đồng thành công! Phòng đã chuyển sang trạng thái RENTED.', 'success');
      setShowCreateForm(false);
      if (onClearPrefill) onClearPrefill();
      fetchContracts();
      fetchRooms();
    } catch (err) {
      if (onNotify) onNotify(err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // UC05.1: Gia hạn hợp đồng
  const handleExtend = async (contract) => {
    const curEnd = contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '';
    const newEnd = window.prompt(`Gia hạn hợp đồng phòng ${contract.roomId?.roomNumber || contract.room?.roomNumber || ''}.\nNgày hết hạn hiện tại: ${curEnd}\n\nNhập ngày kết thúc mới (YYYY-MM-DD):`);
    if (!newEnd || !newEnd.trim()) return;

    try {
      await contractClientService.extendContract(contract._id, newEnd.trim());
      if (onNotify) onNotify('Gia hạn hợp đồng thành công!', 'success');
      fetchContracts();
    } catch (err) {
      if (onNotify) onNotify(err.response?.data?.message || err.message, 'error');
    }
  };

  // UC05.2: Thanh lý hợp đồng
  const handleTerminate = async (contract) => {
    const roomNum = contract.roomId?.roomNumber || contract.room?.roomNumber || '';
    if (!window.confirm(`XÁC NHẬN THANH LÝ HỢP ĐỒNG PHÒNG ${roomNum}?\n\n- Hợp đồng sẽ chuyển sang trạng thái TERMINATED.\n- Phòng ${roomNum} sẽ tự động chuyển về trạng thái AVAILABLE (trống).`)) {
      return;
    }

    try {
      await contractClientService.terminateContract(contract._id);
      if (onNotify) onNotify(`Đã thanh lý hợp đồng và giải phóng phòng ${roomNum} về trạng thái TRỐNG!`, 'success');
      fetchContracts();
      fetchRooms();
    } catch (err) {
      if (onNotify) onNotify(err.response?.data?.message || err.message, 'error');
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '24px' }}>
            📄 Quản Lý Hợp Đồng Thuê Phòng
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Lập hợp đồng, quản lý thời hạn, gia hạn và thanh lý hợp đồng
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'ACTIVE', 'TERMINATED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                backgroundColor: filterStatus === st ? '#2563eb' : '#ffffff',
                color: filterStatus === st ? '#ffffff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã thanh lý'}
            </button>
          ))}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? '✕ Đóng form' : '+ Lập HĐ Mới'}
          </button>
        </div>
      </div>

      {/* Form Lập Hợp đồng mới */}
      {showCreateForm && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 4px 16px rgba(22,163,74,0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '18px' }}>
            📝 Lập Hợp Đồng Thuê Phòng Mới (UC05)
          </h3>
          <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
            Sau khi tạo thành công, phòng sẽ tự động chuyển sang trạng thái <strong>RENTED</strong>.
          </p>

          <form onSubmit={handleSubmitContract} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Chọn phòng trọ: *
              </label>
              <select
                required
                value={form.roomId}
                onChange={(e) => handleSelectRoom(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map(r => (
                  <option key={r._id} value={r._id} disabled={r.status !== 'AVAILABLE' && r._id !== form.roomId}>
                    Phòng {r.roomNumber} ({Number(r.basePrice).toLocaleString('vi-VN')} đ) {r.status !== 'AVAILABLE' ? `[${r.status}]` : '[Trống]'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Họ tên khách thuê: *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trần Văn Nam"
                value={form.tenantName}
                onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Ngày bắt đầu thuê: *
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Ngày kết thúc hợp đồng: *
              </label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Tiền đặt cọc (VNĐ): *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="VD: 3000000"
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
                Giá thuê hàng tháng (VNĐ): *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="VD: 3000000"
                value={form.rentalPrice}
                onChange={(e) => setForm({ ...form, rentalPrice: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {submitting ? 'Đang tạo...' : 'Xác nhận lập hợp đồng'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách hợp đồng */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Đang tải danh sách hợp đồng...
        </div>
      ) : filteredContracts.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          Chưa có hợp đồng nào.
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '14px 16px' }}>Mã HĐ / Phòng</th>
                <th style={{ padding: '14px 16px' }}>Khách thuê</th>
                <th style={{ padding: '14px 16px' }}>Thời hạn</th>
                <th style={{ padding: '14px 16px' }}>Giá thuê</th>
                <th style={{ padding: '14px 16px' }}>Tiền cọc</th>
                <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c) => {
                const room = c.roomId || c.room || {};
                const isActive = c.status === 'ACTIVE';

                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        Phòng {room.roomNumber || '---'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {c._id}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {c.tenantName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontSize: '13px' }}>
                      {c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : ''} →{' '}
                      <strong>{c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : ''}</strong>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: 'bold' }}>
                      {Number(c.rentalPrice || 0).toLocaleString('vi-VN')} đ/tháng
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {Number(c.depositAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                        color: isActive ? '#166534' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {isActive ? 'ĐANG HIỆU LỰC' : c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {isActive ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleExtend(c)}
                            style={{
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🕒 Gia hạn
                          </button>
                          <button
                            onClick={() => handleTerminate(c)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ⚠️ Thanh lý
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Đã hoàn tất</span>
                      )}
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

