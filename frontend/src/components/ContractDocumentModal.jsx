import React, { useState } from 'react';
import { contractClientService } from '../services/contractClientService';

/**
 * Modal hiển thị Văn bản Hợp đồng thuê phòng hoàn chỉnh
 * Cho phép cả 2 phía (Chủ trọ / Quản lý và Khách thuê) xem lại đầy đủ hợp đồng đã làm
 * Hỗ trợ Khách thuê Bên B ký tên online để chính thức kích hoạt hợp đồng (ACTIVE)
 */
export default function ContractDocumentModal({ contract, onClose, onOpenCccd, onSignSuccess, currentUser }) {
  if (!contract) return null;

  const [signatureText, setSignatureText] = useState(currentUser?.fullName || contract.tenantName || '');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  const room = contract.roomId || contract.room || {};
  const roomNumber = room.roomNumber || '---';
  const tenantUser = contract.tenantId || {};

  const tenantName = contract.tenantName || tenantUser.fullName || 'Khách thuê';
  const tenantPhone = contract.tenantPhone || tenantUser.phone || '---';
  const tenantCccd = contract.tenantCccd || contract.tenantIdentityNumber || tenantUser.identityNumber || 'Chưa cung cấp';
  const tenantHometown = contract.tenantHometown || tenantUser.hometown || '';
  const tenantAddress = contract.tenantAddress || tenantUser.address || tenantUser.hometown || 'Chưa cập nhật';
  const tenantCurrentAddress = contract.tenantCurrentAddress || tenantUser.currentAddress || 'Chưa cập nhật';
  const tenantWorkplace = contract.tenantWorkplace || tenantUser.workplace || '';
  const tenantDob = contract.tenantDob || contract.tenantDateOfBirth || tenantUser.dateOfBirth;

  const landlordName = contract.landlordName || 'Chủ trọ / Ban Quản lý';
  const landlordPhone = contract.landlordPhone || '---';
  const landlordCccd = contract.landlordCccd || '---';
  const landlordDob = contract.landlordDob;
  const landlordAddress = contract.landlordAddress || '---';
  const landlordCurrentAddress = contract.landlordCurrentAddress || '---';
  const landlordWorkplace = contract.landlordWorkplace || '';

  const startDateStr = contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '---';
  const endDateStr = contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '---';
  const rentalPriceNum = Number(contract.rentalPrice || 0);
  const depositAmountNum = Number(contract.depositAmount || 0);

  const isActive = contract.status === 'ACTIVE';
  const isWaitingSignature = contract.status === 'WAITING_TENANT_SIGNATURE' || contract.status === 'PENDING_SIGNATURE';
  const isTenant = currentUser?.role === 'TENANT' || currentUser?.phone === contract.tenantPhone || currentUser?._id === (contract.tenantId?._id || contract.tenantId);

  const handlePrint = () => {
    window.print();
  };

  const handleSignContract = async () => {
    if (!signatureText.trim()) {
      alert('Vui lòng nhập họ và tên để xác nhận chữ ký điện tử online!');
      return;
    }
    if (!hasAgreed) {
      alert('Vui lòng tích chọn xác nhận đồng ý với các điều khoản của hợp đồng!');
      return;
    }

    try {
      setSigning(true);
      const res = await contractClientService.signContract(contract._id, {
        signature: signatureText.trim(),
        tenantName: signatureText.trim(),
        userId: currentUser?._id
      });
      alert('🎉 ' + res.message);
      if (onSignSuccess) {
        onSignSuccess(res.data);
      }
      onClose();
    } catch (err) {
      alert('Ký tên online thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setSigning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '820px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Top Bar / Actions */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📄</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                VĂN BẢN HỢP ĐỒNG THUÊ PHÒNG #{contract._id?.slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Trạng thái: <strong style={{ color: isActive ? '#4ade80' : isWaitingSignature ? '#fbbf24' : '#f87171' }}>
                  {isActive ? 'ĐANG HIỆU LỰC (ACTIVE)' : isWaitingSignature ? 'CHỜ BÊN B KÝ ONLINE (CHƯA HIỆU LỰC)' : contract.status}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onOpenCccd && (
              <button
                onClick={() => onOpenCccd(contract)}
                style={{
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🪪</span> Xem CCCD khách
              </button>
            )}
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#334155',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🖨️ In hợp đồng
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Banner hướng dẫn ký online nếu hợp đồng đang chờ ký */}
        {isWaitingSignature && (
          <div style={{
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>✍️</span>
              <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>
                Hợp đồng chưa có hiệu lực chính thức! Khách thuê (Bên B) cần xem xét kỹ các điều khoản và ký tên online ở cuối văn bản để kích hoạt hợp đồng (ACTIVE).
              </span>
            </div>
            {isTenant && (
              <button
                type="button"
                onClick={() => {
                  const signArea = document.getElementById('tenant-signing-box');
                  if (signArea) signArea.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ↓ Đến khu vực ký tên
              </button>
            )}
          </div>
        )}

        {/* Nội dung hợp đồng chính thức (Cuộn được) */}
        <div style={{
          padding: '36px 44px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          fontSize: '14px',
          lineHeight: '1.7',
          fontFamily: '"Times New Roman", Times, serif'
        }}>
          {/* Quốc hiệu & Tiêu ngữ */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px' }}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', textDecoration: 'underline' }}>
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div style={{ marginTop: '16px', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              HỢP ĐỒNG THUÊ PHÒNG TRỌ
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#475569' }}>
              (Số HĐ: HD-{contract._id?.slice(-6).toUpperCase()}/{new Date(contract.startDate || Date.now()).getFullYear()})
            </div>
          </div>

          <p style={{ fontStyle: 'italic', textIndent: '24px', margin: '8px 0' }}>
            - Căn cứ Bộ Luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam;
          </p>
          <p style={{ fontStyle: 'italic', textIndent: '24px', margin: '8px 0' }}>
            - Căn cứ nhu cầu thực tế và sự thỏa thuận tự nguyện giữa hai bên thuê và cho thuê;
          </p>

          <p style={{ margin: '14px 0 6px 0' }}>
            Hôm nay, ngày <strong>{startDateStr}</strong>, tại Khu nhà trọ Motel Management, chúng tôi gồm có:
          </p>

          {/* BÊN A */}
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a', marginBottom: '6px' }}>
              I. BÊN CHO THUÊ (BÊN A):
            </div>
            <div><strong>Họ và tên / Đại diện:</strong> {landlordName}</div>
            <div><strong>Ngày tháng năm sinh (theo CCCD):</strong> {landlordDob ? new Date(landlordDob).toLocaleDateString('vi-VN') : '---'}</div>
            <div><strong>Số CCCD:</strong> {landlordCccd}</div>
            <div><strong>Quê quán / Địa chỉ thường trú (ghi trên CCCD):</strong> {landlordAddress}</div>
            <div><strong>Nơi ở hiện tại / Địa chỉ liên hệ:</strong> {landlordCurrentAddress}</div>
            <div><strong>Số điện thoại liên hệ:</strong> {landlordPhone}</div>
          </div>

          {/* BÊN B */}
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#166534', marginBottom: '6px' }}>
              II. BÊN THUÊ PHÒNG (BÊN B):
            </div>
            <div><strong>Họ và tên:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{tenantName}</span></div>
            <div><strong>Ngày tháng năm sinh (theo CCCD):</strong> {tenantDob ? new Date(tenantDob).toLocaleDateString('vi-VN') : '---'}</div>
            <div><strong>Số CCCD / CMND:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{contract.tenantCccd || tenantCccd}</span></div>
            <div><strong>Quê quán / Địa chỉ thường trú (ghi trên CCCD):</strong> {contract.tenantAddress || tenantAddress}</div>
            <div><strong>Nơi ở hiện tại / Địa chỉ liên hệ:</strong> {tenantCurrentAddress}</div>
            <div><strong>Số điện thoại liên hệ:</strong> {tenantPhone}</div>
          </div>

          {/* ĐIỀU KHOẢN HỢP ĐỒNG */}
          <div style={{ marginTop: '20px' }}>
            <p><strong>Sau khi bàn bạc thống nhất, hai bên nhất trí ký kết hợp đồng thuê phòng với các điều khoản sau:</strong></p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 1. Đối tượng hợp đồng:</strong><br />
              Bên A đồng ý cho Bên B thuê phòng số <strong>{roomNumber}</strong> thuộc tòa nhà quản lý của Bên A. Phòng được bàn giao với đầy đủ các trang thiết bị tiện nghi cơ bản theo biên bản bàn giao.
            </p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 2. Thời hạn thuê phòng:</strong><br />
              Thời hạn thuê từ ngày <strong>{startDateStr}</strong> đến hết ngày <strong>{endDateStr}</strong>. Nếu hai bên có nhu cầu tiếp tục thuê sẽ tiến hành thủ tục gia hạn hợp đồng trước khi kết thúc 15 ngày.
            </p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 3. Giá thuê và Tiền đặt cọc:</strong><br />
              - Giá thuê phòng: <strong>{rentalPriceNum.toLocaleString('vi-VN')} VNĐ/tháng</strong> (chưa bao gồm chi phí điện, nước, dịch vụ sinh hoạt). Tiền thuê được thanh toán định kỳ vào đầu mỗi tháng.<br />
              - Tiền đặt cọc bảo đảm hợp đồng: <strong>{depositAmountNum.toLocaleString('vi-VN')} VNĐ</strong>. Số tiền này sẽ được Bên A hoàn trả lại cho Bên B sau khi thanh lý hợp đồng và bàn giao lại nguyên vẹn phòng cùng tài sản.
            </p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 4. Quyền và nghĩa vụ của Bên A:</strong><br />
              - Bàn giao phòng đúng hẹn, đảm bảo nguồn điện, nước và an ninh trật tự chung cho tòa nhà.<br />
              - Hỗ trợ sửa chữa các hư hỏng thuộc hạ tầng cơ bản của tòa nhà kịp thời.<br />
              - Đăng ký tạm trú với cơ quan công an địa phương theo thông tin CCCD Bên B đã cung cấp.
            </p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 5. Quyền và nghĩa vụ của Bên B:</strong><br />
              - Sử dụng phòng đúng mục đích để ở, không thực hiện các hành vi vi phạm pháp luật.<br />
              - Chấp hành nghiêm chỉnh nội quy phòng trọ và quy định về phòng cháy chữa cháy (PCCC).<br />
              - Cung cấp đầy đủ thông tin Căn Cước Công Dân (CCCD) chính xác để bên A khai báo lưu trú.<br />
              - Thanh toán đầy đủ tiền thuê và các chi phí dịch vụ đúng hạn.
            </p>

            <p style={{ margin: '10px 0' }}>
              <strong>Điều 6. Cam kết chung & Hiệu lực hợp đồng:</strong><br />
              Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện. Hợp đồng có hiệu lực kể từ ngày ký.
            </p>
          </div>

          {/* Ký tên hai bên */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginTop: '36px',
            gap: '24px',
            textAlign: 'center'
          }}>
            {/* Chữ ký Bên A */}
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>ĐẠI DIỆN BÊN A (CHO THUÊ)</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748b' }}>(Đã ký điện tử xác nhận)</div>
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px dashed #3b82f6',
                display: 'inline-block',
                minWidth: '220px'
              }}>
                <div style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '15px' }}>
                  ✍️ {contract.landlordSignature || contract.landlordName || 'Chủ trọ / Ban Quản lý'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Ngày ký: {contract.landlordSignedAt ? new Date(contract.landlordSignedAt).toLocaleDateString('vi-VN') : (contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('vi-VN') : '---')}
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                  ✓ Bên A đã ký xác nhận
                </div>
              </div>
            </div>

            {/* Chữ ký Bên B */}
            <div id="tenant-signing-box">
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>ĐẠI DIỆN BÊN B (NGƯỜI THUÊ)</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: isActive ? '#166534' : '#b45309' }}>
                {isActive ? '(Đã ký tên xác nhận online)' : '(Bắt buộc ký tên online để kích hoạt HĐ)'}
              </div>

              {isActive ? (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px dashed #22c55e',
                  display: 'inline-block',
                  minWidth: '220px'
                }}>
                  <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase' }}>
                    ✍️ {contract.tenantSignature || tenantName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Thời gian ký: {contract.tenantSignedAt ? new Date(contract.tenantSignedAt).toLocaleString('vi-VN') : (contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('vi-VN') : '---')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                    ✓ Hợp đồng có hiệu lực chính thức (ACTIVE)
                  </div>
                </div>
              ) : isTenant ? (
                <div style={{
                  marginTop: '14px',
                  padding: '16px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '10px',
                  border: '2px solid #f59e0b',
                  textAlign: 'left'
                }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#78350f', marginBottom: '4px' }}>
                    Họ và tên người ký xác nhận: *
                  </label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Nhập họ và tên của bạn..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="agreeCheck"
                      checked={hasAgreed}
                      onChange={(e) => setHasAgreed(e.target.checked)}
                      style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="agreeCheck" style={{ fontSize: '12px', color: '#92400e', cursor: 'pointer', lineHeight: '1.4' }}>
                      Tôi là <strong>{tenantName}</strong> (CCCD: {tenantCccd}). Tôi đã kiểm tra kỹ các điều khoản và cam kết <strong>ký tên online để chính thức kích hoạt hợp đồng</strong>.
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignContract}
                    disabled={signing || !hasAgreed || !signatureText.trim()}
                    style={{
                      width: '100%',
                      backgroundColor: (!hasAgreed || !signatureText.trim()) ? '#94a3b8' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: (!hasAgreed || !signatureText.trim() || signing) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 10px rgba(22,163,74,0.2)'
                    }}
                  >
                    {signing ? '⏳ Đang xác nhận chữ ký...' : '✍️ Xác Nhận Ký Tên Online & Kích Hoạt Hợp Đồng'}
                  </button>
                </div>
              ) : (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fff7ed',
                  borderRadius: '8px',
                  border: '1px dashed #ea580c',
                  display: 'inline-block',
                  minWidth: '220px'
                }}>
                  <div style={{ color: '#c2410c', fontWeight: 'bold', fontSize: '14px' }}>
                    ⏳ Đang chờ khách thuê ký online
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Khách thuê: <strong>{tenantName}</strong> ({tenantPhone})
                  </div>
                  <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '2px' }}>
                    Hợp đồng chỉ kích hoạt ACTIVE sau khi khách ký
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#475569',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Đóng văn bản
          </button>
        </div>
      </div>
    </div>
  );
}
