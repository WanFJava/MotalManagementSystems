import React, { useState, useEffect } from 'react';
import { rentalRequestClientService } from '../services/rentalRequestClientService';
import CccdDetailModal from '../components/CccdDetailModal';

/**
 * Màn hình Yêu Cầu Thuê Của Tôi (MyRentalRequestsScreen)
 * Dành riêng cho Khách thuê (Tenant)
 * - Xem lại toàn bộ thông tin đã gửi và trạng thái xét duyệt yêu cầu thuê phòng
 * - Hỗ trợ hủy yêu cầu nếu đang ở trạng thái Chờ duyệt (PENDING)
 */
export default function MyRentalRequestsScreen({ currentUser, setCurrentScreen, onNotify }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [viewingCccd, setViewingCccd] = useState(null);

  // Tải danh sách yêu cầu thuê của người dùng hiện tại
  const fetchMyRequests = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await rentalRequestClientService.getAllRequests({
        userId: currentUser._id,
        tenantPhone: currentUser.phone
      });
      setRequests(data);
    } catch (err) {
      console.error('Lỗi tải danh sách yêu cầu thuê:', err);
      if (onNotify) onNotify('Không thể tải danh sách yêu cầu thuê!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [currentUser]);

  // Hủy yêu cầu thuê
  const handleCancelRequest = async (id, roomNumber) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy yêu cầu thuê phòng ${roomNumber}?`);
    if (!confirmCancel) return;

    try {
      setCancellingId(id);
      await rentalRequestClientService.cancelRequest(id);
      if (onNotify) onNotify(`Đã hủy yêu cầu thuê phòng ${roomNumber} thành công!`, 'info');
      fetchMyRequests();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi hủy yêu cầu!';
      if (onNotify) onNotify(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: '🟡 Đang chờ duyệt',
          desc: 'Quản lý đang xem xét hồ sơ của bạn và sẽ liên hệ sớm.',
          bg: '#fef3c7',
          color: '#92400e',
          border: '#fde68a'
        };
      case 'APPROVED':
        return {
          label: '🟢 Đã được duyệt',
          desc: 'Yêu cầu đã được chấp thuận! Quản lý sẽ liên hệ để hoàn tất hợp đồng nhận phòng.',
          bg: '#dcfce7',
          color: '#15803d',
          border: '#bbf7d0'
        };
      case 'REJECTED':
        return {
          label: '🔴 Bị từ chối',
          desc: 'Rất tiếc yêu cầu chưa thể đáp ứng (phòng đã có người cọc trước hoặc không phù hợp).',
          bg: '#fee2e2',
          color: '#b91c1c',
          border: '#fecaca'
        };
      case 'CANCELLED':
        return {
          label: '⚪ Đã hủy',
          desc: 'Bạn đã chủ động hủy yêu cầu giữ phòng này.',
          bg: '#f1f5f9',
          color: '#475569',
          border: '#e2e8f0'
        };
      default:
        return {
          label: status,
          desc: '',
          bg: '#f1f5f9',
          color: '#334155',
          border: '#cbd5e1'
        };
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Modal hiển thị Căn Cước Công Dân (CCCD) */}
      <CccdDetailModal
        person={viewingCccd}
        onClose={() => setViewingCccd(null)}
      />

      {/* Header */}
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
            📋 Yêu Cầu Thuê Phòng Của Tôi ({requests.length})
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Theo dõi tiến độ xét duyệt và thông tin các phòng bạn đã đăng ký giữ chỗ
          </p>
        </div>

        <button
          onClick={() => setCurrentScreen('rooms')}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔍 Tìm phòng khác
        </button>
      </div>

      {/* Danh sách yêu cầu */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
          <p style={{ fontSize: '15px' }}>Đang tải danh sách yêu cầu thuê của bạn...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 8px 0' }}>
            Bạn chưa gửi yêu cầu thuê phòng nào!
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', maxWidth: '480px', marginInline: 'auto' }}>
            Hãy khám phá danh mục phòng trọ còn trống, xem thông tin chi tiết và gửi yêu cầu giữ phòng trực tuyến ngay hôm nay.
          </p>
          <button
            onClick={() => setCurrentScreen('rooms')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🛏️ Xem danh sách phòng trống ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map((req) => {
            const statusInfo = getStatusBadge(req.status);
            const room = req.roomId || {};

            return (
              <div
                key={req._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  overflow: 'hidden'
                }}
              >
                {/* Header thanh trạng thái */}
                <div style={{
                  padding: '14px 20px',
                  backgroundColor: statusInfo.bg,
                  borderBottom: `1px solid ${statusInfo.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: statusInfo.color,
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      {statusInfo.label}
                    </span>
                    <span style={{ fontSize: '13px', color: statusInfo.color, fontWeight: '500' }}>
                      {statusInfo.desc}
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Ngày gửi: {new Date(req.requestDate || req.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Nội dung chi tiết */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                  {/* Khối thông tin phòng */}
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <img
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'}
                      alt={`Phòng ${room.roomNumber}`}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        backgroundColor: '#f1f5f9'
                      }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b' }}>
                        Phòng {room.roomNumber || '---'}
                      </h4>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563eb', marginBottom: '6px' }}>
                        {room.basePrice ? Number(room.basePrice).toLocaleString('vi-VN') + ' đ/tháng' : 'Đang cập nhật'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Trạng thái phòng: <strong>{room.status === 'AVAILABLE' ? '🟢 Còn trống' : '🔴 Đang xử lý'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Khối thông tin định danh & CCCD đã gửi */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#334155' }}>
                        📑 Hồ sơ định danh khách thuê:
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingCccd(req)}
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>🪪</span> Xem CCCD
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#475569' }}>
                      <div>Họ tên: <strong>{req.tenantName}</strong></div>
                      <div>SĐT: <strong>{req.tenantPhone}</strong></div>
                      <div>Số CCCD: <strong style={{ color: '#1e3a8a' }}>{req.identityNumber || 'Chưa cập nhật'}</strong></div>
                      <div>Thường trú (CCCD): <strong>{req.address || req.hometown || 'Chưa cập nhật'}</strong></div>
                      <div>Nơi ở hiện tại: <strong>{req.currentAddress || 'Chưa cập nhật'}</strong></div>
                    </div>
                  </div>

                  {/* Khối ghi chú & Ngày dự kiến chuyển vào */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      <div style={{ marginBottom: '4px' }}>
                        📅 Ngày dự kiến dọn vào: <strong>{req.expectedMoveInDate ? new Date(req.expectedMoveInDate).toLocaleDateString('vi-VN') : 'Sớm nhất có thể'}</strong>
                      </div>
                      {req.note && (
                        <div style={{ fontStyle: 'italic', color: '#64748b' }}>
                          💬 Ghi chú: "{req.note}"
                        </div>
                      )}
                    </div>

                    {/* Nút hủy yêu cầu nếu còn đang PENDING */}
                    {req.status === 'PENDING' && (
                      <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCancelRequest(req._id, room.roomNumber)}
                          disabled={cancellingId === req._id}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: cancellingId === req._id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {cancellingId === req._id ? 'Đang hủy...' : '🚫 Hủy yêu cầu này'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
