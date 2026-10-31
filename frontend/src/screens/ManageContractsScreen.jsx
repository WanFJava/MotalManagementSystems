import React, { useState, useEffect } from 'react';
import { contractClientService } from '../services/contractClientService';
import { roomClientService } from '../services/roomClientService';
import { userClientService } from '../services/userClientService';

export default function ManageContractsScreen({ currentUser, setCurrentScreen, onNotify, initialPrefill, onClearPrefill }) {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal xem chi tiết bản hợp đồng pháp lý
  const [viewContract, setViewContract] = useState(null);

  // Form Lập Hợp đồng mới
  const [showCreateForm, setShowCreateForm] = useState(!!initialPrefill);
  const [form, setForm] = useState({
    // Bên cho thuê (Bên A - Lấy đúng theo role đăng nhập: MANAGER / STAFF)
    landlordName: currentUser?.fullName || '',
    landlordDob: currentUser?.dateOfBirth ? currentUser.dateOfBirth.slice(0, 10) : '',
    landlordCccd: currentUser?.identityNumber || '',
    landlordAddress: currentUser?.currentAddress || currentUser?.address || currentUser?.hometown || '',
    landlordPhone: currentUser?.phone || '',
    landlordWorkplace: currentUser?.workplace || '',

    // Bên thuê (Bên B - Lấy từ CCCD người thuê / Đơn yêu cầu thuê đã duyệt)
    tenantId: initialPrefill?.tenantId || '',
    tenantName: initialPrefill?.tenantName || '',
    tenantDob: initialPrefill?.tenantDob ? initialPrefill.tenantDob.slice(0, 10) : (initialPrefill?.dateOfBirth ? initialPrefill.dateOfBirth.slice(0, 10) : ''),
    tenantCccd: initialPrefill?.tenantCccd || initialPrefill?.tenantIdentityNumber || '',
    tenantAddress: initialPrefill?.tenantAddress || initialPrefill?.currentAddress || initialPrefill?.hometown || '',
    tenantPhone: initialPrefill?.tenantPhone || initialPrefill?.phone || '',
    tenantWorkplace: initialPrefill?.tenantWorkplace || '',
    tenantGender: initialPrefill?.tenantGender || initialPrefill?.gender || 'MALE',
    tenantIdentityIssuedDate: initialPrefill?.tenantIdentityIssuedDate ? initialPrefill.tenantIdentityIssuedDate.slice(0, 10) : '',
    tenantIdentityIssuedPlace: initialPrefill?.tenantIdentityIssuedPlace || '',

    // Thông tin hợp đồng & tài chính
    signedDate: new Date().toISOString().split('T')[0],
    roomId: initialPrefill?.roomId || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    depositAmount: '',
    rentalPrice: initialPrefill?.rentalPrice || ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
  }, []);

  // Tự động đồng bộ thông tin Bên A khi currentUser được tải hoặc thay đổi
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        landlordName: prev.landlordName || currentUser.fullName || '',
        landlordDob: prev.landlordDob || (currentUser.dateOfBirth ? currentUser.dateOfBirth.slice(0, 10) : ''),
        landlordCccd: prev.landlordCccd || currentUser.identityNumber || '',
        landlordAddress: prev.landlordAddress || currentUser.currentAddress || currentUser.address || currentUser.hometown || '',
        landlordPhone: prev.landlordPhone || currentUser.phone || '',
        landlordWorkplace: prev.landlordWorkplace || currentUser.workplace || ''
      }));
    }
  }, [currentUser]);

  // Tự động điền thông tin Bên B khi nhận initialPrefill từ Yêu cầu thuê
  useEffect(() => {
    if (initialPrefill) {
      setShowCreateForm(true);
      setForm((prev) => ({
        ...prev,
        roomId: initialPrefill.roomId || prev.roomId,
        tenantId: initialPrefill.tenantId || prev.tenantId || '',
        tenantName: initialPrefill.tenantName || prev.tenantName,
        tenantPhone: initialPrefill.tenantPhone || initialPrefill.phone || prev.tenantPhone,
        tenantCccd: initialPrefill.tenantCccd || initialPrefill.tenantIdentityNumber || prev.tenantCccd,
        tenantDob: initialPrefill.tenantDob ? initialPrefill.tenantDob.slice(0, 10) : (initialPrefill.dateOfBirth ? initialPrefill.dateOfBirth.slice(0, 10) : prev.tenantDob),
        tenantAddress: initialPrefill.tenantAddress || initialPrefill.currentAddress || initialPrefill.hometown || prev.tenantAddress,
        tenantWorkplace: initialPrefill.tenantWorkplace || prev.tenantWorkplace,
        tenantGender: initialPrefill.tenantGender || initialPrefill.gender || prev.tenantGender,
        tenantIdentityIssuedDate: initialPrefill.tenantIdentityIssuedDate ? initialPrefill.tenantIdentityIssuedDate.slice(0, 10) : prev.tenantIdentityIssuedDate,
        tenantIdentityIssuedPlace: initialPrefill.tenantIdentityIssuedPlace || prev.tenantIdentityIssuedPlace,
        rentalPrice: initialPrefill.rentalPrice || prev.rentalPrice
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

  const fetchTenants = async () => {
    try {
      const data = await userClientService.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Lỗi tải danh sách khách thuê:', err);
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

  // Chọn khách thuê từ danh sách khách thuê để auto-fill thông tin CCCD thật
  const handleSelectTenant = (tenantId) => {
    if (!tenantId) {
      return;
    }
    const t = tenants.find((item) => item._id === tenantId);
    if (!t) return;

    setForm((prev) => ({
      ...prev,
      tenantId: t._id,
      tenantName: t.fullName || '',
      tenantPhone: t.phone || '',
      tenantCccd: t.identityNumber || '',
      tenantDob: t.dateOfBirth ? t.dateOfBirth.slice(0, 10) : '',
      tenantAddress: t.currentAddress || t.address || t.hometown || '',
      tenantWorkplace: t.workplace || '',
      tenantGender: t.gender || 'MALE',
      tenantIdentityIssuedDate: t.identityIssuedDate ? t.identityIssuedDate.slice(0, 10) : '',
      tenantIdentityIssuedPlace: t.identityIssuedPlace || ''
    }));
  };

  // Kiểm tra danh sách các trường còn thiếu của Bên A và Bên B
  const missingA = [];
  if (!form.landlordName?.trim()) missingA.push('Họ và tên');
  if (!form.landlordPhone?.trim()) missingA.push('Số điện thoại');
  if (!form.landlordCccd?.trim()) missingA.push('Số CCCD');
  if (!form.landlordDob) missingA.push('Ngày sinh');
  if (!form.landlordAddress?.trim()) missingA.push('Địa chỉ thường trú');

  const missingB = [];
  if (!form.tenantName?.trim()) missingB.push('Họ và tên');
  if (!form.tenantPhone?.trim()) missingB.push('Số điện thoại');
  if (!form.tenantCccd?.trim()) missingB.push('Số CCCD');
  if (!form.tenantDob) missingB.push('Ngày sinh');
  if (!form.tenantAddress?.trim()) missingB.push('Địa chỉ thường trú');

  // UC05: Tạo hợp đồng mới - Kiểm tra đủ điều kiện thông tin 2 bên
  const handleSubmitContract = async (e) => {
    e.preventDefault();
    if (!form.roomId) {
      alert('Vui lòng chọn Phòng trọ để lập hợp đồng!');
      return;
    }
    if (!form.startDate || !form.endDate || !form.depositAmount || !form.rentalPrice) {
      alert('Vui lòng điền đầy đủ các thông tin điều khoản và tài chính (*)!');
      return;
    }

    // Kiểm tra tính đầy đủ thông tin pháp lý CCCD của 2 bên
    if (missingA.length > 0 || missingB.length > 0) {
      let errorMsg = '⚠️ KHÔNG ĐỦ THÔNG TIN ĐỊNH DANH ĐỂ LẬP HỢP ĐỒNG PHÁP LÝ:\n';
      if (missingA.length > 0) {
        errorMsg += `\n• Bên cho thuê (Bên A) còn thiếu: ${missingA.join(', ')}`;
      }
      if (missingB.length > 0) {
        errorMsg += `\n• Bên thuê (Bên B) còn thiếu: ${missingB.join(', ')}`;
      }
      errorMsg += '\n\nVui lòng cập nhật đầy đủ thông tin Căn cước công dân (CCCD) của cả 2 bên trước khi tạo hợp đồng!';
      alert(errorMsg);
      if (onNotify) onNotify('Thông tin cá nhân 2 bên chưa đủ để lập hợp đồng! Vui lòng cập nhật đủ.', 'error');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '24px' }}>
            📄 Quản Lý Hợp Đồng Thuê Phòng
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Lập hợp đồng chuẩn pháp lý, xem lại chi tiết hợp đồng, gia hạn và thanh lý
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
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '19px' }}>
              📝 Lập Hợp Đồng Thuê Phòng Mới (UC05)
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              Điền đầy đủ thông tin pháp lý của Bên cho thuê (Chủ nhà) và Bên thuê (Khách trọ) để sinh văn bản hợp đồng.
            </p>
          </div>

          <form onSubmit={handleSubmitContract}>
            {/* PHẦN 1: BÊN CHO THUÊ (BÊN A) */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢</span> I. THÔNG TIN BÊN CHO THUÊ (BÊN A - {currentUser?.role === 'MANAGER' ? 'CHỦ TRỌ' : 'QUẢN LÝ / NHÂN VIÊN'})
                </h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Tự động điền từ tài khoản đăng nhập: <strong>{currentUser?.fullName || 'Chưa đăng nhập'}</strong>
                </span>
              </div>

              {missingA.length > 0 && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <strong style={{ color: '#991b1b', fontSize: '13px' }}>
                      ⚠️ Hồ sơ Bên cho thuê (Bên A - Bạn) chưa đủ thông tin pháp lý CCCD để lập hợp đồng:
                    </strong>
                    <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '2px' }}>
                      Còn thiếu: <strong>{missingA.join(', ')}</strong>. Vui lòng nhập trực tiếp bên dưới hoặc bấm nút để cập nhật vào Hồ sơ cá nhân.
                    </div>
                  </div>
                  {setCurrentScreen && (
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('profile')}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Cập nhật Profile
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Họ và tên bên cho thuê: *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={form.landlordName}
                    onChange={(e) => setForm({ ...form, landlordName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.landlordName ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Ngày tháng năm sinh: *</label>
                  <input
                    type="date"
                    required
                    value={form.landlordDob}
                    onChange={(e) => setForm({ ...form, landlordDob: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.landlordDob ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Số CCCD / CMND (12 số): *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="VD: 001090012345"
                    value={form.landlordCccd}
                    onChange={(e) => setForm({ ...form, landlordCccd: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.landlordCccd ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Số điện thoại liên hệ: *</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={form.landlordPhone}
                    onChange={(e) => setForm({ ...form, landlordPhone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.landlordPhone ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Địa chỉ thường trú theo CCCD: *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Số 123 Đường Cầu Giấy, Cầu Giấy, Hà Nội"
                    value={form.landlordAddress}
                    onChange={(e) => setForm({ ...form, landlordAddress: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.landlordAddress ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Nơi công tác / Đơn vị:</label>
                  <input
                    type="text"
                    placeholder="VD: Ban Quản lý Khu Nhà trọ"
                    value={form.landlordWorkplace}
                    onChange={(e) => setForm({ ...form, landlordWorkplace: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* PHẦN 2: BÊN THUÊ (BÊN B) */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span> II. THÔNG TIN BÊN THUÊ (BÊN B - KHÁCH TRỌ)
                </h4>
                <span style={{ fontSize: '12px', color: '#15803d' }}>
                  Lấy từ CCCD người thuê hoặc hồ sơ yêu cầu thuê phòng đã duyệt
                </span>
              </div>

              {/* Chọn khách thuê từ danh sách hệ thống */}
              <div style={{ marginBottom: '14px', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #86efac' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>
                  🔍 Chọn nhanh từ danh sách khách thuê đã có tài khoản / CCCD trong hệ thống:
                </label>
                <select
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  value={form.tenantId || ''}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Chọn khách thuê để tự động điền CCCD thật (hoặc giữ thông tin từ đơn thuê) --</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} - SĐT: {t.phone} {t.identityNumber ? `| CCCD: ${t.identityNumber}` : '| (Chưa cập nhật CCCD)'}
                    </option>
                  ))}
                </select>
              </div>

              {missingB.length > 0 && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '14px'
                }}>
                  <strong style={{ color: '#92400e', fontSize: '13px' }}>
                    ⚠️ Bên thuê (Bên B) chưa đủ điều kiện thông tin định danh CCCD để lập hợp đồng:
                  </strong>
                  <div style={{ color: '#b45309', fontSize: '12px', marginTop: '2px' }}>
                    Còn thiếu: <strong>{missingB.join(', ')}</strong>. Vui lòng yêu cầu khách thuê hoàn thiện hồ sơ hoặc nhập chính xác theo Căn cước công dân của khách thuê trước khi lập hợp đồng.
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Họ và tên khách thuê: *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn B"
                    value={form.tenantName}
                    onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.tenantName ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Ngày tháng năm sinh: *</label>
                  <input
                    type="date"
                    required
                    value={form.tenantDob}
                    onChange={(e) => setForm({ ...form, tenantDob: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.tenantDob ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Số CCCD / CMND (12 số): *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="VD: 038204001234"
                    value={form.tenantCccd}
                    onChange={(e) => setForm({ ...form, tenantCccd: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.tenantCccd ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Số điện thoại liên hệ: *</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912345678"
                    value={form.tenantPhone}
                    onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.tenantPhone ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Địa chỉ thường trú theo CCCD: *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Xã Yên Cường, Ý Yên, Nam Định"
                    value={form.tenantAddress}
                    onChange={(e) => setForm({ ...form, tenantAddress: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: form.tenantAddress ? '1px solid #cbd5e1' : '1px solid #ef4444', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Nơi công tác / Học tập:</label>
                  <input
                    type="text"
                    placeholder="VD: Đại học FPT / Công ty ABC"
                    value={form.tenantWorkplace}
                    onChange={(e) => setForm({ ...form, tenantWorkplace: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* PHẦN 3: ĐIỀU KHOẢN HỢP ĐỒNG & TÀI CHÍNH */}
            <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '12px', border: '1px solid #fed7aa', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#c2410c', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💰</span> III. THÔNG TIN PHÒNG, THỜI HẠN & TÀI CHÍNH
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Ngày ký hợp đồng: *</label>
                  <input
                    type="date"
                    required
                    value={form.signedDate}
                    onChange={(e) => setForm({ ...form, signedDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Chọn phòng trọ: *</label>
                  <select
                    required
                    value={form.roomId}
                    onChange={(e) => handleSelectRoom(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Ngày bắt đầu thuê: *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Ngày kết thúc hợp đồng: *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Tiền đặt cọc (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="VD: 3000000"
                    value={form.depositAmount}
                    onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Giá thuê hàng tháng (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="VD: 2500000"
                    value={form.rentalPrice}
                    onChange={(e) => setForm({ ...form, rentalPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
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
                <th style={{ padding: '14px 16px' }}>Bên Thuê (Khách)</th>
                <th style={{ padding: '14px 16px' }}>Ngày ký & Thời hạn</th>
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
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.tenantName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>SĐT: {c.tenantPhone || '---'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontSize: '13px' }}>
                      <div>Ký: {formatDate(c.signedDate || c.createdAt)}</div>
                      <div style={{ color: '#2563eb', fontWeight: '500' }}>
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </div>
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
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* NÚT XEM LẠI HỢP ĐỒNG */}
                        <button
                          onClick={() => setViewContract(c)}
                          style={{
                            backgroundColor: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ Xem HĐ
                        </button>

                        {isActive && (
                          <>
                            <button
                              onClick={() => handleExtend(c)}
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 10px',
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
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              ⚠️ Thanh lý
                            </button>
                          </>
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

      {/* ======================================================== */}
      {/* MODAL XEM CHI TIẾT VĂN BẢN HỢP ĐỒNG THUÊ TRỌ HOÀN CHỈNH */}
      {/* ======================================================== */}
      {viewContract && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header thanh công cụ Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>
                📄 Xem lại Hợp Đồng Thuê Phòng #{viewContract.roomId?.roomNumber || viewContract.room?.roomNumber}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🖨️ In / Tải PDF
                </button>
                <button
                  onClick={() => setViewContract(null)}
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Đóng
                </button>
              </div>
            </div>

            {/* Nội dung bản Hợp Đồng theo thể thức văn bản */}
            <div id="printable-contract" style={{
              padding: '40px 48px',
              overflowY: 'auto',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#000000',
              backgroundColor: '#ffffff'
            }}>
              {/* Quốc hiệu tiêu ngữ */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ margin: '4px auto 0 auto', width: '160px', borderBottom: '1px solid #000' }}></div>
              </div>

              {/* Tên Hợp Đồng */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </h2>
                <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
                  Số: HĐ-{viewContract._id.toString().slice(-6).toUpperCase()}/MMS
                </div>
              </div>

              {/* Ngày tháng ký kết */}
              <p style={{ fontStyle: 'italic', marginBottom: '16px' }}>
                Hôm nay, ngày {new Date(viewContract.signedDate || viewContract.createdAt).getDate()} tháng {new Date(viewContract.signedDate || viewContract.createdAt).getMonth() + 1} năm {new Date(viewContract.signedDate || viewContract.createdAt).getFullYear()}, tại địa chỉ: {viewContract.landlordAddress || 'Khu nhà trọ Motel Management Systems'}.
              </p>

              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Chúng tôi gồm có các bên dưới đây:</p>

              {/* I. BÊN CHO THUÊ (BÊN A) */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  I. BÊN CHO THUÊ (BÊN A - CHỦ NHÀ / ĐẠI DIỆN):
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '12px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '220px', padding: '3px 0' }}>• Họ và tên:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.landlordName || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Ngày tháng năm sinh:</td>
                      <td>{formatDate(viewContract.landlordDob)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• CMND / CCCD số:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.landlordCccd || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Địa chỉ thường trú:</td>
                      <td>{viewContract.landlordAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Số điện thoại liên hệ:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.landlordPhone || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Nơi công tác / Đơn vị:</td>
                      <td>{viewContract.landlordWorkplace || '---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* II. BÊN THUÊ (BÊN B) */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  II. BÊN THUÊ PHÒNG (BÊN B - KHÁCH TRỌ):
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '12px' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '220px', padding: '3px 0' }}>• Họ và tên:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.tenantName}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Ngày tháng năm sinh:</td>
                      <td>{formatDate(viewContract.tenantDob)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• CMND / CCCD số:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.tenantCccd || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Địa chỉ thường trú:</td>
                      <td>{viewContract.tenantAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Số điện thoại:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.tenantPhone || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Nơi công tác / Học tập:</td>
                      <td>{viewContract.tenantWorkplace || '---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ fontStyle: 'italic', marginBottom: '14px' }}>
                Hai bên cùng thỏa thuận và thống nhất ký kết hợp đồng thuê phòng trọ với các điều khoản sau:
              </p>

              {/* ĐIỀU 1 */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  ĐIỀU 1: ĐỐI TƯỢNG VÀ MỤC ĐÍCH THUÊ
                </div>
                <div style={{ marginLeft: '12px' }}>
                  1.1. Bên A đồng ý cho Bên B thuê phòng trọ số: <strong>{viewContract.roomId?.roomNumber || viewContract.room?.roomNumber || '---'}</strong>, thuộc hệ thống nhà trọ Motel Management Systems.<br/>
                  1.2. Diện tích phòng: <strong>{viewContract.roomId?.area || viewContract.room?.area || 22} m²</strong>. Sức chứa tối đa: {viewContract.roomId?.maxOccupants || 2} người.<br/>
                  1.3. Trang thiết bị có sẵn trong phòng gồm: {viewContract.roomId?.amenities?.join(', ') || viewContract.room?.amenities?.join(', ') || 'Wifi, Điều hòa, Bình nóng lạnh'}.<br/>
                  1.4. Mục đích thuê: Dùng làm nơi ở sinh hoạt cá nhân, không sử dụng vào mục đích kinh doanh trái phép hoặc tàng trữ hàng cấm.
                </div>
              </div>

              {/* ĐIỀU 2 */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  ĐIỀU 2: THỜI HẠN THUÊ VÀ ĐIỀU KHOẢN TÀI CHÍNH
                </div>
                <div style={{ marginLeft: '12px' }}>
                  2.1. <strong>Thời hạn thuê:</strong> Hợp đồng có hiệu lực từ ngày <strong>{formatDate(viewContract.startDate)}</strong> đến hết ngày <strong>{formatDate(viewContract.endDate)}</strong>.<br/>
                  2.2. <strong>Giá thuê phòng:</strong> <strong>{Number(viewContract.rentalPrice || 0).toLocaleString('vi-VN')} VNĐ/tháng</strong> (Bằng chữ: {Number(viewContract.rentalPrice || 0).toLocaleString('vi-VN')} đồng trên một tháng). Giá thuê này cố định trong suốt thời hạn hợp đồng.<br/>
                  2.3. <strong>Tiền đặt cọc:</strong> Bên B đặt cọc trước cho Bên A số tiền là: <strong>{Number(viewContract.depositAmount || 0).toLocaleString('vi-VN')} VNĐ</strong> để bảo đảm thực hiện hợp đồng. Tiền cọc sẽ được hoàn trả đầy đủ cho Bên B khi thanh lý hợp đồng và bàn giao lại phòng theo đúng hiện trạng ban đầu.<br/>
                  2.4. <strong>Hình thức và thời gian thanh toán:</strong> Tiền thuê phòng được thanh toán định kỳ từ ngày 01 đến ngày 05 hàng tháng qua tiền mặt hoặc quét mã chuyển khoản trực tuyến.
                </div>
              </div>

              {/* ĐIỀU 3 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA HAI BÊN
                </div>
                <div style={{ marginLeft: '12px' }}>
                  3.1. <strong>Trách nhiệm của Bên A:</strong> Bàn giao phòng đúng hẹn, đảm bảo nguồn điện, nước và các điều kiện sinh hoạt ổn định cho Bên B.<br/>
                  3.2. <strong>Trách nhiệm của Bên B:</strong> Sử dụng phòng đúng mục đích, chấp hành nội quy khu trọ, giữ gìn an ninh trật tự, phòng chống cháy nổ và thanh toán các khoản chi phí đúng thời hạn.<br/>
                  3.3. Trường hợp một trong hai bên muốn chấm dứt hợp đồng trước thời hạn phải thông báo trước cho bên kia ít nhất 30 ngày.
                </div>
              </div>

              {/* CHỮ KÝ HAI BÊN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: '30px', pageBreakInside: 'avoid' }}>
                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>ĐẠI DIỆN BÊN CHO THUÊ</div>
                  <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '60px' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{viewContract.landlordName || 'Nguyễn Ngọc Quang'}</div>
                </div>

                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>ĐẠI DIỆN BÊN THUÊ PHÒNG</div>
                  <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '60px' }}>(Ký và ghi rõ họ tên)</div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{viewContract.tenantName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
