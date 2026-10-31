import React, { useState, useEffect } from 'react';
import { contractClientService } from '../services/contractClientService';
import { roomClientService } from '../services/roomClientService';
import { userClientService } from '../services/userClientService';
import CccdDetailModal from '../components/CccdDetailModal';

export default function ManageContractsScreen({ currentUser, setCurrentUser, setCurrentScreen, onNotify, initialPrefill, onClearPrefill }) {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal xem chi tiết bản hợp đồng pháp lý
  const [viewContract, setViewContract] = useState(null);
  const [selectedCccdTenant, setSelectedCccdTenant] = useState(null);
  const [refreshingA, setRefreshingA] = useState(false);
  const [refreshingB, setRefreshingB] = useState(false);

  // Helper định dạng ngày sang YYYY-MM-DD cho input[type="date"]
  const formatDateForInput = (d) => {
    if (!d) return '';
    if (typeof d === 'string') {
      const trimmed = d.trim();
      const matchYMD = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYMD) {
        return `${matchYMD[1]}-${matchYMD[2].padStart(2, '0')}-${matchYMD[3].padStart(2, '0')}`;
      }
      const matchDMY = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDMY) {
        return `${matchDMY[3]}-${matchDMY[2].padStart(2, '0')}-${matchDMY[1].padStart(2, '0')}`;
      }
    }
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return '';
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Form Lập Hợp đồng mới
  const [showCreateForm, setShowCreateForm] = useState(!!initialPrefill);
  const [form, setForm] = useState({
    // Bên cho thuê (Bên A - Lấy đúng theo role đăng nhập: MANAGER / STAFF)
    landlordName: currentUser?.fullName || '',
    landlordDob: formatDateForInput(currentUser?.dateOfBirth),
    landlordCccd: currentUser?.identityNumber || '',
    landlordAddress: currentUser?.address || currentUser?.hometown || '',
    landlordCurrentAddress: currentUser?.currentAddress || '',
    landlordPhone: currentUser?.phone || '',

    // Bên thuê (Bên B - Lấy từ CCCD người thuê / Đơn yêu cầu thuê đã duyệt)
    tenantId: initialPrefill?.tenantId || '',
    tenantName: initialPrefill?.tenantName || '',
    tenantDob: formatDateForInput(initialPrefill?.tenantDob || initialPrefill?.dateOfBirth),
    tenantCccd: initialPrefill?.tenantCccd || initialPrefill?.tenantIdentityNumber || '',
    tenantAddress: initialPrefill?.tenantAddress || initialPrefill?.hometown || initialPrefill?.address || '',
    tenantCurrentAddress: initialPrefill?.tenantCurrentAddress || initialPrefill?.currentAddress || '',
    tenantPhone: initialPrefill?.tenantPhone || initialPrefill?.phone || '',
    tenantGender: initialPrefill?.tenantGender || initialPrefill?.gender || 'MALE',
    tenantIdentityIssuedDate: formatDateForInput(initialPrefill?.tenantIdentityIssuedDate || initialPrefill?.identityIssuedDate),
    tenantIdentityIssuedPlace: initialPrefill?.tenantIdentityIssuedPlace || initialPrefill?.identityIssuedPlace || '',

    // Thông tin hợp đồng & tài chính
    signedDate: new Date().toISOString().split('T')[0],
    roomId: initialPrefill?.roomId || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    depositAmount: '',
    rentalPrice: initialPrefill?.rentalPrice || ''
  });
  const [submitting, setSubmitting] = useState(false);

  // State Modal chỉnh sửa nhanh Hồ sơ Bên A ngay trong màn hình Hợp đồng
  const [showEditLandlordModal, setShowEditLandlordModal] = useState(false);
  const [landlordEditForm, setLandlordEditForm] = useState({
    fullName: '',
    phone: '',
    identityNumber: '',
    dateOfBirth: '',
    address: '',
    currentAddress: '',
    identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
    identityIssuedDate: '',
    gender: 'MALE'
  });
  const [savingLandlordProfile, setSavingLandlordProfile] = useState(false);

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
  }, []);

  // Tự động đồng bộ thông tin Bên A khi currentUser được tải hoặc thay đổi
  useEffect(() => {
    if (currentUser) {
      const targetUserId = currentUser._id || currentUser.id;
      setForm((prev) => ({
        ...prev,
        landlordName: prev.landlordName || currentUser.fullName || '',
        landlordDob: prev.landlordDob || formatDateForInput(currentUser.dateOfBirth),
        landlordCccd: prev.landlordCccd || currentUser.identityNumber || '',
        landlordAddress: prev.landlordAddress || currentUser.address || currentUser.hometown || '',
        landlordCurrentAddress: prev.landlordCurrentAddress || currentUser.currentAddress || '',
        landlordPhone: prev.landlordPhone || currentUser.phone || ''
      }));

      // Luôn đồng bộ dữ liệu mới nhất từ CSDL cho Bên A để tránh dữ liệu cũ trong localStorage
      if (targetUserId) {
        userClientService.getProfile(targetUserId).then((freshProfile) => {
          if (freshProfile) {
            setForm((prev) => ({
              ...prev,
              landlordName: freshProfile.fullName || prev.landlordName,
              landlordDob: formatDateForInput(freshProfile.dateOfBirth) || prev.landlordDob,
              landlordCccd: freshProfile.identityNumber || prev.landlordCccd,
              landlordAddress: freshProfile.address || freshProfile.hometown || prev.landlordAddress,
              landlordCurrentAddress: freshProfile.currentAddress || prev.landlordCurrentAddress,
              landlordPhone: freshProfile.phone || prev.landlordPhone
            }));
          }
        }).catch((e) => console.error('Lỗi sync Bên A:', e));
      }
    }
  }, [currentUser]);

  // Tự động điền thông tin Bên B khi nhận initialPrefill từ Yêu cầu thuê
  useEffect(() => {
    if (initialPrefill) {
      setShowCreateForm(true);
      const tenantUser = initialPrefill.tenantId ? tenants.find(t => String(t._id) === String(initialPrefill.tenantId)) : null;

      const dob = initialPrefill.tenantDob || initialPrefill.dateOfBirth || tenantUser?.dateOfBirth;
      const address = initialPrefill.tenantAddress || initialPrefill.hometown || initialPrefill.address || tenantUser?.address || tenantUser?.hometown || '';
      const currentAddress = initialPrefill.tenantCurrentAddress || initialPrefill.currentAddress || tenantUser?.currentAddress || address;
      const cccd = initialPrefill.tenantCccd || initialPrefill.tenantIdentityNumber || tenantUser?.identityNumber || '';

      setForm((prev) => ({
        ...prev,
        roomId: initialPrefill.roomId || prev.roomId,
        tenantId: initialPrefill.tenantId || prev.tenantId || '',
        tenantName: initialPrefill.tenantName || tenantUser?.fullName || prev.tenantName,
        tenantPhone: initialPrefill.tenantPhone || initialPrefill.phone || tenantUser?.phone || prev.tenantPhone,
        tenantCccd: cccd || prev.tenantCccd,
        tenantDob: formatDateForInput(dob) || prev.tenantDob,
        tenantAddress: address || prev.tenantAddress,
        tenantCurrentAddress: currentAddress || prev.tenantCurrentAddress,
        tenantGender: initialPrefill.tenantGender || initialPrefill.gender || tenantUser?.gender || prev.tenantGender,
        tenantIdentityIssuedDate: formatDateForInput(initialPrefill.tenantIdentityIssuedDate || initialPrefill.identityIssuedDate || tenantUser?.identityIssuedDate) || prev.tenantIdentityIssuedDate,
        tenantIdentityIssuedPlace: initialPrefill.tenantIdentityIssuedPlace || initialPrefill.identityIssuedPlace || tenantUser?.identityIssuedPlace || prev.tenantIdentityIssuedPlace,
        rentalPrice: initialPrefill.rentalPrice || prev.rentalPrice
      }));
    }
  }, [initialPrefill, tenants]);

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

  // Làm mới thông tin CCCD Bên A từ CSDL
  const handleRefreshLandlordCccd = async () => {
    const targetUserId = currentUser?._id || currentUser?.id;
    if (!targetUserId) {
      if (onNotify) onNotify('Không tìm thấy thông tin tài khoản đang đăng nhập của Bên A!', 'error');
      return;
    }
    try {
      setRefreshingA(true);
      const freshProfile = await userClientService.getProfile(targetUserId);
      if (freshProfile) {
        setForm((prev) => ({
          ...prev,
          landlordName: freshProfile.fullName || '',
          landlordDob: formatDateForInput(freshProfile.dateOfBirth),
          landlordCccd: freshProfile.identityNumber || '',
          landlordAddress: freshProfile.address || freshProfile.hometown || '',
          landlordCurrentAddress: freshProfile.currentAddress || '',
          landlordPhone: freshProfile.phone || ''
        }));
        if (setCurrentUser) {
          setCurrentUser(freshProfile);
        }
        localStorage.setItem('motel_user', JSON.stringify(freshProfile));
        if (onNotify) onNotify('🔄 Đã làm mới và lấy thông tin CCCD Bên A mới nhất từ CSDL!', 'success');
      }
    } catch (err) {
      console.error('Lỗi refresh Bên A:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải lại thông tin Bên A!';
      if (onNotify) onNotify(`Không thể tải lại thông tin Bên A: ${msg}`, 'error');
    } finally {
      setRefreshingA(false);
    }
  };

  // Mở modal cập nhật nhanh hồ sơ CCCD Bên A
  const handleOpenEditLandlordModal = () => {
    setLandlordEditForm({
      fullName: currentUser?.fullName || form.landlordName || '',
      phone: currentUser?.phone || form.landlordPhone || '',
      identityNumber: currentUser?.identityNumber || form.landlordCccd || '',
      dateOfBirth: formatDateForInput(currentUser?.dateOfBirth || form.landlordDob),
      address: currentUser?.address || currentUser?.hometown || form.landlordAddress || '',
      currentAddress: currentUser?.currentAddress || form.landlordCurrentAddress || '',
      identityIssuedPlace: currentUser?.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
      identityIssuedDate: formatDateForInput(currentUser?.identityIssuedDate),
      gender: currentUser?.gender || 'MALE'
    });
    setShowEditLandlordModal(true);
  };

  // Lưu hồ sơ CCCD Bên A trực tiếp từ modal
  const handleSaveLandlordProfile = async (e) => {
    if (e) e.preventDefault();
    const targetUserId = currentUser?._id || currentUser?.id;
    if (!targetUserId) {
      if (onNotify) onNotify('Không tìm thấy tài khoản người dùng đăng nhập!', 'error');
      return;
    }
    if (landlordEditForm.identityNumber && landlordEditForm.identityNumber.trim().length !== 12) {
      if (onNotify) onNotify('Số CCCD phải có đúng 12 chữ số!', 'error');
      return;
    }
    try {
      setSavingLandlordProfile(true);
      const res = await userClientService.updateProfile(targetUserId, {
        ...landlordEditForm,
        address: landlordEditForm.address.trim(),
        hometown: landlordEditForm.address.trim(),
        currentAddress: landlordEditForm.currentAddress.trim(),
        dateOfBirth: landlordEditForm.dateOfBirth || null,
        identityIssuedDate: landlordEditForm.identityIssuedDate || null,
        identityNumber: landlordEditForm.identityNumber.trim()
      });

      if (res.success && res.data) {
        const updated = res.data;
        if (setCurrentUser) setCurrentUser(updated);
        localStorage.setItem('motel_user', JSON.stringify(updated));

        // Tự động nạp dữ liệu mới vào form hợp đồng đang soạn
        setForm((prev) => ({
          ...prev,
          landlordName: updated.fullName || prev.landlordName,
          landlordDob: formatDateForInput(updated.dateOfBirth) || prev.landlordDob,
          landlordCccd: updated.identityNumber || prev.landlordCccd,
          landlordAddress: updated.address || updated.hometown || prev.landlordAddress,
          landlordCurrentAddress: updated.currentAddress || prev.landlordCurrentAddress,
          landlordPhone: updated.phone || prev.landlordPhone
        }));

        setShowEditLandlordModal(false);
        if (onNotify) onNotify('🎉 Đã cập nhật hồ sơ CCCD Bên A thành công và áp dụng ngay vào hợp đồng!', 'success');
      }
    } catch (err) {
      console.error('Lỗi lưu hồ sơ Bên A:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật hồ sơ Bên A!';
      if (onNotify) onNotify(`Không thể cập nhật hồ sơ Bên A: ${msg}`, 'error');
    } finally {
      setSavingLandlordProfile(false);
    }
  };

  // Làm mới thông tin CCCD Bên B từ CSDL
  const handleRefreshTenantCccd = async () => {
    if (!form.tenantId) {
      if (onNotify) onNotify('Vui lòng chọn khách thuê trước khi làm mới thông tin CCCD!', 'info');
      return;
    }
    try {
      setRefreshingB(true);
      await fetchTenants();
      const freshTenant = await userClientService.getProfile(form.tenantId);
      if (freshTenant) {
        setForm((prev) => ({
          ...prev,
          tenantName: freshTenant.fullName || '',
          tenantPhone: freshTenant.phone || '',
          tenantCccd: freshTenant.identityNumber || '',
          tenantDob: formatDateForInput(freshTenant.dateOfBirth),
          tenantAddress: freshTenant.address || freshTenant.hometown || '',
          tenantCurrentAddress: freshTenant.currentAddress || '',
          tenantGender: freshTenant.gender || 'MALE',
          tenantIdentityIssuedDate: formatDateForInput(freshTenant.identityIssuedDate),
          tenantIdentityIssuedPlace: freshTenant.identityIssuedPlace || ''
        }));
        if (onNotify) onNotify(`🔄 Đã làm mới thông tin CCCD của "${freshTenant.fullName}" mới nhất từ CSDL!`, 'success');
      }
    } catch (err) {
      console.error('Lỗi refresh Bên B:', err);
      if (onNotify) onNotify('Không thể tải lại thông tin khách thuê!', 'error');
    } finally {
      setRefreshingB(false);
    }
  };

  // Làm mới toàn bộ thông tin CCCD 2 bên
  const handleRefreshAllCccd = async () => {
    await handleRefreshLandlordCccd();
    if (form.tenantId) {
      await handleRefreshTenantCccd();
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
      setForm((prev) => ({
        ...prev,
        tenantId: '',
        tenantName: '',
        tenantPhone: '',
        tenantCccd: '',
        tenantDob: '',
        tenantAddress: '',
        tenantCurrentAddress: '',
        tenantGender: 'MALE',
        tenantIdentityIssuedDate: '',
        tenantIdentityIssuedPlace: ''
      }));
      return;
    }
    const t = tenants.find((item) => String(item._id) === String(tenantId));
    if (!t) return;

    setForm((prev) => ({
      ...prev,
      tenantId: t._id,
      tenantName: t.fullName || '',
      tenantPhone: t.phone || '',
      tenantCccd: t.identityNumber || '',
      tenantDob: formatDateForInput(t.dateOfBirth),
      tenantAddress: t.address || t.hometown || t.currentAddress || '',
      tenantCurrentAddress: t.currentAddress || t.address || t.hometown || '',
      tenantGender: t.gender || 'MALE',
      tenantIdentityIssuedDate: formatDateForInput(t.identityIssuedDate),
      tenantIdentityIssuedPlace: t.identityIssuedPlace || ''
    }));
  };

  // Kiểm tra danh sách các trường còn thiếu của Bên A và Bên B
  const missingA = [];
  if (!form.landlordName?.trim()) missingA.push('Họ và tên');
  if (!form.landlordPhone?.trim()) missingA.push('Số điện thoại');
  if (!form.landlordCccd?.trim()) missingA.push('Số CCCD');
  if (!form.landlordDob) missingA.push('Ngày sinh theo CCCD');
  if (!form.landlordAddress?.trim()) missingA.push('Quê quán / Địa chỉ thường trú (CCCD)');
  if (!form.landlordCurrentAddress?.trim()) missingA.push('Nơi ở hiện tại / Địa chỉ liên hệ');

  const missingB = [];
  if (!form.tenantName?.trim()) missingB.push('Họ và tên');
  if (!form.tenantPhone?.trim()) missingB.push('Số điện thoại');
  if (!form.tenantCccd?.trim()) missingB.push('Số CCCD');
  if (!form.tenantDob) missingB.push('Ngày sinh theo CCCD');
  if (!form.tenantAddress?.trim()) missingB.push('Quê quán / Địa chỉ thường trú (CCCD)');
  if (!form.tenantCurrentAddress?.trim()) missingB.push('Nơi ở hiện tại / Địa chỉ liên hệ');

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
      if (onNotify) onNotify('Lập form hợp đồng thành công! Hợp đồng đang ở trạng thái [CHỜ KHÁCH B KÝ ONLINE]. Khi khách ký tên xác nhận, hợp đồng sẽ chính thức có hiệu lực và kích hoạt phòng.', 'success');
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
              {st === 'ALL' ? 'Tất cả' : st === 'WAITING_TENANT_SIGNATURE' ? 'Chờ khách ký' : st === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã thanh lý'}
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
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '19px' }}>
                📝 Lập Hợp Đồng Thuê Phòng Mới (UC05)
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Trích xuất thông tin định danh CCCD chính xác của Bên A (Chủ nhà) và Bên B (Khách thuê) để sinh văn bản hợp đồng pháp lý.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshAllCccd}
              disabled={refreshingA || refreshingB}
              style={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
              title="Lấy dữ liệu CCCD mới nhất từ CSDL cho cả Bên A và Bên B"
            >
              {(refreshingA || refreshingB) ? '⏳ Đang làm mới...' : '🔄 Làm mới thông tin CCCD cả 2 bên'}
            </button>
          </div>

          <form onSubmit={handleSubmitContract}>
            {/* PHẦN 1: BÊN CHO THUÊ (BÊN A) - CHỈ LẤY THÔNG TIN CCCD TỪ PROFILE, CHỈ ĐỌC & CÓ NÚT LÀM MỚI */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', color: '#1e3a8a', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏢</span> I. THÔNG TIN BÊN CHO THUÊ (BÊN A - {currentUser?.role === 'MANAGER' ? 'CHỦ TRỌ' : 'QUẢN LÝ / NHÂN VIÊN'})
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    🔒 Trích xuất tự động từ tài khoản CCCD: <strong>{currentUser?.fullName || 'Chưa đăng nhập'}</strong> (Chỉ đọc)
                  </span>
                </div>

                {/* Các nút thao tác cho Bên A: Làm mới & Cập nhật Profile */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleRefreshLandlordCccd}
                    disabled={refreshingA}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#1e3a8a',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Tải lại thông tin CCCD Bên A mới nhất từ CSDL"
                  >
                    {refreshingA ? '⏳ Đang tải...' : '🔄 Làm mới CCCD Bên A'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEditLandlordModal}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Mở popup chỉnh sửa nhanh thông tin CCCD Bên A và tự nạp vào hợp đồng"
                  >
                    ✏️ Cập nhật Profile Bên A
                  </button>
                </div>
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
                      ⚠️ Hồ sơ Bên cho thuê (Bên A - Bạn) chưa đủ điều kiện thông tin định danh CCCD để lập hợp đồng:
                    </strong>
                    <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>
                      Còn thiếu: <strong>{missingA.join(', ')}</strong>.<br />
                      <strong>📌 Quy định:</strong> Thông tin Bên A chỉ được trích xuất từ hồ sơ CCCD của bạn, không được chỉnh sửa trực tiếp tại form hợp đồng (để đảm bảo tính pháp lý).<br />
                      👉 Vui lòng bấm <em>"Cập nhật Profile"</em> để bổ sung CCCD, sau đó bấm <em>"Làm mới CCCD"</em> để hệ thống tự động cập nhật vào hợp đồng.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleRefreshLandlordCccd}
                      disabled={refreshingA}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#991b1b',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {refreshingA ? '⏳ Đang tải...' : '🔄 Làm mới CCCD'}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenEditLandlordModal}
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
                      title="Mở popup bổ sung thông tin CCCD Bên A ngay tại đây"
                    >
                      ✏️ Cập nhật Profile Bên A
                    </button>
                  </div>
                </div>
              )}

              {/* Các trường thông tin CCCD Bên A: ĐẶT CHẾ ĐỘ READONLY (Chỉ đọc) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Họ và tên bên cho thuê: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa có họ tên"
                    value={form.landlordName}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Trích xuất từ hồ sơ tài khoản (Chỉ đọc)</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Ngày sinh (theo CCCD): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="date"
                    readOnly
                    value={form.landlordDob}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Trích xuất từ CCCD (Chỉ đọc)</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Số CCCD / CMND (12 số): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    maxLength={12}
                    placeholder="Chưa có CCCD"
                    value={form.landlordCccd}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed', fontWeight: 'bold', letterSpacing: '1px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Mã định danh cá nhân</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Số điện thoại liên hệ: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (Hồ sơ)</span>
                  </label>
                  <input
                    type="tel"
                    readOnly
                    placeholder="Chưa có SĐT"
                    value={form.landlordPhone}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Số điện thoại tài khoản</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Quê quán / Địa chỉ thường trú (ghi trên CCCD): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa cập nhật thường trú theo CCCD"
                    value={form.landlordAddress}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Hộ khẩu thường trú trên CCCD</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Nơi ở hiện tại / Địa chỉ liên hệ: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (Hồ sơ)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa cập nhật nơi ở hiện tại"
                    value={form.landlordCurrentAddress}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Chỗ ở hiện tại / địa chỉ liên hệ thực tế</span>
                </div>
              </div>
            </div>

            {/* PHẦN 2: BÊN THUÊ (BÊN B) - CHỈ LẤY THÔNG TIN CCCD RA, KHÔNG CHO PHÉP SỬA TRỰC TIẾP TẠI HỢP ĐỒNG */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span> II. THÔNG TIN BÊN THUÊ (BÊN B - KHÁCH TRỌ)
                </h4>
                <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                  🔒 Chỉ trích xuất thông tin CCCD từ hồ sơ khách thuê (Chỉ đọc)
                </span>
              </div>

              {/* Chọn khách thuê từ danh sách hệ thống */}
              <div style={{ marginBottom: '14px', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #86efac' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#166534' }}>
                  🔍 Chọn khách thuê có tài khoản / hồ sơ CCCD trong hệ thống:
                </label>
                <select
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  value={form.tenantId || ''}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Chọn khách thuê để hệ thống tự trích xuất thông tin CCCD --</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} - SĐT: {t.phone} {t.identityNumber ? `| CCCD: ${t.identityNumber}` : '| (Chưa cập nhật CCCD)'}
                    </option>
                  ))}
                </select>

                {form.tenantId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '8px 12px', backgroundColor: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#065f46' }}>
                      ✓ Đã trích xuất thông tin định danh từ hồ sơ của: <strong>{form.tenantName || 'Khách thuê'}</strong>.
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleRefreshTenantCccd}
                        disabled={refreshingB}
                        style={{
                          padding: '4px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          color: '#166534',
                          border: '1px solid #86efac',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '600'
                        }}
                        title="Tải lại thông tin CCCD khách thuê mới nhất từ CSDL"
                      >
                        {refreshingB ? '⏳ Đang tải...' : '🔄 Làm mới CCCD khách'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const t = tenants.find((item) => String(item._id) === String(form.tenantId));
                          if (t) setSelectedCccdTenant(t);
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '600'
                        }}
                      >
                        👁️ Xem bản gốc CCCD khách thuê
                      </button>
                    </div>
                  </div>
                )}
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
                    ⚠️ Khách thuê chưa đủ điều kiện thông tin định danh CCCD để lập hợp đồng:
                  </strong>
                  <div style={{ color: '#b45309', fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>
                    Hồ sơ còn thiếu: <strong>{missingB.join(', ')}</strong>.<br />
                    <strong>📌 Quy định:</strong> Thông tin định danh chỉ được trích xuất từ hồ sơ CCCD của khách thuê, không được chỉnh sửa tại form hợp đồng (để tránh sai lệch pháp lý và không sửa lây sang Profile).<br />
                    👉 Vui lòng yêu cầu khách thuê cập nhật tại <em>"Hồ sơ của tôi" (ProfileScreen)</em> hoặc Chủ trọ cập nhật tại <em>"Quản lý khách thuê"</em> trước khi lập hợp đồng.
                  </div>
                </div>
              )}

              {/* Các trường thông tin CCCD của Bên B: CHỈ ĐỌC (ReadOnly) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Họ và tên khách thuê: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa có dữ liệu"
                    value={form.tenantName}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Trích xuất từ CCCD / Hồ sơ</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Ngày sinh (theo CCCD): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="date"
                    readOnly
                    value={form.tenantDob}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Trích xuất từ CCCD</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Số CCCD / CMND (12 số): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    maxLength={12}
                    placeholder="Chưa có CCCD"
                    value={form.tenantCccd}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed', fontWeight: 'bold', letterSpacing: '1px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Mã định danh cá nhân</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Số điện thoại liên hệ: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (Hồ sơ)</span>
                  </label>
                  <input
                    type="tel"
                    readOnly
                    placeholder="Chưa có SĐT"
                    value={form.tenantPhone}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Trích xuất từ hồ sơ tài khoản</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Quê quán / Địa chỉ thường trú (ghi trên CCCD): <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (CCCD)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa cập nhật thường trú theo CCCD"
                    value={form.tenantAddress}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Nơi ĐK hộ khẩu thường trú ghi trên CCCD</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    Nơi ở hiện tại / Địa chỉ liên hệ: <span style={{ color: '#0369a1', fontSize: '11px' }}>🔒 (Hồ sơ)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Chưa cập nhật nơi ở hiện tại"
                    value={form.tenantCurrentAddress}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Chỗ ở hiện tại / địa chỉ liên hệ thực tế</span>
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
                const isWaiting = c.status === 'WAITING_TENANT_SIGNATURE' || c.status === 'PENDING_SIGNATURE';

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
                        backgroundColor: isWaiting ? '#fef3c7' : isActive ? '#dcfce7' : '#fee2e2',
                        color: isWaiting ? '#b45309' : isActive ? '#166534' : '#991b1b',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: isWaiting ? '1px solid #fde68a' : 'none'
                      }}>
                        {isWaiting ? 'CHỜ KHÁCH B KÝ' : isActive ? 'ĐANG HIỆU LỰC' : c.status}
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

            {/* Banner trạng thái chờ ký nếu chưa kích hoạt */}
            {(viewContract.status === 'WAITING_TENANT_SIGNATURE' || viewContract.status === 'PENDING_SIGNATURE') && (
              <div style={{
                backgroundColor: '#fffbeb',
                borderBottom: '1px solid #fde68a',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '22px' }}>⏳</span>
                <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.4' }}>
                  <strong>Hợp đồng đang chờ Bên B ký tên online:</strong> Chủ trọ đã lập xong form hợp đồng. Khách thuê cần đăng nhập tài khoản vào mục <em>"Hợp đồng của tôi"</em> để kiểm tra thông tin CCCD, các điều khoản và ký online thì hợp đồng mới chính thức có hiệu lực!
                </div>
              </div>
            )}

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
                      <td style={{ padding: '3px 0' }}>• Ngày tháng năm sinh (theo CCCD):</td>
                      <td>{formatDate(viewContract.landlordDob)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• CMND / CCCD số:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.landlordCccd || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Quê quán / Địa chỉ thường trú (ghi trên CCCD):</td>
                      <td>{viewContract.landlordAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Nơi ở hiện tại / Địa chỉ liên hệ:</td>
                      <td>{viewContract.landlordCurrentAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Số điện thoại liên hệ:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.landlordPhone || '---'}</td>
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
                      <td style={{ padding: '3px 0' }}>• Ngày tháng năm sinh (theo CCCD):</td>
                      <td>{formatDate(viewContract.tenantDob)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• CMND / CCCD số:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.tenantCccd || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Quê quán / Địa chỉ thường trú (ghi trên CCCD):</td>
                      <td>{viewContract.tenantAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Nơi ở hiện tại / Địa chỉ liên hệ:</td>
                      <td>{viewContract.tenantCurrentAddress || '---'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0' }}>• Số điện thoại:</td>
                      <td style={{ fontWeight: 'bold' }}>{viewContract.tenantPhone || '---'}</td>
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
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</div>
                  <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '8px' }}>(Đã ký & xác nhận)</div>
                  <div style={{
                    fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                    fontSize: '26px',
                    color: '#1e3a8a',
                    minHeight: '34px',
                    marginBottom: '4px'
                  }}>
                    {viewContract.landlordSignature || viewContract.landlordName || 'Nguyễn Ngọc Quang'}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{viewContract.landlordName || 'Nguyễn Ngọc Quang'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                    Ngày ký: {viewContract.landlordSignedAt ? new Date(viewContract.landlordSignedAt).toLocaleDateString('vi-VN') : formatDate(viewContract.signedDate || viewContract.createdAt)}
                  </div>
                </div>

                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>ĐẠI DIỆN BÊN THUÊ PHÒNG (BÊN B)</div>
                  <div style={{ fontStyle: 'italic', fontSize: '13px', marginBottom: '8px' }}>(Ký và xác nhận online)</div>
                  {viewContract.tenantSignature ? (
                    <>
                      <div style={{
                        fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                        fontSize: '26px',
                        color: '#166534',
                        minHeight: '34px',
                        marginBottom: '4px'
                      }}>
                        {viewContract.tenantSignature}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{viewContract.tenantName}</div>
                      <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>
                        ✓ Đã ký online lúc: {new Date(viewContract.tenantSignedAt).toLocaleString('vi-VN')}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      backgroundColor: '#fffbeb',
                      border: '1px dashed #f59e0b',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#b45309',
                      fontSize: '12.5px',
                      marginTop: '6px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⏳ CHƯA KÝ TÊN ONLINE</div>
                      <div style={{ fontSize: '11px' }}>Chờ khách thuê đăng nhập để xác nhận & ký tên</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal xem chi tiết CCCD của khách thuê */}
      {selectedCccdTenant && (
        <CccdDetailModal
          target={selectedCccdTenant}
          onClose={() => setSelectedCccdTenant(null)}
        />
      )}

      {/* Modal Cập nhật nhanh CCCD & Profile Bên A (Chủ trọ / Quản lý) */}
      {showEditLandlordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✏️</span> Cập Nhật Hồ Sơ Bên Cho Thuê (Bên A)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Thông tin CCCD sẽ được lưu vào tài khoản của bạn và tự động nạp vào hợp đồng đang soạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditLandlordModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLandlordProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={landlordEditForm.fullName}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={landlordEditForm.phone}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Số CCCD (12 chữ số) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="VD: 001202001234"
                    value={landlordEditForm.identityNumber}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, identityNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Ngày sinh (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={landlordEditForm.dateOfBirth}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Giới tính
                  </label>
                  <select
                    value={landlordEditForm.gender}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    Nơi cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={landlordEditForm.identityIssuedPlace}
                    onChange={(e) => setLandlordEditForm({ ...landlordEditForm, identityIssuedPlace: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  Quê quán / Địa chỉ thường trú (ghi trên CCCD) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Xã Hải Minh, Huyện Hải Hậu, Tỉnh Nam Định"
                  value={landlordEditForm.address}
                  onChange={(e) => setLandlordEditForm({ ...landlordEditForm, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  Nơi ở hiện tại / Địa chỉ liên hệ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Số 123 Đường Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội"
                  value={landlordEditForm.currentAddress}
                  onChange={(e) => setLandlordEditForm({ ...landlordEditForm, currentAddress: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  {setCurrentScreen && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditLandlordModal(false);
                        setCurrentScreen('profile');
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Mở trang Hồ sơ chi tiết (UC01) ↗
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditLandlordModal(false)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={savingLandlordProfile}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {savingLandlordProfile ? '⏳ Đang lưu...' : '💾 Lưu & Áp Dụng Vào Hợp Đồng'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
