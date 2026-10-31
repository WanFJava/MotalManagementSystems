import React, { useState, useEffect } from 'react';
import { contractClientService } from '../services/contractClientService';
import CccdDetailModal from '../components/CccdDetailModal';
import ContractDocumentModal from '../components/ContractDocumentModal';

/**
 * Màn hình xem lại Hợp đồng của Khách thuê (Tenant)
 * Cho phép khách thuê theo dõi tất cả hợp đồng đã lập, xem chi tiết điều khoản, in hợp đồng, và xem lại CCCD
 */
export default function MyContractsScreen({ currentUser, setCurrentScreen, onNotify }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal xem văn bản hợp đồng & CCCD
  const [viewingContractDoc, setViewingContractDoc] = useState(null);
  const [viewingCccd, setViewingCccd] = useState(null);

  const fetchMyContracts = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await contractClientService.getAllContracts({
        tenantId: currentUser._id,
        tenantPhone: currentUser.phone,
        tenantIdentityNumber: currentUser.identityNumber
      });
      setContracts(data);
    } catch (err) {
      if (onNotify) onNotify('Lỗi tải danh sách hợp đồng của bạn!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContracts();
  }, [currentUser]);

  const filteredContracts = contracts.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div style={{ padding: '24px 0', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Modal hiển thị Căn Cước Công Dân (CCCD) */}
      <CccdDetailModal
        person={viewingCccd}
        onClose={() => setViewingCccd(null)}
      />

      {/* Modal hiển thị Văn bản Hợp đồng chính thức */}
      <ContractDocumentModal
        contract={viewingContractDoc}
        currentUser={currentUser}
        onClose={() => setViewingContractDoc(null)}
        onSignSuccess={() => {
          fetchMyContracts();
          if (onNotify) onNotify('Ký tên online thành công! Hợp đồng chính thức có hiệu lực và phòng đã kích hoạt.', 'success');
        }}
        onOpenCccd={(c) => {
          setViewingContractDoc(null);
          setViewingCccd(c);
        }}
      />

      {/* Tiêu đề & Bộ lọc */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>
            📄 Hợp Đồng Thuê Phòng Của Tôi
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Xem lại hợp đồng đã lập, ký tên online để kích hoạt hiệu lực, kiểm tra thời hạn và thông tin CCCD
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'WAITING_TENANT_SIGNATURE', 'ACTIVE', 'TERMINATED'].map((st) => (
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
              {st === 'ALL' ? 'Tất cả' : st === 'WAITING_TENANT_SIGNATURE' ? '✍️ Chờ bạn ký' : st === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã thanh lý'}
            </button>
          ))}
          <button
            onClick={fetchMyContracts}
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

      {/* Danh sách hợp đồng */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          Đang tải danh sách hợp đồng của bạn...
        </div>
      ) : filteredContracts.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📑</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Bạn chưa có hợp đồng thuê phòng nào
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '460px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
            Sau khi yêu cầu giữ phòng của bạn được ban quản lý phê duyệt và hoàn tất thủ tục ký hợp đồng, văn bản hợp đồng sẽ hiển thị tại đây.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentScreen('rooms')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔍 Xem danh sách phòng trống
            </button>
            <button
              onClick={() => setCurrentScreen('my-requests')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📋 Xem lại yêu cầu giữ phòng
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredContracts.map((c) => {
            const room = c.roomId || c.room || {};
            const isActive = c.status === 'ACTIVE';
            const isWaitingSignature = c.status === 'WAITING_TENANT_SIGNATURE' || c.status === 'PENDING_SIGNATURE';
            const cccdNumber = c.tenantIdentityNumber || currentUser?.identityNumber || '---';

            return (
              <div
                key={c._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: isWaitingSignature ? '2px solid #f59e0b' : isActive ? '2px solid #86efac' : '1px solid #e2e8f0',
                  boxShadow: isWaitingSignature ? '0 6px 20px rgba(245, 158, 11, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header card hợp đồng */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: isWaitingSignature ? '#fffbeb' : isActive ? '#f0fdf4' : '#f8fafc',
                  borderBottom: isWaitingSignature ? '1px solid #fef3c7' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      MÃ HỢP ĐỒNG: #{c._id?.slice(-8).toUpperCase()}
                    </span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#0f172a' }}>
                      Phòng {room.roomNumber || '---'}
                    </h3>
                  </div>
                  <span style={{
                    backgroundColor: isWaitingSignature ? '#fef3c7' : isActive ? '#dcfce7' : '#fee2e2',
                    color: isWaitingSignature ? '#b45309' : isActive ? '#166534' : '#991b1b',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: isWaitingSignature ? '1px solid #fde68a' : 'none'
                  }}>
                    {isWaitingSignature ? '✍️ CHỜ BẠN KÝ ONLINE' : isActive ? 'ĐANG HIỆU LỰC' : c.status}
                  </span>
                </div>

                {/* Banner nhắc nhở ký tên online nếu chưa ký */}
                {isWaitingSignature && (
                  <div style={{
                    backgroundColor: '#fff7ed',
                    borderBottom: '1px solid #ffedd5',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <div style={{ fontSize: '12.5px', color: '#9a3412', lineHeight: '1.4' }}>
                      <strong>Yêu cầu xác nhận:</strong> Chủ nhà đã lập hợp đồng. Bạn cần kiểm tra lại các điều khoản và bấm <strong>"Ký Tên Online"</strong> bên dưới để hợp đồng chính thức có hiệu lực và nhận phòng!
                    </div>
                  </div>
                )}

                {/* Nội dung card */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Giá thuê hàng tháng:</span>
                      <strong style={{ color: '#2563eb', fontSize: '15px' }}>
                        {Number(c.rentalPrice || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Tiền đặt cọc:</span>
                      <strong style={{ color: '#166534', fontSize: '15px' }}>
                        {Number(c.depositAmount || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Thời hạn hợp đồng:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : ''} →{' '}
                        {c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : ''}
                      </strong>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>CCCD đăng ký trên hợp đồng:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e3a8a' }}>
                        {cccdNumber}
                      </span>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Người đại diện thuê:</span>
                      <strong style={{ color: '#0f172a' }}>{c.tenantName}</strong> ({c.tenantPhone || '---'})
                    </div>
                  </div>

                  {/* Hotline hỗ trợ */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#475569',
                    marginTop: 'auto',
                    border: '1px dashed #cbd5e1'
                  }}>
                    📞 <strong>Ban quản lý hỗ trợ:</strong> 0988.123.456 (Gia hạn HĐ / Sửa chữa phòng)
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => setViewingContractDoc(c)}
                    style={{
                      flex: 1,
                      backgroundColor: isWaitingSignature ? '#d97706' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isWaitingSignature ? '0 2px 8px rgba(217, 119, 6, 0.35)' : 'none'
                    }}
                  >
                    <span>{isWaitingSignature ? '✍️' : '📄'}</span> {isWaitingSignature ? 'Xem & Ký Tên Online' : 'Xem Văn Bản HĐ'}
                  </button>

                  <button
                    onClick={() => setViewingCccd(c)}
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
