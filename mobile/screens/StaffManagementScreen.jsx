import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { userApi } from '../services/api';

export default function StaffManagementScreen({ navigation }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal tạo nhân viên mới
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await userApi.getStaff();
      if (res.data && res.data.success) {
        setStaffList(res.data.data || []);
      }
    } catch (err) {
      console.log('Lỗi tải danh sách nhân viên:', err.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    setCreateError('');
    if (!newFullName.trim() || !newPhone.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Vui lòng điền đủ họ tên, SĐT, email và mật khẩu ban đầu!');
      return;
    }

    if (newPassword.length < 6) {
      setCreateError('Mật khẩu tối thiểu phải từ 6 ký tự!');
      return;
    }

    try {
      setCreating(true);
      const res = await userApi.createStaff({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole
      });

      if (res.data && res.data.success) {
        Alert.alert('Thành công 🎉', `Đã tạo tài khoản nhân viên ${newFullName} thành công!`);
        setCreateModalVisible(false);
        setNewFullName('');
        setNewPhone('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('STAFF');
        fetchStaff();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Tạo nhân viên mới thất bại!';
      setCreateError(errMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = (staff) => {
    const action = staff.isActive ? 'khóa' : 'mở khóa';
    Alert.alert(
      `Xác nhận ${action} tài khoản`,
      `Bạn có chắc chắn muốn ${action} tài khoản của nhân viên "${staff.fullName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: staff.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await userApi.toggleStatus(staff._id, !staff.isActive);
              if (res.data && res.data.success) {
                Alert.alert('Thành công', res.data.message);
                fetchStaff();
              }
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Thao tác thất bại!');
            }
          }
        }
      ]
    );
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Quản Lý Nhân Viên</Text>
          <Text style={styles.subtitle}>Phân quyền và tài khoản vận hành (UC15 / TC_USER_04)</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setCreateError('');
            setCreateModalVisible(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Thêm NV</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm nhân viên theo tên, SĐT hoặc email..."
          placeholderTextColor="#94a3b8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* List Staff */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách nhân viên...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <StaffCard staff={item} onToggleStatus={() => handleToggleStatus(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>Chưa có nhân viên nào được tạo!</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchStaff}
        />
      )}

      {/* Modal Thêm Nhân Viên Mới */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm Tài Khoản Nhân Viên Mới</Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {createError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {createError}</Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên nhân viên *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Lê Văn Bảo Vệ"
                  placeholderTextColor="#94a3b8"
                  value={newFullName}
                  onChangeText={setNewFullName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: 0908889991"
                  placeholderTextColor="#94a3b8"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ Email *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: nv1@motel.com"
                  placeholderTextColor="#94a3b8"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mật khẩu ban đầu *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vai trò chức vụ</Text>
                <View style={styles.roleChoiceRow}>
                  <TouchableOpacity
                    style={[styles.roleChoiceBtn, newRole === 'STAFF' && styles.roleChoiceActive]}
                    onPress={() => setNewRole('STAFF')}
                  >
                    <Text style={[styles.roleChoiceText, newRole === 'STAFF' && styles.roleChoiceTextActive]}>
                      👔 Nhân viên (STAFF)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleChoiceBtn, newRole === 'MANAGER' && styles.roleChoiceActive]}
                    onPress={() => setNewRole('MANAGER')}
                  >
                    <Text style={[styles.roleChoiceText, newRole === 'MANAGER' && styles.roleChoiceTextActive]}>
                      👑 Quản lý (MANAGER)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, creating && styles.btnDisabled]}
                onPress={handleCreateStaff}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitText}>TẠO NHÂN VIÊN</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StaffCard({ staff, onToggleStatus }) {
  const isManager = staff.role === 'MANAGER';
  const isActive = staff.isActive !== false;

  return (
    <View style={styles.staffCard}>
      <View style={styles.staffCardTop}>
        <Image
          source={{
            uri: staff.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
          }}
          style={styles.staffAvatar}
        />
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{staff.fullName}</Text>
          <Text style={styles.staffContact}>📞 {staff.phone}</Text>
          <Text style={styles.staffContact}>✉️ {staff.email}</Text>
        </View>
        <View style={[styles.roleBadge, isManager ? styles.mgrBg : styles.stfBg]}>
          <Text style={styles.roleText}>{isManager ? '👑 Quản lý' : '👔 Nhân viên'}</Text>
        </View>
      </View>

      <View style={styles.staffCardBottom}>
        <View style={[styles.statusPill, isActive ? styles.activePill : styles.lockedPill]}>
          <Text style={[styles.statusPillText, isActive ? styles.activePillText : styles.lockedPillText]}>
            {isActive ? '● Đang hoạt động' : '🔒 Đã bị khóa'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.toggleBtn, isActive ? styles.lockBtn : styles.unlockBtn]}
          onPress={onToggleStatus}
        >
          <Text style={[styles.toggleBtnText, isActive ? styles.lockBtnText : styles.unlockBtnText]}>
            {isActive ? 'Khóa tài khoản' : 'Mở khóa'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  clearText: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 10,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  staffCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  staffCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  staffInfo: {
    marginLeft: 12,
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  staffContact: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  mgrBg: { backgroundColor: '#fef3c7' },
  stfBg: { backgroundColor: '#e0e7ff' },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  staffCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activePill: { backgroundColor: '#f0fdf4' },
  lockedPill: { backgroundColor: '#fee2e2' },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activePillText: { color: '#166534' },
  lockedPillText: { color: '#991b1b' },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  lockBtn: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  lockBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  unlockBtn: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  unlockBtnText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 20,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#94a3b8',
    padding: 4,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  roleChoiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChoiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleChoiceActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  roleChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  roleChoiceTextActive: {
    color: '#1d4ed8',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
