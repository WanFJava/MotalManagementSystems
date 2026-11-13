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
import { rentalRequestApi, roomApi, authApi } from '../services/api';

export default function RentalRequestScreen({ navigation, route }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(route?.params?.roomId || '');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [expectedMoveInDate, setExpectedMoveInDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(true);

  useEffect(() => {
    loadAvailableRooms();
    loadProfileForAutoFill();
  }, []);

  const loadProfileForAutoFill = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.data && res.data.success && res.data.data) {
        const u = res.data.data;
        if (u.fullName) setTenantName(u.fullName);
        if (u.phone) setTenantPhone(u.phone);
        if (u.identityNumber && !note) {
          setNote(`CCCD: ${u.identityNumber} ${u.address ? `| Đ/c: ${u.address}` : ''}`);
        }
      }
    } catch (err) {
      // Chưa đăng nhập, bỏ qua auto-fill
    }
  };

  const loadAvailableRooms = async () => {
    try {
      setFetchingRooms(true);
      const res = await roomApi.getRooms();
      const allRooms = res.data.data || [];
      // Lọc các phòng AVAILABLE
      const availableRooms = allRooms.filter(r => r.status === 'AVAILABLE');
      setRooms(availableRooms);
      if (availableRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(availableRooms[0]._id);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setFetchingRooms(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRoomId) {
      Alert.alert('Thông báo', 'Vui lòng chọn phòng cần thuê');
      return;
    }
    if (!tenantName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!tenantPhone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại liên hệ');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        roomId: selectedRoomId,
        tenantName: tenantName.trim(),
        tenantPhone: tenantPhone.trim(),
        expectedMoveInDate: expectedMoveInDate ? new Date(expectedMoveInDate) : new Date(),
        note: note.trim()
      };

      const res = await rentalRequestApi.createRequest(payload);
      Alert.alert(
        'Thành công',
        'Yêu cầu thuê phòng của bạn đã được gửi tới chủ trọ!',
        [
          {
            text: 'Xem yêu cầu của tôi',
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate('MyRentalRequests', { tenantName });
              }
            }
          },
          { text: 'Đóng', style: 'cancel' }
        ]
      );

      // Reset form
      setNote('');
    } catch (err) {
      Alert.alert('Gửi yêu cầu thất bại', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gửi yêu cầu thuê phòng</Text>
      <Text style={styles.subtitle}>Điền thông tin để chủ trọ liên hệ và giữ phòng cho bạn</Text>

      {fetchingRooms ? (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 15 }} />
      ) : (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Chọn phòng trống (*):</Text>
          {rooms.length === 0 ? (
            <Text style={styles.warningText}>Hiện tại không có phòng nào còn trống.</Text>
          ) : (
            <View style={styles.roomList}>
              {rooms.map(room => (
                <TouchableOpacity
                  key={room._id}
                  style={[
                    styles.roomCard,
                    selectedRoomId === room._id && styles.roomCardSelected
                  ]}
                  onPress={() => setSelectedRoomId(room._id)}
                >
                  <Text style={[styles.roomCardTitle, selectedRoomId === room._id && styles.roomCardTitleSelected]}>
                    Phòng {room.roomNumber}
                  </Text>
                  <Text style={[styles.roomCardPrice, selectedRoomId === room._id && styles.roomCardPriceSelected]}>
                    {Number(room.basePrice).toLocaleString('vi-VN')} đ/tháng
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Họ và tên khách thuê (*):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Nguyễn Văn A"
          value={tenantName}
          onChangeText={setTenantName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Số điện thoại (*):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 0912345678"
          keyboardType="phone-pad"
          value={tenantPhone}
          onChangeText={setTenantPhone}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ngày dự kiến chuyển vào (YYYY-MM-DD):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 2026-11-01"
          value={expectedMoveInDate}
          onChangeText={setExpectedMoveInDate}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ghi chú thêm:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ví dụ: Số lượng người ở, có nuôi thú cưng không..."
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || rooms.length === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Xác nhận gửi yêu cầu</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  formGroup: { marginBottom: 16 },
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
  textArea: { height: 80, textAlignVertical: 'top' },
  warningText: { color: '#ef4444', fontSize: 14, fontStyle: 'italic' },
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
  roomCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  roomCardTitleSelected: { color: '#1d4ed8' },
  roomCardPrice: { fontSize: 13, color: '#64748b', marginTop: 4 },
  roomCardPriceSelected: { color: '#2563eb', fontWeight: '500' },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});

