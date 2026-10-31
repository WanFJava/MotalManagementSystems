import React, { useState, useEffect } from 'react';
import { rentalRequestClientService } from '../services/rentalRequestClientService';
import CccdDetailModal from '../components/CccdDetailModal';

export default function ManageRentalRequestsScreen({ onNotify, onNavigateToCreateContract }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewingCccdReq, setViewingCccdReq] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await rentalRequestClientService.getAllRequests();
      setRequests(data);
    } catch (err) {
      if (onNotify) onNotify('Lỗi tải danh sách yêu cầu thuê!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status, tenantName) => {
    const actionName = status === 'APPROVED' ? 'Phê duyệt' : 'Từ chối';
    if (!window.confirm(`Bạn có chắc muốn ${actionName.toLowerCase()} yêu cầu thuê của "${tenantName}"?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      await rentalRequestClientService.updateStatus(id, status);
      if (onNotify) onNotify(`Đã ${actionName.toLowerCase()} yêu cầu thành công!`, 'success');
      fetchRequests();
    } catch (err) {
      if (onNotify) onNotify(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Đã duyệt', bg: '#dcfce7', color: '#166534' };
      case 'REJECTED':
        return { text: 'Từ chối', bg: '#fee2e2', color: '#991b1b' };
      case 'CANCELLED':
        return { text: 'Đã hủy', bg: '#f1f5f9', color: '#64748b' };
      default:
        return { text: 'Chờ duyệt', bg: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Modal xem thông tin CCCD */}
      <CccdDetailModal request={viewingCccdReq} onClose={() => setViewingCccdReq(null)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '24px' }}>
            📋 Quản Lý Yêu Cầu Thuê Phòng
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Xem xét, kiểm tra CCCD, duyệt hoặc từ chối các yêu cầu giữ phòng của khách thuê
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
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
              {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ duyệt' : st === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
            </button>
          ))}
          <button
            onClick={fetchRequests}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Đang tải danh sách yêu cầu thuê...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          Không có yêu cầu thuê nào phù hợp bộ lọc.
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
                <th style={{ padding: '14px 16px' }}>Phòng</th>
                <th style={{ padding: '14px 16px' }}>Khách thuê</th>
                <th style={{ padding: '14px 16px' }}>Định danh CCCD</th>
                <th style={{ padding: '14px 16px' }}>Số điện thoại</th>
                <th style={{ padding: '14px 16px' }}>Dự kiến vào ở</th>
                <th style={{ padding: '14px 16px' }}>Ghi chú</th>
                <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const badge = getStatusBadge(req.status);
                const room = req.roomId || {};
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';

                return (
                  <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#1e293b' }}>
                      Phòng {room.roomNumber || '---'}
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>
                        {room.basePrice ? Number(room.basePrice).toLocaleString('vi-VN') + ' đ' : ''}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {req.tenantName}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '13px' }}>
                          {req.identityNumber || 'Chưa cập nhật'}
                        </span>
                        <button
                          onClick={() => setViewingCccdReq(req)}
                          title="Xem chi tiết hồ sơ CCCD"
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          🪪 Xem CCCD
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Quê: {req.hometown || 'Chưa rõ'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {req.tenantPhone || '---'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                      {req.expectedMoveInDate ? new Date(req.expectedMoveInDate).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px', maxWidth: '180px' }}>
                      {req.note || '---'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {badge.text}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {actionLoadingId === req._id ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Đang xử lý...</span>
                      ) : isPending ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'APPROVED', req.tenantName)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req._id, 'REJECTED', req.tenantName)}
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
                            ✕ Từ chối
                          </button>
                        </div>
                      ) : isApproved ? (
                        <button
                          onClick={() => {
                            if (onNavigateToCreateContract) {
                              onNavigateToCreateContract({
                                roomId: room._id,
                                roomNumber: room.roomNumber,
                                tenantId: req.userId?._id || req.userId,
                                tenantName: req.tenantName,
                                tenantPhone: req.tenantPhone,
                                tenantIdentityNumber: req.identityNumber,
                                tenantCccd: req.identityNumber,
                                tenantDob: req.dateOfBirth ? req.dateOfBirth.slice(0, 10) : '',
                                tenantGender: req.gender,
                                tenantHometown: req.hometown,
                                tenantAddress: req.currentAddress || req.hometown,
                                tenantIdentityIssuedDate: req.identityIssuedDate ? req.identityIssuedDate.slice(0, 10) : '',
                                tenantIdentityIssuedPlace: req.identityIssuedPlace,
                                rentalPrice: room.basePrice
                              });
                            }
                          }}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📄 Lập hợp đồng
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Không có thao tác</span>
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
