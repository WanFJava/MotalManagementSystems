import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { contractApi, roomApi } from '../services/api';

export default function ManageContractScreen({ navigation, route }) {
  const prefill = route?.params?.prefill || {};

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(prefill.roomId || '');
  const [tenantName, setTenantName] = useState(prefill.tenantName || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [rentalPrice, setRentalPrice] = useState(prefill.rentalPrice ? String(prefill.rentalPrice) : '');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setFetchingRooms(true);
      const res = await roomApi.getRooms();
      const allRooms = res.data.data || [];
      // Lọc các phòng AVAILABLE hoặc phòng đang được prefill
      const availableRooms = allRooms.filter(
        r => r.status === 'AVAILABLE' || r._id === prefill.roomId
      );
      setRooms(availableRooms);

      if (availableRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(availableRooms[0]._id);
        if (!rentalPrice && availableRooms[0].basePrice) {
          setRentalPrice(String(availableRooms[0].basePrice));
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoomId(room._id);
    if (!rentalPrice) {
      setRentalPrice(String(room.basePrice || ''));
    }
  };

  // UC05: Tạo hợp đồng mới
  // TC_CTR_01: Tạo hợp đồng hợp lệ
  // TC_CTR_02: Chặn tạo hợp đồng trùng phòng
  const handleCreateContract = async () => {
    if (!selectedRoomId) {
      Alert.alert('Thông báo', 'Vui lòng chọn phòng');
      return;
    }
    if (!tenantName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên người thuê');
      return;
    }
    if (!startDate) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày bắt đầu');
      return;
    }
    if (!endDate) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày kết thúc');
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền cọc hợp lệ');
      return;
    }
    if (!rentalPrice || Number(rentalPrice) <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập đơn giá thuê hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        roomId: selectedRoomId,
        tenantName: tenantName.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        depositAmount: Number(depositAmount),
        rentalPrice: Number(rentalPrice),
        status: 'ACTIVE'
      };

      const res = await contractApi.createContract(payload);
      Alert.alert(
        'Thành công',
        'Lập hợp đồng thành công! Phòng đã được chuyển sang trạng thái RENTED.',
        [
          {
            text: 'Xem chi tiết hợp đồng',
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate('ContractDetail', { contractId: res.data.data._id });
              }
            }
          },
          {
            text: 'Danh sách hợp đồng',
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate('ContractList');
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Tạo hợp đồng thất bại', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Lập hợp đồng thuê phòng</Text>
      <Text style={styles.subtitle}>Thiết lập điều khoản thuê, tiền cọc và thời hạn</Text>

      {fetchingRooms ? (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 15 }} />
      ) : (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn phòng (*):</Text>
          {rooms.length === 0 ? (
            <Text style={styles.warningText}>Không có phòng nào đang trống để lập hợp đồng.</Text>
          ) : (
            <View style={styles.roomList}>
              {rooms.map((r) => (
                <TouchableOpacity
                  key={r._id}
                  style={[styles.roomCard, selectedRoomId === r._id && styles.roomCardSelected]}
                  onPress={() => handleSelectRoom(r)}
                >
                  <Text style={[styles.roomCardTitle, selectedRoomId === r._id && styles.roomCardTitleSelected]}>
                    Phòng {r.roomNumber}
                  </Text>
                  <Text style={styles.roomCardPrice}>
                    {Number(r.basePrice).toLocaleString('vi-VN')} đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tên khách thuê (*):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Trần Văn Nam"
          value={tenantName}
          onChangeText={setTenantName}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Ngày bắt đầu (YYYY-MM-DD):</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-11-01"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Ngày kết thúc (YYYY-MM-DD):</Text>
          <TextInput
            style={styles.input}
            placeholder="2027-05-01"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Tiền đặt cọc (VNĐ) (*):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 3000000"
          keyboardType="numeric"
          value={depositAmount}
          onChangeText={setDepositAmount}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Giá thuê hàng tháng (VNĐ) (*):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 3000000"
          keyboardType="numeric"
          value={rentalPrice}
          onChangeText={setRentalPrice}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleCreateContract}
        disabled={loading || rooms.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Xác nhận lập hợp đồng</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a'
  },
  warningText: { color: '#ef4444', fontStyle: 'italic', fontSize: 14 },
  roomList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roomCard: {
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minWidth: '45%'
  },
  roomCardSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  roomCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  roomCardTitleSelected: { color: '#1d4ed8' },
  roomCardPrice: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});

