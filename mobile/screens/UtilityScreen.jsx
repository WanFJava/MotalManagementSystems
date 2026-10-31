import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { getRooms, getUtilities, recordUtility } from '../services/api';

export default function UtilityScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [month, setMonth] = useState('2026-10');
  const [oldElec, setOldElec] = useState('100');
  const [newElec, setNewElec] = useState('150');
  const [oldWater, setOldWater] = useState('10');
  const [newWater, setNewWater] = useState('15');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const roomList = await getRooms();
      setRooms(roomList || []);
      if (roomList?.length > 0) setSelectedRoomId(roomList[0]._id);
      const list = await getUtilities();
      setReadings(list || []);
    } catch (err) {
      console.log('Load utilities error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (Number(newElec) < Number(oldElec)) {
      Alert.alert('Lỗi nghiệp vụ', 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ! (TC_INV_01)');
      return;
    }
    if (Number(newWater) < Number(oldWater)) {
      Alert.alert('Lỗi nghiệp vụ', 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ!');
      return;
    }

    try {
      setLoading(true);
      await recordUtility({
        roomId: selectedRoomId,
        month,
        oldElectricIndex: Number(oldElec),
        newElectricIndex: Number(newElec),
        oldWaterIndex: Number(oldWater),
        newWaterIndex: Number(newWater)
      });
      Alert.alert('Thành công', 'Đã ghi nhận chỉ số điện nước thành công!');
      loadData();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const elecUsage = Math.max(0, Number(newElec || 0) - Number(oldElec || 0));
  const waterUsage = Math.max(0, Number(newWater || 0) - Number(oldWater || 0));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚡ Quản lý Chỉ số Điện & Nước (UC07)</Text>
      <Text style={styles.subtitle}>Ghi chỉ số công tơ điện nước hàng tháng cho từng phòng</Text>

      {/* Form nhập chỉ số */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Nhập chỉ số công tơ mới</Text>

        <Text style={styles.label}>Chọn phòng trọ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomSelectRow}>
          {rooms.map((r) => (
            <TouchableOpacity
              key={r._id}
              style={[styles.roomChip, selectedRoomId === r._id && styles.roomChipActive]}
              onPress={() => setSelectedRoomId(r._id)}
            >
              <Text style={[styles.roomChipText, selectedRoomId === r._id && styles.roomChipTextActive]}>
                P.{r.roomNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Tháng ghi (YYYY-MM):</Text>
        <TextInput
          style={styles.input}
          value={month}
          onChangeText={setMonth}
          placeholder="2026-10"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Số điện cũ (kWh):</Text>
            <TextInput
              style={styles.input}
              value={oldElec}
              onChangeText={setOldElec}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số điện mới (kWh):</Text>
            <TextInput
              style={styles.input}
              value={newElec}
              onChangeText={setNewElec}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Text style={styles.previewText}>⚡ Tiêu thụ: {elecUsage} kWh (Ước tính: {(elecUsage * 3500).toLocaleString('vi-VN')} đ)</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Số nước cũ (m³):</Text>
            <TextInput
              style={styles.input}
              value={oldWater}
              onChangeText={setOldWater}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số nước mới (m³):</Text>
            <TextInput
              style={styles.input}
              value={newWater}
              onChangeText={setNewWater}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Text style={styles.previewText}>💧 Tiêu thụ: {waterUsage} m³ (Ước tính: {(waterUsage * 20000).toLocaleString('vi-VN')} đ)</Text>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>💾 Lưu chỉ số điện nước</Text>}
        </TouchableOpacity>
      </View>

      {/* Lịch sử ghi chỉ số */}
      <Text style={styles.sectionHeader}>📋 Lịch sử chốt số công tơ ({readings.length})</Text>
      {readings.map((item) => (
        <View key={item._id} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.roomBadge}>Phòng {item.room?.roomNumber || 'N/A'}</Text>
            <Text style={styles.monthBadge}>Tháng {item.month}</Text>
          </View>
          <Text style={styles.historyDetail}>
            ⚡ Điện: {item.oldElec} ➔ {item.newElec} (<Text style={{ fontWeight: 'bold' }}>{item.electricUsage} kWh</Text>)
          </Text>
          <Text style={styles.historyDetail}>
            💧 Nước: {item.oldWater} ➔ {item.newWater} (<Text style={{ fontWeight: 'bold' }}>{item.waterUsage} m³</Text>)
          </Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#ffffff', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  previewText: { fontSize: 12, color: '#0284c7', fontWeight: '600', marginBottom: 10 },
  roomSelectRow: { flexDirection: 'row', marginBottom: 12 },
  roomChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  roomChipActive: { backgroundColor: '#2563eb' },
  roomChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  roomChipTextActive: { color: '#ffffff' },
  submitBtn: { backgroundColor: '#16a34a', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 6 },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  roomBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  monthBadge: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  historyDetail: { fontSize: 13, color: '#334155', marginBottom: 4 }
});
