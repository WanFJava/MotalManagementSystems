import React, { useState, useEffect } from 'react';
import { userClientService } from '../services/userClientService';
import { roomClientService } from '../services/roomClientService';

/**
 * Màn hình Quản lý Khách thuê (UC06: Manage Tenant Info & Identity Profile)
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * SWR2.3, TC_USER_03
 */
export default function ManageTenantScreen({ onNotify }) {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
  const [residenceFilter, setResidenceFilter] = useState('');

  // Modal Sửa hồ sơ CCCD
  const [editingTenant, setEditingTenant] = useState(null);
  const [formProfile, setFormProfile] = useState({
    fullName: '',
    identityNumber: '',
    identityIssuedDate: '',
    identityIssuedPlace: 'Cục Cảnh sát QLHC về TTXH',
    dateOfBirth: '',
    gender: 'MALE',
    hometown: '',
    currentAddress: '',
    temporaryResidenceStatus: 'NOT_REGISTERED',
    currentRoom: '',
    identityCardFront: '',
    identityCardBack: ''
  });

  // Tải danh sách khách thuê
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await userClientService.getTenants({
        search,
        roomId: selectedRoomFilter,
        temporaryResidenceStatus: residenceFilter
      });
      setTenants(data);
    } catch (err) {
      onNotify('Lỗi khi tải danh sách khách thuê: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách phòng trọ để phân bổ
  const fetchRooms = async () => {
    try {
      const data = await roomClientService.getAllRooms();
      setRooms(data);
    } catch (err) {
      console.error('Lỗi tải danh sách phòng:', err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchRooms();
  }, [selectedRoomFilter, residenceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTenants();
  };

  // Mở modal cập nhật hồ sơ khách thuê
  const handleOpenEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormProfile({
      fullName: tenant.fullName || '',
      identityNumber: tenant.identityNumber || '',
      identityIssuedDate: tenant.identityIssuedDate ? tenant.identityIssuedDate.split('T')[0] : '',
      identityIssuedPlace: tenant.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
      dateOfBirth: tenant.dateOfBirth ? tenant.dateOfBirth.split('T')[0] : '',
      gender: tenant.gender || 'MALE',
      hometown: tenant.hometown || '',
      currentAddress: tenant.currentAddress || '',
      temporaryResidenceStatus: tenant.temporaryResidenceStatus || 'NOT_REGISTERED',
      currentRoom: tenant.currentRoom ? (tenant.currentRoom._id || tenant.currentRoom) : '',
      identityCardFront: tenant.identityCardFront || '',
      identityCardBack: tenant.identityCardBack || ''
    });
  };

  // Lưu hồ sơ CCCD (TC_USER_03)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      setLoading(true);
      const res = await userClientService.updateTenantProfile(editingTenant._id, {
        ...formProfile,
        address: formProfile.hometown?.trim() || '',
        hometown: formProfile.hometown?.trim() || '',
        currentAddress: formProfile.currentAddress?.trim() || ''
      });
      if (res.success) {
        onNotify('🎉 Đã cập nhật hồ sơ CCCD & đăng ký tạm trú thành công!', 'success');
        setEditingTenant(null);
        fetchTenants();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật thất bại!';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Đổi trạng thái khóa/mở khóa
  const handleToggleStatus = async (tenant) => {
    try {
      const newStatus = !tenant.isActive;
      const res = await userClientService.toggleUserStatus(tenant._id, newStatus);
      if (res.success) {
        onNotify(res.message, 'success');
        fetchTenants();
      }
    } catch (err) {
      onNotify(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & KPI */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e3a8a', margin: '0 0 6px 0' }}>
            👥 Quản Lý Hồ Sơ Khách Thuê (Tenant Profile)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Đặc tả <strong>UC06: Manage Tenant Information</strong> • Quản lý CCCD/Hộ chiếu, tạm trú & phòng cư trú
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            padding: '8px 16px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px'
          }}>
            Tổng số khách: {tenants.length}
          </div>
        </div>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '18px 20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo Họ tên, SĐT, Email hoặc CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Tất cả phòng</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>Phòng {r.roomNumber}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              value={residenceFilter}
              onChange={(e) => setResidenceFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Tất cả tình trạng tạm trú</option>
              <option value="REGISTERED">🟢 Đã đăng ký tạm trú</option>
              <option value="PENDING">🟡 Đang chờ duyệt</option>
              <option value="NOT_REGISTERED">🔴 Chưa đăng ký</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Bảng Danh Sách Khách Thuê */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        overflowX: 'auto'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Đang tải danh sách khách thuê...
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Không tìm thấy khách thuê nào phù hợp tiêu chí!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 16px' }}>Khách thuê</th>
                <th style={{ padding: '14px 16px' }}>Liên hệ</th>
                <th style={{ padding: '14px 16px' }}>Phòng ở</th>
                <th style={{ padding: '14px 16px' }}>Số CCCD / Hộ chiếu</th>
                <th style={{ padding: '14px 16px' }}>Quê quán</th>
                <th style={{ padding: '14px 16px' }}>Tạm trú</th>
                <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, idx) => (
                <tr
                  key={tenant._id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{tenant.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {tenant.gender === 'MALE' ? 'Nam' : tenant.gender === 'FEMALE' ? 'Nữ' : 'Khác'} • {tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa có NS'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0369a1', fontWeight: '600' }}>📞 {tenant.phone}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>✉️ {tenant.email}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {tenant.currentRoom ? (
                      <span style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}>
                        Phòng {tenant.currentRoom.roomNumber || 'Đã gán'}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                        Chưa nhận phòng
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {tenant.identityNumber ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                        🆔 {tenant.identityNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                        ⚠️ Chưa cập nhật
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', color: '#334155' }}>
                    {tenant.hometown || 'Chưa cập nhật'}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor:
                        tenant.temporaryResidenceStatus === 'REGISTERED' ? '#dcfce7' :
                        tenant.temporaryResidenceStatus === 'PENDING' ? '#fef3c7' : '#fee2e2',
                      color:
                        tenant.temporaryResidenceStatus === 'REGISTERED' ? '#166534' :
                        tenant.temporaryResidenceStatus === 'PENDING' ? '#92400e' : '#991b1b'
                    }}>
                      {tenant.temporaryResidenceStatus === 'REGISTERED' ? '🟢 Đã đăng ký' :
                       tenant.temporaryResidenceStatus === 'PENDING' ? '🟡 Chờ duyệt' : '🔴 Chưa đăng ký'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      color: tenant.isActive ? '#15803d' : '#b91c1c',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      {tenant.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenEdit(tenant)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Hồ sơ CCCD
                      </button>

                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        style={{
                          backgroundColor: tenant.isActive ? '#ef4444' : '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {tenant.isActive ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CẬP NHẬT HỒ SƠ CCCD & ĐỊNH DANH (TC_USER_03 / UC06) */}
      {editingTenant && (
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
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e3a8a' }}>
                🪪 Cập Nhật Hồ Sơ CCCD & Khách Thuê: {editingTenant.fullName}
              </h2>
              <button
                onClick={() => setEditingTenant(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Họ và tên khách thuê *
                </label>
                <input
                  type="text"
                  value={formProfile.fullName}
                  onChange={(e) => setFormProfile({ ...formProfile, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Số CCCD / Hộ chiếu (12 số) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 001202008899"
                    value={formProfile.identityNumber}
                    onChange={(e) => setFormProfile({ ...formProfile, identityNumber: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Ngày cấp CCCD
                  </label>
                  <input
                    type="date"
                    value={formProfile.identityIssuedDate}
                    onChange={(e) => setFormProfile({ ...formProfile, identityIssuedDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formProfile.dateOfBirth}
                    onChange={(e) => setFormProfile({ ...formProfile, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Giới tính
                  </label>
                  <select
                    value={formProfile.gender}
                    onChange={(e) => setFormProfile({ ...formProfile, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Quê quán (Tỉnh/Thành phố)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nam Định, Thái Bình..."
                    value={formProfile.hometown}
                    onChange={(e) => setFormProfile({ ...formProfile, hometown: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Nơi cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={formProfile.identityIssuedPlace}
                    onChange={(e) => setFormProfile({ ...formProfile, identityIssuedPlace: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Địa chỉ thường trú / lưu trú
                </label>
                <input
                  type="text"
                  placeholder="VD: Thôn 1, Xã Nghĩa Hưng, Huyện Nghĩa Hưng..."
                  value={formProfile.currentAddress}
                  onChange={(e) => setFormProfile({ ...formProfile, currentAddress: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Phân bổ phòng đang thuê
                  </label>
                  <select
                    value={formProfile.currentRoom}
                    onChange={(e) => setFormProfile({ ...formProfile, currentRoom: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Chưa gán phòng --</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>Phòng {r.roomNumber} ({r.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Trạng thái đăng ký tạm trú
                  </label>
                  <select
                    value={formProfile.temporaryResidenceStatus}
                    onChange={(e) => setFormProfile({ ...formProfile, temporaryResidenceStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="NOT_REGISTERED">🔴 Chưa đăng ký</option>
                    <option value="PENDING">🟡 Đang chờ duyệt</option>
                    <option value="REGISTERED">🟢 Đã đăng ký tạm trú</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Link ảnh CCCD mặt trước
                  </label>
                  <input
                    type="url"
                    placeholder="https://...cccd_front.jpg"
                    value={formProfile.identityCardFront}
                    onChange={(e) => setFormProfile({ ...formProfile, identityCardFront: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Link ảnh CCCD mặt sau
                  </label>
                  <input
                    type="url"
                    placeholder="https://...cccd_back.jpg"
                    value={formProfile.identityCardBack}
                    onChange={(e) => setFormProfile({ ...formProfile, identityCardBack: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Đang lưu...' : '💾 Lưu Hồ Sơ CCCD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
