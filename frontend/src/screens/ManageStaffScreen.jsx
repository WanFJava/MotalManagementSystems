import React, { useState, useEffect } from 'react';
import { userClientService } from '../services/userClientService';

/**
 * Màn hình Quản trị Nhân viên (UC15: Manage Staff)
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * SWR2.4, TC_USER_04
 */
export default function ManageStaffScreen({ onNotify, currentUser }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Thêm nhân viên mới
  const [addForm, setAddForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'STAFF'
  });

  // Tải danh sách nhân viên
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await userClientService.getStaff({
        search,
        role: roleFilter
      });
      setStaffList(data);
    } catch (err) {
      onNotify('Lỗi tải danh sách nhân viên: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaff();
  };

  // Thêm nhân viên mới
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await userClientService.createStaff(addForm);
      if (res.success) {
        onNotify('🎉 Đã thêm tài khoản nhân viên mới thành công!', 'success');
        setShowAddModal(false);
        setAddForm({
          fullName: '',
          phone: '',
          email: '',
          password: '',
          role: 'STAFF'
        });
        fetchStaff();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Thêm nhân viên thất bại!';
      onNotify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Khóa / Mở khóa tài khoản nhân viên (TC_USER_04)
  const handleToggleStatus = async (staff) => {
    // Không cho phép tự khóa tài khoản của chính mình
    if (currentUser && currentUser._id === staff._id) {
      onNotify('Bạn không thể tự khóa tài khoản của chính mình!', 'error');
      return;
    }

    try {
      const newStatus = !staff.isActive;
      const res = await userClientService.toggleUserStatus(staff._id, newStatus);
      if (res.success) {
        onNotify(res.message, 'success');
        fetchStaff();
      }
    } catch (err) {
      onNotify(err.response?.data?.message || err.message, 'error');
    }
  };

  // Xóa nhân viên
  const handleDeleteStaff = async (staff) => {
    if (currentUser && currentUser._id === staff._id) {
      onNotify('Bạn không thể xóa tài khoản của chính mình!', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${staff.fullName}" không?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await userClientService.deleteUser(staff._id);
      if (res.success) {
        onNotify('Đã xóa nhân viên thành công!', 'success');
        fetchStaff();
      }
    } catch (err) {
      onNotify(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Tiêu đề & Nút thêm nhân viên */}
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
            🛡️ Quản Lý Đội Ngũ Nhân Viên (Staff Management)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Đặc tả <strong>UC15: Manage Staff</strong> • Thêm nhân viên, phân quyền và khóa/mở khóa tài khoản (TC_USER_04)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
            padding: '11px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
          }}
        >
          ➕ Thêm Nhân Viên Mới
        </button>
      </div>

      {/* Tìm kiếm & Lọc vai trò */}
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
              placeholder="🔍 Tìm nhân viên theo Họ tên, SĐT hoặc Email..."
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

          <div style={{ flex: '0 1 200px' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="STAFF">🛡️ Nhân viên (Staff)</option>
              <option value="MANAGER">👑 Quản lý (Manager)</option>
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

      {/* Bảng Danh sách nhân viên */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        overflowX: 'auto'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Đang tải dữ liệu nhân viên...
          </div>
        ) : staffList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Không tìm thấy nhân viên nào!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 16px' }}>Nhân viên</th>
                <th style={{ padding: '14px 16px' }}>Thông tin liên hệ</th>
                <th style={{ padding: '14px 16px' }}>Vai trò</th>
                <th style={{ padding: '14px 16px' }}>Tình trạng tài khoản</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, idx) => (
                <tr
                  key={staff._id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{staff.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Tham gia: {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0369a1', fontWeight: '600' }}>📞 {staff.phone}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>✉️ {staff.email}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      backgroundColor: staff.role === 'MANAGER' ? '#fee2e2' : '#fef3c7',
                      color: staff.role === 'MANAGER' ? '#991b1b' : '#92400e',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {staff.role === 'MANAGER' ? '👑 Quản lý (Manager)' : '🛡️ Nhân viên (Staff)'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: staff.isActive ? '#dcfce7' : '#fee2e2',
                      color: staff.isActive ? '#166534' : '#991b1b',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {staff.isActive ? '🟢 Đang hoạt động' : '🔴 Đã bị khóa'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* Nút Khóa / Mở khóa tài khoản nhân viên (TC_USER_04) */}
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        style={{
                          backgroundColor: staff.isActive ? '#f59e0b' : '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {staff.isActive ? '🔒 Khóa tài khoản' : '🔓 Mở khóa'}
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL THÊM NHÂN VIÊN MỚI */}
      {showAddModal && (
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
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e3a8a' }}>
                ➕ Thêm Nhân Viên Quản Lý Mới
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Họ và tên nhân viên *
                </label>
                <input
                  type="text"
                  placeholder="VD: Lê Văn An"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0902345678"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Email làm việc *
                </label>
                <input
                  type="email"
                  placeholder="VD: staff@motel.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Mật khẩu ban đầu *
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Vai trò phân quyền:
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="STAFF">🛡️ Nhân viên vận hành (Staff)</option>
                  <option value="MANAGER">👑 Quản lý / Chủ trọ (Manager)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  {loading ? 'Đang tạo...' : '➕ Xác Nhận Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
