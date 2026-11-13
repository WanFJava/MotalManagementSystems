import React, { useState, useEffect } from 'react';
import { invoiceClientService } from '../services/invoiceClientService';
import { contractClientService } from '../services/contractClientService';

/**
 * Màn hình Quản Lý Hóa Đơn & Thanh Toán VNPay (Dành riêng cho Khách thuê - Tenant)
 * Cho phép khách theo dõi tiền phòng, điện, nước, internet, rác và thanh toán trực tuyến qua VNPay
 */
export default function MyInvoicesScreen({ currentUser, setCurrentScreen, onNotify }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Modal Chi tiết & Thanh toán VNPay
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  useEffect(() => {
    fetchTenantInvoices();
  }, [currentUser]);

  const fetchTenantInvoices = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // 1. Lấy thông tin phòng đang thuê từ hợp đồng của khách nếu có
      let myRoomId = currentUser.currentRoom?._id || currentUser.currentRoom || null;
      try {
        const tenantId = currentUser._id || currentUser.id;
        const contracts = await contractClientService.getAllContracts({
          tenantId,
          tenantPhone: currentUser.phone,
          tenantIdentityNumber: currentUser.identityNumber
        });
        const myContracts = contracts.filter((c) => {
          const cTenantId = c.tenantId?._id || c.tenantId;
          const matchId = cTenantId && tenantId && cTenantId.toString() === tenantId.toString();
          const matchPhone = currentUser.phone && c.tenantPhone === currentUser.phone;
          const matchCccd = currentUser.identityNumber && (c.tenantCccd === currentUser.identityNumber || c.tenantIdentityNumber === currentUser.identityNumber);
          const matchName = currentUser.fullName && c.tenantName && c.tenantName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();
          return matchId || matchPhone || matchCccd || matchName;
        });
        const active = myContracts.find((c) => c.status === 'ACTIVE') || myContracts[0];
        if (active) {
          const rObj = active.roomId?._id || active.roomId || active.room?._id || active.room;
          myRoomId = typeof rObj === 'object' ? rObj._id : rObj;
        }
      } catch (e) {
        console.error('Lỗi lấy hợp đồng:', e);
      }
      setActiveRoomId(myRoomId);

      // 2. Lấy tất cả hóa đơn từ server
      const allInvoices = await invoiceClientService.getAllInvoices();

      // 3. Lọc các hóa đơn thuộc về khách thuê hiện tại:
      // Khớp theo roomId, tenantPhone, tenantId hoặc tenantName
      const myInvoices = allInvoices.filter((inv) => {
        const invRoomId = inv.roomId?._id || inv.roomId || inv.room?._id || inv.room;
        const matchRoom = myRoomId && invRoomId && invRoomId.toString() === myRoomId.toString();
        const matchPhone = currentUser.phone && inv.tenantPhone === currentUser.phone;
        const matchId = currentUser._id && inv.tenantId && inv.tenantId.toString() === currentUser._id.toString();
        const matchName = currentUser.fullName && inv.tenantName &&
          inv.tenantName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase();

        return matchRoom || matchPhone || matchId || matchName;
      });

      setInvoices(myInvoices);
    } catch (err) {
      console.error('Lỗi tải danh sách hóa đơn:', err);
      if (onNotify) onNotify('Không thể tải danh sách hóa đơn của bạn!', 'error');
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

  // Mở Cổng thanh toán VNPay Sandbox thực tế
  const handleOpenVNPayGateway = async (inv) => {
    try {
      setPaymentLoading(true);
      const returnUrl = `${window.location.origin}/?screen=my-invoices&vnpay=return`;
      const res = await invoiceClientService.createVNPayUrl(inv._id, returnUrl);
      if (res.data && res.data.paymentUrl) {
        if (onNotify) onNotify('Đang chuyển hướng sang Cổng thanh toán VNPay...', 'info');
        window.open(res.data.paymentUrl, '_blank');
      } else {
        throw new Error('Không nhận được URL thanh toán từ server');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khởi tạo cổng VNPay!';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Mô phỏng thanh toán VNPay thành công ngay tại chỗ (Sandbox Demo Test)
  const handleSimulateVNPaySuccess = async (inv) => {
    try {
      setPaymentLoading(true);
      const res = await invoiceClientService.simulateVNPaySuccess(inv._id);
      if (res.success) {
        if (onNotify) onNotify('🎉 Thanh toán VNPay thành công! Hóa đơn đã được ghi nhận ĐÃ THANH TOÁN.', 'success');
        setSelectedInvoice(null);
        fetchTenantInvoices();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Thanh toán thất bại!';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Lọc theo trạng thái
  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

  const unpaidCount = invoices.filter((inv) => inv.status === 'UNPAID').length;
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const totalUnpaidAmount = invoices
    .filter((inv) => inv.status === 'UNPAID')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & Thông báo tổng nợ */}
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
              🧾 Hóa Đơn & Thanh Toán Tiền Phòng
            </h1>
            <span style={{
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              fontSize: '12px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px'
            }}>
              💳 Hỗ trợ VNPay Online
            </span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Theo dõi chi tiết tiền thuê phòng, điện, nước và các khoản phí dịch vụ hàng tháng. Hỗ trợ thanh toán trực tuyến qua <strong>VNPay</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentScreen('my-room')}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            border: '1px solid #bfdbfe',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🏠 Xem Thông Tin Phòng Đang Thuê ↗
        </button>
      </div>

      {/* Thẻ Thống kê tài chính nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: totalUnpaidAmount > 0 ? '#fff1f2' : '#f0fdf4',
          border: `1px solid ${totalUnpaidAmount > 0 ? '#fecdd3' : '#bbf7d0'}`,
          borderRadius: '12px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12.5px', color: totalUnpaidAmount > 0 ? '#be123c' : '#15803d', fontWeight: 'bold' }}>
            ⚠️ TỔNG TIỀN CẦN THANH TOÁN (CHƯA ĐÓNG)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: totalUnpaidAmount > 0 ? '#e11d48' : '#16a34a', marginTop: '4px' }}>
            {formatCurrency(totalUnpaidAmount)}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {unpaidCount > 0 ? `Bạn đang có ${unpaidCount} hóa đơn chưa thanh toán` : '✓ Bạn đã hoàn thành toàn bộ hóa đơn'}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>TỔNG SỐ HÓA ĐƠN</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            {invoices.length} kỳ
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Đã thanh toán: <strong>{paidCount}</strong> | Chưa thanh toán: <strong style={{ color: '#e11d48' }}>{unpaidCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>PHƯƠNG THỨC THANH TOÁN</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
              💳 VNPay QR / Thẻ ATM
            </span>
            <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
              💵 Tiền mặt tại quầy
            </span>
          </div>
        </div>
      </div>

      {/* Tabs lọc trạng thái */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filterStatus === 'ALL' ? '#2563eb' : '#f1f5f9',
            color: filterStatus === 'ALL' ? '#ffffff' : '#334155',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Tất cả hóa đơn ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('UNPAID')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filterStatus === 'UNPAID' ? '#dc2626' : '#f1f5f9',
            color: filterStatus === 'UNPAID' ? '#ffffff' : '#334155',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          🟡 Chưa thanh toán ({unpaidCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('PAID')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: filterStatus === 'PAID' ? '#16a34a' : '#f1f5f9',
            color: filterStatus === 'PAID' ? '#ffffff' : '#334155',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          🟢 Đã thanh toán ({paidCount})
        </button>
      </div>

      {/* Danh sách Hóa đơn */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div>⏳ Đang tải danh sách hóa đơn...</div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧾</div>
          <h3 style={{ fontSize: '17px', color: '#1e293b', margin: '0 0 6px 0' }}>
            Không Tìm Thấy Hóa Đơn Phù Hợp
          </h3>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
            {filterStatus === 'UNPAID'
              ? 'Tuyệt vời! Bạn không còn hóa đơn nào chưa thanh toán.'
              : 'Chưa có hóa đơn nào được phát hành cho phòng của bạn trong kỳ này.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            const roomNum = inv.room?.roomNumber || inv.roomId?.roomNumber || 'Phòng thuê';

            return (
              <div
                key={inv._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: isPaid ? '1px solid #e2e8f0' : '2px solid #fca5a5',
                  boxShadow: isPaid ? '0 2px 8px rgba(0,0,0,0.03)' : '0 4px 16px rgba(239, 68, 68, 0.08)',
                  overflow: 'hidden'
                }}
              >
                {/* Header Card Hóa đơn */}
                <div style={{
                  backgroundColor: isPaid ? '#f8fafc' : '#fff1f2',
                  borderBottom: `1px solid ${isPaid ? '#e2e8f0' : '#fecdd3'}`,
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{isPaid ? '🟢' : '🟡'}</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                        Hóa Đơn Tháng {inv.month} • {roomNum}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Mã HĐ: <strong>{inv.invoiceCode}</strong> • Ngày lập: {formatDate(inv.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: isPaid ? '#dcfce7' : '#fee2e2',
                      color: isPaid ? '#166534' : '#991b1b',
                      border: `1px solid ${isPaid ? '#bbf7d0' : '#fecaca'}`,
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '5px 12px',
                      borderRadius: '8px'
                    }}>
                      {isPaid ? '✓ ĐÃ THANH TOÁN' : '⏳ CHƯA THANH TOÁN'}
                    </span>
                  </div>
                </div>

                {/* Nội dung chi tiết các khoản phí */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '18px'
                  }}>
                    {/* Tiền phòng */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>🛏️ TIỀN THUÊ PHÒNG</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>
                        {formatCurrency(inv.roomAmount || inv.roomPrice)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Cố định theo hợp đồng</div>
                    </div>

                    {/* Tiền điện */}
                    <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                      <div style={{ fontSize: '11.5px', color: '#c2410c' }}>⚡ TIỀN ĐIỆN SINH HOẠT</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#ea580c', marginTop: '2px' }}>
                        {formatCurrency(inv.electricAmount || inv.electricCost)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9a3412' }}>
                        {inv.oldElec} ➔ {inv.newElec} ({inv.electricUsage || (inv.newElec - inv.oldElec)} kWh × 3.500đ)
                      </div>
                    </div>

                    {/* Tiền nước */}
                    <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <div style={{ fontSize: '11.5px', color: '#0369a1' }}>💧 TIỀN NƯỚC SINH HOẠT</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                        {formatCurrency(inv.waterAmount || inv.waterCost)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#075985' }}>
                        {inv.oldWater} ➔ {inv.newWater} ({inv.waterUsage || (inv.newWater - inv.oldWater)} m³ × 20.000đ)
                      </div>
                    </div>

                    {/* Phí Internet & Dịch vụ */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>🌐 DỊCH VỤ & RÁC</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>
                        {formatCurrency((inv.internetFee || 0) + (inv.garbageFee || 0) + (inv.otherFees || 0))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Wifi: {formatCurrency(inv.internetFee || 100000)} • Rác: {formatCurrency(inv.garbageFee || 50000)}
                      </div>
                    </div>
                  </div>

                  {/* Tổng cộng & Thao tác */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '16px',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>TỔNG TIỀN PHẢI THANH TOÁN:</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: isPaid ? '#16a34a' : '#dc2626' }}>
                        {formatCurrency(inv.totalAmount)}
                      </div>
                      {isPaid ? (
                        <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px' }}>
                          ✓ Đã thanh toán qua <strong>{inv.paymentMethod}</strong> ngày {formatDate(inv.paidAt)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                          Hạn thanh toán: <strong>{formatDate(inv.dueDate)}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Nếu chưa thanh toán: Nút thanh toán VNPay */}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 22px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                          }}
                        >
                          💳 Thanh Toán Qua VNPay
                        </button>
                      )}

                      {/* Nút xem chi tiết phiếu thu / in */}
                      <button
                        type="button"
                        onClick={() => setReceiptInvoice(inv)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        📄 Chi Tiết Phiếu Thu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: THANH TOÁN QUA VNPAY SANDBOX (UC09) */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px auto'
            }}>
              💳
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              Thanh Toán Hóa Đơn Qua VNPay
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 20px 0' }}>
              Mã hóa đơn: <strong>{selectedInvoice.invoiceCode}</strong> (Tháng {selectedInvoice.month})
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b' }}>Phòng trọ:</span>
                <span style={{ fontWeight: '700' }}>{selectedInvoice.room?.roomNumber || 'Phòng thuê'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b' }}>Người thanh toán:</span>
                <span style={{ fontWeight: '600' }}>{selectedInvoice.tenantName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '16px' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Số tiền thanh toán:</span>
                <span style={{ fontWeight: '900', color: '#2563eb', fontSize: '20px' }}>
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {/* Lựa chọn 1: Mở cổng VNPay Sandbox chính thức */}
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => handleOpenVNPayGateway(selectedInvoice)}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
              >
                🌐 Thanh toán qua cổng VNPay (QR / ATM)
              </button>

              {/* Lựa chọn 2: Xác nhận thanh toán Sandbox Demo Test trực tiếp */}
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => handleSimulateVNPaySuccess(selectedInvoice)}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                }}
              >
                ⚡ Xác nhận thanh toán nhanh
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM CHI TIẾT PHIẾU THU / BIÊN LAI */}
      {receiptInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e3a8a' }}>MOTEL MANAGEMENT SYSTEM</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>HỆ THỐNG QUẢN LÝ NHÀ TRỌ & CĂN HỘ DỊCH VỤ</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
                PHIẾU BÁO THU TIỀN PHÒNG & DỊCH VỤ
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Mã hóa đơn: <strong>{receiptInvoice.invoiceCode}</strong> • Tháng: <strong>{receiptInvoice.month}</strong>
              </div>
            </div>

            <div style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '16px' }}>
              <div>👤 <strong>Khách thuê:</strong> {receiptInvoice.tenantName}</div>
              <div>📞 <strong>Số điện thoại:</strong> {receiptInvoice.tenantPhone || '—'}</div>
              <div>🛏️ <strong>Phòng số:</strong> {receiptInvoice.room?.roomNumber || 'Phòng thuê'}</div>
              <div>📅 <strong>Ngày lập:</strong> {formatDate(receiptInvoice.createdAt)}</div>
              <div>
                📌 <strong>Trạng thái:</strong>{' '}
                <strong style={{ color: receiptInvoice.status === 'PAID' ? '#16a34a' : '#dc2626' }}>
                  {receiptInvoice.status === 'PAID' ? `ĐÃ THANH TOÁN (Qua ${receiptInvoice.paymentMethod})` : 'CHƯA THANH TOÁN'}
                </strong>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Khoản mục</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Chỉ số / Số lượng</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Tiền phòng</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>1 tháng</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(receiptInvoice.roomAmount || receiptInvoice.roomPrice)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Tiền điện (3.500 đ/kWh)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {receiptInvoice.electricUsage || (receiptInvoice.newElec - receiptInvoice.oldElec)} kWh
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(receiptInvoice.electricAmount || receiptInvoice.electricCost)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Tiền nước (20.000 đ/m³)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {receiptInvoice.waterUsage || (receiptInvoice.newWater - receiptInvoice.oldWater)} m³
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(receiptInvoice.waterAmount || receiptInvoice.waterCost)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Mạng Internet</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>Cố định</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(receiptInvoice.internetFee || 100000)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Vệ sinh & Rác</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>Cố định</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(receiptInvoice.garbageFee || 50000)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                  <td colSpan="2" style={{ padding: '10px 8px', fontSize: '14px', color: '#0f172a' }}>TỔNG CỘNG</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '16px', color: '#2563eb' }}>
                    {formatCurrency(receiptInvoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#1e3a8a',
                  border: '1px solid #cbd5e1',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                🖨️ In Phiếu Báo Thu
              </button>
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
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
