import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { roomApi } from '../services/api';

export default function ManageRoomScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [area, setArea] = useState('');
  const [maxOccupants, setMaxOccupants] = useState('2');
  const [status, setStatus] = useState('AVAILABLE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomApi.getRooms();
      setRooms(res.data?.data || []);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setBasePrice('');
    setArea('20');
    setMaxOccupants('2');
    setStatus('AVAILABLE');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setBasePrice(String(room.basePrice || ''));
    setArea(String(room.area || '20'));
    setMaxOccupants(String(room.maxOccupants || '2'));
    setStatus(room.status || 'AVAILABLE');
    setDescription(room.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!roomNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số phòng!');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đơn giá hợp lệ!');
      return;
    }

    const payload = {
      roomNumber: roomNumber.trim(),
      basePrice: Number(basePrice),
      area: Number(area) || 20,
      maxOccupants: Number(maxOccupants) || 2,
      status,
      description: description.trim()
    };

    try {
      setSubmitting(true);
      if (editingRoom) {
        await roomApi.updateRoom(editingRoom._id, payload);
        Alert.alert('Thành công', 'Cập nhật phòng thành công!');
      } else {
        await roomApi.createRoom(payload);
        Alert.alert('Thành công', 'Thêm mới phòng thành công!');
      }
      setModalVisible(false);
      fetchRooms();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể lưu thông tin phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (room) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phòng ${room.roomNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await roomApi.deleteRoom(room._id);
              Alert.alert('Thành công', `Đã xóa phòng ${room.roomNumber}!`);
              fetchRooms();
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa phòng.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>⚙️ Quản Lý Phòng</Text>
          <Text style={styles.sub}>Tổng cộng {rooms.length} phòng</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Text style={styles.addBtnText}>+ Thêm phòng</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>Phòng {item.roomNumber}</Text>
                <View style={[styles.badge, {
                  backgroundColor: item.status === 'AVAILABLE' ? '#dcfce7' : item.status === 'RENTED' ? '#dbeafe' : '#fef3c7'
                }]}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: item.status === 'AVAILABLE' ? '#15803d' : item.status === 'RENTED' ? '#1d4ed8' : '#b45309'
                  }}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardPrice}>{item.basePrice?.toLocaleString('vi-VN')} đ/tháng</Text>
              <Text style={styles.cardMeta}>📐 {item.area}m² • 👥 {item.maxOccupants} người</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                  <Text style={styles.editBtnText}>✏️ Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.delBtnText}>🗑️ Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal Thêm / Sửa Phòng */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingRoom ? `✏️ Cập Nhật Phòng ${editingRoom.roomNumber}` : '➕ Thêm Mới Phòng Trọ'}
              </Text>

              <Text style={styles.label}>Số phòng (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 101, 201..."
                value={roomNumber}
                onChangeText={setRoomNumber}
              />

              <Text style={styles.label}>Đơn giá cơ bản (*)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 2500000"
                keyboardType="numeric"
                value={basePrice}
                onChangeText={setBasePrice}
              />

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Diện tích (m²)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="20"
                    keyboardType="numeric"
                    value={area}
                    onChangeText={setArea}
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Số người tối đa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2"
                    keyboardType="numeric"
                    value={maxOccupants}
                    onChangeText={setMaxOccupants}
                  />
                </View>
              </View>

              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.statusRow}>
                {['AVAILABLE', 'RENTED', 'MAINTENANCE'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>
                      {s === 'AVAILABLE' ? 'Còn trống' : s === 'RENTED' ? 'Đang thuê' : 'Bảo trì'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Mô tả tiện nghi, ghi chú phòng..."
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={submitting}
                >
                  <Text style={styles.saveBtnText}>
                    {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  sub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  addBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#2563eb', marginTop: 4 },
  cardMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 10 },
  editBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  delBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  delBtnText: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  statusBtnActive: { backgroundColor: '#2563eb' },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  statusBtnTextActive: { color: '#ffffff', fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  saveBtn: {
    flex: 2,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
});
