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

  // Bên cho thuê (Bên A)
  const [landlordName, setLandlordName] = useState('Nguyễn Ngọc Quang');
  const [landlordDob, setLandlordDob] = useState('1990-01-01');
  const [landlordCccd, setLandlordCccd] = useState('001090012345');
  const [landlordAddress, setLandlordAddress] = useState('Số 123 Đường Cầu Giấy, Q. Cầu Giấy, Hà Nội');
  const [landlordPhone, setLandlordPhone] = useState('0987654321');
  const [landlordWorkplace, setLandlordWorkplace] = useState('Công ty Quản lý Tòa nhà Motel Management');

  // Bên thuê (Bên B)
  const [tenantName, setTenantName] = useState(prefill.tenantName || '');
  const [tenantDob, setTenantDob] = useState('2004-05-15');
  const [tenantCccd, setTenantCccd] = useState('038204001234');
  const [tenantAddress, setTenantAddress] = useState('Xã Phú Minh, H. Sóc Sơn, Hà Nội');
  const [tenantPhone, setTenantPhone] = useState('0912345678');
  const [tenantWorkplace, setTenantWorkplace] = useState('Đại học FPT Hà Nội');

  // Hợp đồng
  const [signedDate, setSignedDate] = useState(new Date().toISOString().split('T')[0]);
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
      Alert.alert('Thông báo', 'Vui lòng nhập ngày bắt đầu thuê');
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
        landlordName: landlordName.trim(),
        landlordDob: landlordDob ? new Date(landlordDob) : null,
        landlordCccd: landlordCccd.trim(),
        landlordAddress: landlordAddress.trim(),
        landlordPhone: landlordPhone.trim(),
        landlordWorkplace: landlordWorkplace.trim(),

        tenantName: tenantName.trim(),
        tenantDob: tenantDob ? new Date(tenantDob) : null,
        tenantCccd: tenantCccd.trim(),
        tenantAddress: tenantAddress.trim(),
        tenantPhone: tenantPhone.trim(),
        tenantWorkplace: tenantWorkplace.trim(),

        signedDate: signedDate ? new Date(signedDate) : new Date(),
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
      <Text style={styles.subtitle}>Thiết lập đầy đủ thông tin pháp lý bên cho thuê và bên thuê</Text>

      {/* CHỌN PHÒNG */}
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

      {/* I. BÊN CHO THUÊ */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionHeading}>I. BÊN CHO THUÊ (BÊN A - CHỦ NHÀ)</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên chủ nhà: *</Text>
          <TextInput style={styles.input} value={landlordName} onChangeText={setLandlordName} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số CCCD / CMND: *</Text>
          <TextInput style={styles.input} value={landlordCccd} onChangeText={setLandlordCccd} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại: *</Text>
          <TextInput style={styles.input} value={landlordPhone} onChangeText={setLandlordPhone} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ thường trú: *</Text>
          <TextInput style={styles.input} value={landlordAddress} onChangeText={setLandlordAddress} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nơi công tác / Đơn vị:</Text>
          <TextInput style={styles.input} value={landlordWorkplace} onChangeText={setLandlordWorkplace} />
        </View>
      </View>

      {/* II. BÊN THUÊ */}
      <View style={[styles.sectionBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
        <Text style={[styles.sectionHeading, { color: '#166534' }]}>II. BÊN THUÊ (BÊN B - KHÁCH TRỌ)</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên khách thuê: *</Text>
          <TextInput style={styles.input} placeholder="Nguyễn Văn Đức" value={tenantName} onChangeText={setTenantName} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày tháng năm sinh (YYYY-MM-DD):</Text>
          <TextInput style={styles.input} placeholder="2004-05-15" value={tenantDob} onChangeText={setTenantDob} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số CCCD / CMND:</Text>
          <TextInput style={styles.input} placeholder="038204001234" value={tenantCccd} onChangeText={setTenantCccd} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <TextInput style={styles.input} placeholder="0912345678" value={tenantPhone} onChangeText={setTenantPhone} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ thường trú:</Text>
          <TextInput style={styles.input} placeholder="Xã Phú Minh, Sóc Sơn, Hà Nội" value={tenantAddress} onChangeText={setTenantAddress} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nơi công tác / Học tập:</Text>
          <TextInput style={styles.input} placeholder="Đại học FPT" value={tenantWorkplace} onChangeText={setTenantWorkplace} />
        </View>
      </View>

      {/* III. THỜI HẠN & TÀI CHÍNH */}
      <View style={[styles.sectionBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
        <Text style={[styles.sectionHeading, { color: '#c2410c' }]}>III. THỜI HẠN & TÀI CHÍNH</Text>
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Ngày ký HĐ:</Text>
            <TextInput style={styles.input} value={signedDate} onChangeText={setSignedDate} />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Ngày bắt đầu:</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày kết thúc (YYYY-MM-DD): *</Text>
          <TextInput style={styles.input} placeholder="2027-05-01" value={endDate} onChangeText={setEndDate} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiền đặt cọc (VNĐ): *</Text>
          <TextInput style={styles.input} placeholder="3000000" keyboardType="numeric" value={depositAmount} onChangeText={setDepositAmount} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Giá thuê hàng tháng (VNĐ): *</Text>
          <TextInput style={styles.input} placeholder="2500000" keyboardType="numeric" value={rentalPrice} onChangeText={setRentalPrice} />
        </View>
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
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 16 },
  sectionBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  sectionHeading: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  row: { flexDirection: 'row' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a'
  },
  warningText: { color: '#ef4444', fontStyle: 'italic', fontSize: 13 },
  roomList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomCard: {
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minWidth: '45%'
  },
  roomCardSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  roomCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  roomCardTitleSelected: { color: '#1d4ed8' },
  roomCardPrice: { fontSize: 12, color: '#64748b', marginTop: 2 },
  submitButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});
