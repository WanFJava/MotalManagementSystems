import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { contractApi } from '../services/api';

export default function ContractDetailScreen({ route, navigation }) {
  const contractId = route?.params?.contractId;
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Gia hạn
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');

  useEffect(() => {
    if (contractId) {
      loadContractDetail();
    }
  }, [contractId]);

  const loadContractDetail = async () => {
    try {
      setLoading(true);
      const res = await contractApi.getContractById(contractId);
      setContract(res.data.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết hợp đồng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // UC05.1: Gia hạn hợp đồng
  const handleExtend = async () => {
    if (!newEndDate.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày kết thúc mới (YYYY-MM-DD)');
      return;
    }

    try {
      setActionLoading(true);
      await contractApi.extendContract(contractId, newEndDate.trim());
      Alert.alert('Thành công', 'Đã gia hạn hợp đồng thành công!');
      setExtendModalVisible(false);
      loadContractDetail();
    } catch (err) {
      Alert.alert('Gia hạn thất bại', err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // UC05.2: Thanh lý hợp đồng
  const handleTerminate = () => {
    Alert.alert(
      'Xác nhận thanh lý hợp đồng',
      'Hợp đồng sẽ chuyển sang trạng thái TERMINATED và phòng sẽ tự động chuyển về trạng thái AVAILABLE (trống). Bạn có chắc chắn muốn thực hiện?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận thanh lý',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await contractApi.terminateContract(contractId);
              Alert.alert('Thành công', 'Đã thanh lý hợp đồng và giải phóng phòng về trạng thái TRỐNG!');
              loadContractDetail();
            } catch (err) {
              Alert.alert('Thanh lý thất bại', err.response?.data?.message || err.message);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy thông tin hợp đồng.</Text>
      </View>
    );
  }

  const room = contract.roomId || contract.room || {};
  const isActive = contract.status === 'ACTIVE';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.roomTitle}>Phòng {room.roomNumber || '---'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#dcfce7' : '#fee2e2' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isActive ? '#166534' : '#991b1b' }
            ]}>
              {contract.status === 'ACTIVE' ? 'ĐANG HIỆU LỰC' : contract.status}
            </Text>
          </View>
        </View>
        <Text style={styles.contractCode}>Mã HĐ: {contract._id}</Text>
      </View>

      {/* Thông tin khách thuê */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin khách thuê</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Họ và tên:</Text>
          <Text style={styles.valBold}>{contract.tenantName}</Text>
        </View>
        {contract.tenantId && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã định danh:</Text>
            <Text style={styles.val}>{contract.tenantId}</Text>
          </View>
        )}
      </View>

      {/* Thông tin phòng */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin phòng trọ</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số phòng:</Text>
          <Text style={styles.valBold}>{room.roomNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Trạng thái phòng:</Text>
          <Text style={styles.val}>{room.status}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sức chứa tối đa:</Text>
          <Text style={styles.val}>{room.maxOccupants || 2} người</Text>
        </View>
      </View>

      {/* Điều khoản & Tài chính */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Điều khoản & Tài chính</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Giá thuê hàng tháng:</Text>
          <Text style={styles.priceHighlight}>
            {Number(contract.rentalPrice).toLocaleString('vi-VN')} đ/tháng
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tiền đặt cọc:</Text>
          <Text style={styles.valBold}>
            {Number(contract.depositAmount).toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày bắt đầu:</Text>
          <Text style={styles.val}>
            {contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '---'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày kết thúc:</Text>
          <Text style={styles.valBold}>
            {contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '---'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày tạo hợp đồng:</Text>
          <Text style={styles.val}>
            {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('vi-VN') : '---'}
          </Text>
        </View>
      </View>

      {/* Các nút hành động nghiệp vụ */}
      {isActive && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.extendBtn}
            onPress={() => {
              setNewEndDate('');
              setExtendModalVisible(true);
            }}
            disabled={actionLoading}
          >
            <Text style={styles.actionBtnText}>🕒 Gia hạn hợp đồng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.terminateBtn}
            onPress={handleTerminate}
            disabled={actionLoading}
          >
            <Text style={styles.actionBtnText}>⚠️ Thanh lý hợp đồng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Gia hạn hợp đồng */}
      <Modal
        visible={extendModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExtendModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gia hạn hợp đồng</Text>
            <Text style={styles.modalSubtitle}>
              Hợp đồng phòng {room.roomNumber} - Hiện hết hạn ngày:{' '}
              {contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : ''}
            </Text>

            <Text style={styles.modalLabel}>Nhập ngày kết thúc mới (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: 2027-06-30"
              value={newEndDate}
              onChangeText={setNewEndDate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setExtendModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleExtend}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Xác nhận gia hạn</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ef4444', fontSize: 16 },
  headerCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  contractCode: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#64748b' },
  val: { fontSize: 14, color: '#1e293b' },
  valBold: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  priceHighlight: { fontSize: 15, fontWeight: 'bold', color: '#2563eb' },
  actionSection: { gap: 12, marginTop: 10 },
  extendBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  terminateBtn: { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalCancelText: { color: '#64748b', fontWeight: 'bold' },
  modalConfirmBtn: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalConfirmText: { color: '#ffffff', fontWeight: 'bold' }
});

