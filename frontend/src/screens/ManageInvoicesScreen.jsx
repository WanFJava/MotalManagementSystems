import React, { useState, useEffect } from 'react';
import { invoiceClientService } from '../services/invoiceClientService';
import { roomClientService } from '../services/roomClientService';

export default function ManageInvoicesScreen({ onNotify, initialPrefill, onClearPrefill }) {
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('');

  // Form Lập hóa đơn
  const [showGenerateForm, setShowGenerateForm] = useState(!!initialPrefill);
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [form, setForm] = useState({
    roomId: initialPrefill?.roomId || '',
    month: initialPrefill?.month || currentMonthStr,
    electricPrice: 3500,
    waterPrice: 20000,
    internetFee: 100000,
    garbageFee: 50000,
    otherFees: 0,
    note: ''
  });
  const [generating, setGenerating] = useState(false);

  // Modal Chi tiết & Thanh toán hóa đơn
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cashNote, setCashNote] = useState('Thu tiền mặt trực tiếp tại quầy');

  useEffect(() => {
    fetchInvoices();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (initialPrefill) {
      setShowGenerateForm(true);
      setForm((prev) => ({
        ...prev,
        roomId: initialPrefill.roomId || prev.roomId,
        month: initialPrefill.month || prev.month
      }));
    }
  }, [initialPrefill]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceClientService.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      if (onNotify) onNotify('Lỗi tải danh sách hóa đơn!', 'error');
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

  // Tạo hóa đơn tự động (UC08)
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.month) {
      if (onNotify) onNotify('Vui lòng chọn phòng và tháng!', 'error');
      return;
    }

    try {
      setGenerating(true);
      const res = await invoiceClientService.generateInvoice(form);
      if (onNotify) onNotify(res.message || 'Lập hóa đơn thành công!', 'success');
      setShowGenerateForm(false);
      if (onClearPrefill) onClearPrefill();
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lập hóa đơn thất bại';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Thanh toán tiền mặt (UC10)
  const handlePayCash = async (invoiceId) => {
    if (!window.confirm('Xác nhận đã nhận đủ tiền mặt cho hóa đơn này?')) return;
    try {
      setPaymentLoading(true);
      const res = await invoiceClientService.payCash(invoiceId, cashNote);
      if (onNotify) onNotify(res.message, 'success');
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Thanh toán trực tuyến VNPay Sandbox (UC09)
  const handlePayVNPay = async (invoiceId) => {
    try {
      setPaymentLoading(true);
      const returnUrl = `${window.location.origin}/?screen=invoices&vnpay=return`;
      const res = await invoiceClientService.createVNPayUrl(invoiceId, returnUrl);
      if (res.data && res.data.paymentUrl) {
        if (onNotify) onNotify('Đang chuyển hướng sang Cổng thanh toán VNPay Sandbox...', 'info');
        // Mở popup hoặc tab mới tới VNPay Sandbox
        window.open(res.data.paymentUrl, '_blank');
      } else {
        throw new Error('Không nhận được URL thanh toán từ server');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Xóa hóa đơn
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này không?')) return;
    try {
      await invoiceClientService.deleteInvoice(id);
      if (onNotify) onNotify('Đã xóa hóa đơn thành công!', 'success');
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (onNotify) onNotify(msg, 'error');
    }
  };

  // Lọc dữ liệu
  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchMonth = !filterMonth || inv.month === filterMonth;
    return matchStatus && matchMonth;
  });

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & Nút thêm */}
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
            🧾 Quản lý Hóa đơn & Thanh toán (UC08, UC09, UC10)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Tính toán hóa đơn hàng tháng theo hợp đồng, hỗ trợ thanh toán trực tuyến qua <strong>VNPay Sandbox</strong> và thu tiền mặt trực tiếp.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateForm(!showGenerateForm)}
          style={{
            backgroundColor: showGenerateForm ? '#64748b' : '#16a34a',
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
            boxShadow: '0 4px 12px rgba(22,163,74,0.2)'
          }}
        >
          {showGenerateForm ? '✖ Đóng bảng tính' : '➕ Lập hóa đơn tự động'}
        </button>
      </div>

      {/* Form Lập hóa đơn mới */}
      {showGenerateForm && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#166534', marginTop: 0, marginBottom: '16px' }}>
            🧮 Lập hóa đơn hàng tháng (Tự động tổng hợp tiền phòng, điện nước & dịch vụ)
          </h2>

          <form onSubmit={handleGenerateInvoice}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Phòng áp dụng <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Chọn phòng trọ có hợp đồng --</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Phòng {r.roomNumber} ({r.status === 'RENTED' ? '🔴 Đang thuê' : '🟢 Còn trống'})
                    </option>
                  ))}
                </select>
                <small style={{ color: '#64748b' }}>Hệ thống chỉ lập hóa đơn cho phòng đang có hợp đồng ACTIVE.</small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Tháng hóa đơn <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Đơn giá Điện (VNĐ/kWh)
                </label>
                <input
                  type="number"
                  value={form.electricPrice}
                  onChange={(e) => setForm({ ...form, electricPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Đơn giá Nước (VNĐ/m³)
                </label>
                <input
                  type="number"
                  value={form.waterPrice}
                  onChange={(e) => setForm({ ...form, waterPrice: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Tiền Internet (VNĐ)
                </label>
                <input
                  type="number"
                  value={form.internetFee}
                  onChange={(e) => setForm({ ...form, internetFee: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Tiền Rác & Vệ sinh (VNĐ)
                </label>
                <input
                  type="number"
                  value={form.garbageFee}
                  onChange={(e) => setForm({ ...form, garbageFee: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Phụ phí phát sinh khác
                </label>
                <input
                  type="number"
                  value={form.otherFees}
                  onChange={(e) => setForm({ ...form, otherFees: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Ghi chú trên hóa đơn
                </label>
                <input
                  type="text"
                  placeholder="VD: Hạn thanh toán trước ngày 05 hàng tháng"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowGenerateForm(false);
                  if (onClearPrefill) onClearPrefill();
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
                Hủy
              </button>
              <button
                type="submit"
                disabled={generating}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: '600',
                  cursor: generating ? 'not-allowed' : 'pointer'
                }}
              >
                {generating ? 'Đang tính toán...' : '🧾 Xác nhận tạo hóa đơn'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thanh lọc trạng thái và tháng */}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'UNPAID', label: '⏳ Chưa thanh toán' },
            { key: 'PAID', label: '✅ Đã thanh toán' },
            { key: 'OVERDUE', label: '⚠️ Quá hạn' }
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setFilterStatus(st.key)}
              style={{
                backgroundColor: filterStatus === st.key ? '#1e3a8a' : '#f1f5f9',
                color: filterStatus === st.key ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Tháng:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          {filterMonth && (
            <button
              onClick={() => setFilterMonth('')}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕ Bỏ lọc
            </button>
          )}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
          Tổng số hóa đơn: <strong>{filteredInvoices.length}</strong>
        </div>
      </div>

      {/* Danh sách hóa đơn */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Đang tải dữ liệu hóa đơn...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧾</div>
          <p style={{ margin: 0, fontWeight: '600' }}>Không tìm thấy hóa đơn nào trong danh sách.</p>
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
                <th style={{ padding: '12px 16px' }}>Mã Hóa Đơn</th>
                <th style={{ padding: '12px 16px' }}>Phòng</th>
                <th style={{ padding: '12px 16px' }}>Khách thuê</th>
                <th style={{ padding: '12px 16px' }}>Kỳ hóa đơn</th>
                <th style={{ padding: '12px 16px' }}>Chi tiết (Phòng + Điện + Nước)</th>
                <th style={{ padding: '12px 16px' }}>Tổng thanh toán</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'PAID';
                return (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1e3a8a' }}>
                      {inv.invoiceCode}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: '700',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        Phòng {inv.room?.roomNumber || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                      {inv.tenantName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {inv.month}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Phòng: <strong>{inv.roomAmount?.toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#854d0e' }}>
                        ⚡ Điện ({inv.electricUsage} kWh): {inv.electricAmount?.toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ fontSize: '12px', color: '#1e40af' }}>
                        💧 Nước ({inv.waterUsage} m³): {inv.waterAmount?.toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: isPaid ? '#16a34a' : '#b91c1c' }}>
                        {inv.totalAmount?.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: isPaid ? '#dcfce7' : '#fef2f2',
                        color: isPaid ? '#15803d' : '#b91c1c'
                      }}>
                        {isPaid ? `✅ ĐÃ TRẢ (${inv.paymentMethod})` : '⏳ CHƯA TRẢ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ Chi tiết & Thu tiền
                        </button>
                        {!isPaid && (
                          <button
                            onClick={() => handleDeleteInvoice(inv._id)}
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
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Chi tiết Hóa đơn & Các nút Thanh toán (VNPay / Tiền mặt) */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e3a8a', margin: 0 }}>
                  📄 CHI TIẾT HÓA ĐƠN TIỀN TRỌ
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Mã: {selectedInvoice.invoiceCode}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Thông tin phòng & khách */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div><strong>Phòng:</strong> {selectedInvoice.room?.roomNumber || 'N/A'}</div>
              <div><strong>Khách thuê:</strong> {selectedInvoice.tenantName}</div>
              <div><strong>Kỳ thanh toán:</strong> {selectedInvoice.month}</div>
              <div><strong>Hạn đóng:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</div>
            </div>

            {/* Bảng chi tiết các khoản phí */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Khoản mục</th>
                  <th style={{ textAlign: 'center', padding: '8px 0' }}>Số lượng / Chỉ số</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', fontWeight: '600' }}>Tiền phòng</td>
                  <td style={{ textAlign: 'center' }}>1 tháng</td>
                  <td style={{ textAlign: 'right' }}>{selectedInvoice.roomAmount?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.roomAmount?.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', fontWeight: '600', color: '#854d0e' }}>
                    ⚡ Tiền điện ({selectedInvoice.oldElec} ➔ {selectedInvoice.newElec})
                  </td>
                  <td style={{ textAlign: 'center' }}>{selectedInvoice.electricUsage} kWh</td>
                  <td style={{ textAlign: 'right' }}>{selectedInvoice.electricPrice?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.electricAmount?.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', fontWeight: '600', color: '#1e40af' }}>
                    💧 Tiền nước ({selectedInvoice.oldWater} ➔ {selectedInvoice.newWater})
                  </td>
                  <td style={{ textAlign: 'center' }}>{selectedInvoice.waterUsage} m³</td>
                  <td style={{ textAlign: 'right' }}>{selectedInvoice.waterPrice?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.waterAmount?.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0' }}>Mạng Internet</td>
                  <td style={{ textAlign: 'center' }}>Gói tháng</td>
                  <td style={{ textAlign: 'right' }}>{selectedInvoice.internetFee?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.internetFee?.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0' }}>Vệ sinh & Rác</td>
                  <td style={{ textAlign: 'center' }}>Phí tháng</td>
                  <td style={{ textAlign: 'right' }}>{selectedInvoice.garbageFee?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.garbageFee?.toLocaleString('vi-VN')} đ</td>
                </tr>
                {selectedInvoice.otherFees > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 0' }}>Phụ phí khác</td>
                    <td style={{ textAlign: 'center' }}>-</td>
                    <td style={{ textAlign: 'right' }}>{selectedInvoice.otherFees?.toLocaleString('vi-VN')} đ</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>{selectedInvoice.otherFees?.toLocaleString('vi-VN')} đ</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" style={{ padding: '12px 0', fontWeight: '800', fontSize: '15px' }}>
                    TỔNG CỘNG THANH TOÁN:
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: '800', fontSize: '18px', color: '#b91c1c' }}>
                    {selectedInvoice.totalAmount?.toLocaleString('vi-VN')} VNĐ
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Trạng thái thanh toán hiện tại */}
            {selectedInvoice.status === 'PAID' ? (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: '700',
                marginBottom: '16px'
              }}>
                ✅ HÓA ĐƠN ĐÃ ĐƯỢC THANH TOÁN THÀNH CÔNG!
                <div style={{ fontSize: '12px', fontWeight: '500', marginTop: '4px' }}>
                  Hình thức: {selectedInvoice.paymentMethod} • Thời gian: {new Date(selectedInvoice.paidAt || selectedInvoice.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '18px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#991b1b', fontWeight: '700' }}>
                  💳 Lựa chọn hình thức thanh toán:
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Nút VNPay Sandbox */}
                  <button
                    onClick={() => handlePayVNPay(selectedInvoice._id)}
                    disabled={paymentLoading}
                    style={{
                      backgroundColor: '#005baa',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: paymentLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 10px rgba(0,91,170,0.25)'
                    }}
                  >
                    <span>🏦 Cổng VNPay Sandbox</span>
                    <small style={{ fontWeight: '400', opacity: 0.9 }}>Quét mã QR / Thẻ ATM</small>
                  </button>

                  {/* Nút Thu tiền mặt */}
                  <button
                    onClick={() => handlePayCash(selectedInvoice._id)}
                    disabled={paymentLoading}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: paymentLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 10px rgba(22,163,74,0.25)'
                    }}
                  >
                    <span>💵 Thu tiền mặt trực tiếp</span>
                    <small style={{ fontWeight: '400', opacity: 0.9 }}>Xác nhận đã nhận tiền</small>
                  </button>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  backgroundColor: '#64748b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
