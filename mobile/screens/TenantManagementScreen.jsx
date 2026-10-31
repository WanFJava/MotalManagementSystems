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

export default function TenantManagementScreen({ navigation }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal xem và cập nhật hồ sơ khách thuê
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editIdentity, setEditIdentity] = useState('');
  const [editHometown, setEditHometown] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTempStatus, setEditTempStatus] = useState('NOT_REGISTERED');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await userApi.getTenants();
      if (res.data && res.data.success) {
        setTenants(res.data.data || []);
      }
    } catch (err) {
      console.log('Lỗi tải danh sách khách thuê:', err.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách khách thuê từ máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const openTenantModal = (tenant) => {
    setSelectedTenant(tenant);
    setEditIdentity(tenant.identityNumber || '');
    setEditHometown(tenant.hometown || '');
    setEditAddress(tenant.address || tenant.currentAddress || '');
    setEditTempStatus(tenant.temporaryResidenceStatus || 'NOT_REGISTERED');
    setModalVisible(true);
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;

    try {
      setUpdating(true);
      const res = await userApi.updateTenantProfile(selectedTenant._id, {
        identityNumber: editIdentity.trim(),
        hometown: editHometown.trim(),
        currentAddress: editAddress.trim(),
        temporaryResidenceStatus: editTempStatus
      });

      if (res.data && res.data.success) {
        Alert.alert('Thành công', 'Hồ sơ khách thuê và trạng thái tạm trú đã được cập nhật!');
        setModalVisible(false);
        fetchTenants();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Cập nhật thất bại!';
      Alert.alert('Lỗi', errMsg);
    } finally {
      setUpdating(false);
    }
  };

  // Lọc theo search term và status
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm) ||
      (t.identityNumber && t.identityNumber.includes(searchTerm));

    if (selectedStatus === 'ALL') return matchesSearch;
    return matchesSearch && t.temporaryResidenceStatus === selectedStatus;
  });

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản Lý Khách Thuê</Text>
        <Text style={styles.subtitle}>Phân hệ Hồ sơ Khách thuê & Tạm trú (UC06 / SWR2.3)</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, SĐT hoặc số CCCD..."
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

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <FilterTab
          title="Tất cả"
          active={selectedStatus === 'ALL'}
          count={tenants.length}
          onPress={() => setSelectedStatus('ALL')}
        />
        <FilterTab
          title="Đã tạm trú"
          active={selectedStatus === 'REGISTERED'}
          count={tenants.filter(t => t.temporaryResidenceStatus === 'REGISTERED').length}
          onPress={() => setSelectedStatus('REGISTERED')}
        />
        <FilterTab
          title="Chờ duyệt"
          active={selectedStatus === 'PENDING'}
          count={tenants.filter(t => t.temporaryResidenceStatus === 'PENDING').length}
          onPress={() => setSelectedStatus('PENDING')}
        />
        <FilterTab
          title="Chưa ĐK"
          active={selectedStatus === 'NOT_REGISTERED'}
          count={tenants.filter(t => !t.temporaryResidenceStatus || t.temporaryResidenceStatus === 'NOT_REGISTERED').length}
          onPress={() => setSelectedStatus('NOT_REGISTERED')}
        />
      </View>

      {/* List Tenants */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách khách thuê...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTenants}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TenantCard tenant={item} onSelect={() => openTenantModal(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>Không tìm thấy khách thuê nào phù hợp!</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchTenants}
        />
      )}

      {/* Modal Chi tiết & Cập nhật Hồ sơ Khách thuê */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hồ Sơ Khách Thuê & CCCD</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedTenant && (
                <View>
                  <View style={styles.tenantTopBanner}>
                    <Image
                      source={{
                        uri: selectedTenant.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
                      }}
                      style={styles.tenantModalAvatar}
                    />
                    <View style={styles.modalTenantInfo}>
                      <Text style={styles.modalTenantName}>{selectedTenant.fullName}</Text>
                      <Text style={styles.modalTenantSub}>📞 {selectedTenant.phone}</Text>
                      <Text style={styles.modalTenantSub}>✉️ {selectedTenant.email}</Text>
                    </View>
                  </View>

                  {/* Phòng đang ở */}
                  <View style={styles.roomBox}>
                    <Text style={styles.roomBoxText}>
                      🚪 Phòng đang thuê: {selectedTenant.currentRoom?.roomNumber ? `Phòng ${selectedTenant.currentRoom.roomNumber}` : 'Chưa phân phòng'}
                    </Text>
                  </View>

                  {/* Form Cập nhật CCCD */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Số CCCD / Định danh cá nhân</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editIdentity}
                      onChangeText={setEditIdentity}
                      placeholder="Nhập 12 số CCCD"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Quê quán (Hometown)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editHometown}
                      onChangeText={setEditHometown}
                      placeholder="VD: Hải Phòng"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Địa chỉ thường trú / Nơi ở cũ (Address)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editAddress}
                      onChangeText={setEditAddress}
                      placeholder="VD: Số 10 Mai Dịch, Cầu Giấy, Hà Nội"
                    />
                  </View>

                  {/* Tình trạng Đăng ký Tạm Trú */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Tình trạng Đăng ký Tạm Trú Công An (UC06)</Text>
                    <View style={styles.tempStatusRow}>
                      <TouchableOpacity
                        style={[styles.tempBtn, editTempStatus === 'REGISTERED' && styles.tempBtnActive]}
                        onPress={() => setEditTempStatus('REGISTERED')}
                      >
                        <Text style={[styles.tempBtnText, editTempStatus === 'REGISTERED' && styles.tempBtnTextActive]}>
                          ✅ Đã ĐK
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tempBtn, editTempStatus === 'PENDING' && styles.tempBtnActive]}
                        onPress={() => setEditTempStatus('PENDING')}
                      >
                        <Text style={[styles.tempBtnText, editTempStatus === 'PENDING' && styles.tempBtnTextActive]}>
                          ⏳ Đang chờ
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tempBtn, editTempStatus === 'NOT_REGISTERED' && styles.tempBtnActive]}
                        onPress={() => setEditTempStatus('NOT_REGISTERED')}
                      >
                        <Text style={[styles.tempBtnText, editTempStatus === 'NOT_REGISTERED' && styles.tempBtnTextActive]}>
                          ❌ Chưa ĐK
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, updating && styles.btnDisabled]}
                    onPress={handleUpdateTenant}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.modalSubmitText}>LƯU THÔNG TIN HỒ SƠ</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterTab({ title, active, count, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );
}

function TenantCard({ tenant, onSelect }) {
  const isRegistered = tenant.temporaryResidenceStatus === 'REGISTERED';
  const isPending = tenant.temporaryResidenceStatus === 'PENDING';

  return (
    <View style={styles.tenantCard}>
      <View style={styles.cardTop}>
        <Image
          source={{
            uri: tenant.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'
          }}
          style={styles.cardAvatar}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{tenant.fullName}</Text>
          <Text style={styles.cardPhone}>📞 {tenant.phone}</Text>
          <Text style={styles.cardIdentity}>
            🪪 CCCD: {tenant.identityNumber || 'Chưa nộp hồ sơ'}
          </Text>
        </View>
        <View style={styles.cardRoomBadge}>
          <Text style={styles.cardRoomText}>
            {tenant.currentRoom?.roomNumber ? `P.${tenant.currentRoom.roomNumber}` : 'Chưa có P.'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <View style={[styles.residenceBadge, isRegistered ? styles.regBg : isPending ? styles.pendBg : styles.notRegBg]}>
          <Text style={[styles.residenceText, isRegistered ? styles.regText : isPending ? styles.pendText : styles.notRegText]}>
            {isRegistered ? '✅ Đã ĐK tạm trú' : isPending ? '⏳ Chờ duyệt tạm trú' : '⚠️ Chưa ĐK tạm trú'}
          </Text>
        </View>

        <TouchableOpacity style={styles.detailBtn} onPress={onSelect}>
          <Text style={styles.detailBtnText}>Chi tiết hồ sơ &gt;</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
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
  filterTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 6,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  tabBtnActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
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
  tenantCard: {
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardIdentity: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  cardRoomBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  cardRoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  residenceBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  regBg: { backgroundColor: '#dcfce7' },
  pendBg: { backgroundColor: '#fef3c7' },
  notRegBg: { backgroundColor: '#fee2e2' },
  residenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  regText: { color: '#166534' },
  pendText: { color: '#854d0e' },
  notRegText: { color: '#991b1b' },
  detailBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
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
    marginBottom: 16,
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
  tenantTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  tenantModalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalTenantInfo: {
    marginLeft: 12,
  },
  modalTenantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalTenantSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roomBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  roomBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
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
  tempStatusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tempBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tempBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  tempBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tempBtnTextActive: {
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
