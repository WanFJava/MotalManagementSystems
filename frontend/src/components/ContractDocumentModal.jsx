import React from 'react';

/**
 * Modal hiển thị Văn bản Hợp đồng thuê phòng hoàn chỉnh
 * Cho phép cả 2 phía (Chủ trọ / Quản lý và Khách thuê) xem lại đầy đủ hợp đồng đã làm
 */
export default function ContractDocumentModal({ contract, onClose, onOpenCccd }) {
  if (!contract) return null;

  const room = contract.roomId || contract.room || {};
  const roomNumber = room.roomNumber || '---';
  const tenantUser = contract.tenantId || {};

  const tenantName = contract.tenantName || tenantUser.fullName || 'Khách thuê';
  const tenantPhone = contract.tenantPhone || tenantUser.phone || '---';
  const tenantCccd = contract.tenantIdentityNumber || tenantUser.identityNumber || 'Chưa cung cấp';
  const tenantHometown = contract.tenantHometown || tenantUser.hometown || 'Chưa cập nhật';
  const tenantAddress = contract.tenantAddress || tenantUser.currentAddress || 'Chưa cập nhật';
  const tenantDob = contract.tenantDateOfBirth || tenantUser.dateOfBirth;

  const startDateStr = contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '---';
  const endDateStr = contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '---';
  const rentalPriceNum = Number(contract.rentalPrice || 0);
  const depositAmountNum = Number(contract.depositAmount || 0);

  const isActive = contract.status === 'ACTIVE';

  const handlePrint = () => {
    window.print();
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
                Trạng thái: <strong style={{ color: isActive ? '#4ade80' : '#f87171' }}>{isActive ? 'ĐANG HIỆU LỰC' : contract.status}</strong>
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
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e3a8a', marginBottom: '4px' }}>
              I. BÊN CHO THUÊ (BÊN A):
            </div>
            <div><strong>Họ và tên / Đại diện:</strong> {contract.landlordName || 'Chủ trọ / Ban Quản lý'}</div>
            <div><strong>Số CCCD:</strong> {contract.landlordCccd || '---'} {contract.landlordDob ? `(Sinh ngày: ${new Date(contract.landlordDob).toLocaleDateString('vi-VN')})` : ''}</div>
            <div><strong>Số điện thoại:</strong> {contract.landlordPhone || '---'}</div>
            <div><strong>Địa chỉ thường trú:</strong> {contract.landlordAddress || '---'}</div>
            {contract.landlordWorkplace && <div><strong>Nơi công tác / Đơn vị:</strong> {contract.landlordWorkplace}</div>}
          </div>

          {/* BÊN B */}
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#166534', marginBottom: '4px' }}>
              II. BÊN THUÊ PHÒNG (BÊN B):
            </div>
            <div><strong>Họ và tên:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{tenantName}</span></div>
            <div><strong>Số CCCD / CMND:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{contract.tenantCccd || tenantCccd}</span> {tenantDob ? `(Sinh ngày: ${new Date(tenantDob).toLocaleDateString('vi-VN')})` : ''}</div>
            <div><strong>Số điện thoại:</strong> {tenantPhone}</div>
            <div><strong>Địa chỉ thường trú:</strong> {contract.tenantAddress || tenantAddress}</div>
            <div><strong>Quê quán:</strong> {contract.tenantHometown || tenantHometown}</div>
            {contract.tenantWorkplace && <div><strong>Nơi công tác / Học tập:</strong> {contract.tenantWorkplace}</div>}
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
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN A (CHO THUÊ)</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
              <div style={{ marginTop: '50px', fontWeight: 'bold', color: '#1e3a8a' }}>
                Ban Quản Lý Tòa Nhà
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN B (NGƯỜI THUÊ)</div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
              <div style={{ marginTop: '50px', fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>
                {tenantName}
              </div>
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
