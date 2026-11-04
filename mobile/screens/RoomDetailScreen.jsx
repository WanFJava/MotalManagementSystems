import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { roomApi } from '../services/api';

export default function RoomDetailScreen({ navigation, route }) {
  const roomId = route?.params?.roomId;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId) {
      loadRoomDetail();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      const res = await roomApi.getRoomById(roomId);
      setRoom(res.data?.data || null);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy thông tin phòng trọ.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('RoomList')}>
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAvailable = room.status === 'AVAILABLE';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Bar */}
        <TouchableOpacity style={styles.navBack} onPress={() => navigation.navigate('RoomList')}>
          <Text style={styles.navBackText}>‹ Quay lại danh sách</Text>
        </TouchableOpacity>

        {/* Room Card Title */}
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <Text style={styles.roomTitle}>Phòng {room.roomNumber}</Text>
            <View style={[styles.statusBadge, {
              backgroundColor: isAvailable ? '#dcfce7' : room.status === 'RENTED' ? '#dbeafe' : '#fef3c7'
            }]}>
              <Text style={{
                color: isAvailable ? '#15803d' : room.status === 'RENTED' ? '#1d4ed8' : '#b45309',
                fontWeight: '700',
                fontSize: 12
              }}>
                {isAvailable ? 'Còn trống' : room.status === 'RENTED' ? 'Đang thuê' : 'Bảo trì'}
              </Text>
            </View>
          </View>
          <Text style={styles.priceText}>{room.basePrice?.toLocaleString('vi-VN')} đ/tháng</Text>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionHeading}>Thông số chi tiết</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📐 Diện tích:</Text>
            <Text style={styles.infoValue}>{room.area} m²</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👥 Sức chứa tối đa:</Text>
            <Text style={styles.infoValue}>{room.maxOccupants} người</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🔑 Trạng thái:</Text>
            <Text style={styles.infoValue}>{room.status}</Text>
          </View>
        </View>

        {/* Tiện nghi phòng */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionHeading}>Tiện nghi đi kèm</Text>
          <View style={styles.amenitiesGrid}>
            {(room.amenities || ['Wifi', 'Điều hòa', 'Nóng lạnh']).map((item, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityCheck}>✓</Text>
                <Text style={styles.amenityName}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mô tả chi tiết */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionHeading}>Mô tả phòng</Text>
          <Text style={styles.descText}>
            {room.description || 'Phòng trọ tiện nghi, không gian thoáng mát, giờ giấc tự do, an ninh đảm bảo.'}
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA Button */}
      <View style={styles.footer}>
        {isAvailable ? (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('RentalRequest', { roomId: room._id })}
          >
            <Text style={styles.ctaText}>📋 Đặt Phòng Ngay</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledButton}>
            <Text style={styles.disabledText}>Phòng hiện không thể cho thuê</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { padding: 16, paddingBottom: 100 },
  navBack: { marginBottom: 12 },
  navBackText: { fontSize: 14, color: '#2563eb', fontWeight: '700' },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  priceText: { fontSize: 20, fontWeight: '800', color: '#2563eb', marginTop: 8 },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  infoLabel: { fontSize: 14, color: '#64748b' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityCheck: { color: '#16a34a', fontWeight: 'bold' },
  amenityName: { fontSize: 13, color: '#334155', fontWeight: '500' },
  descText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  ctaButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  disabledButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 15, color: '#ef4444', marginBottom: 16 },
  backBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#ffffff', fontWeight: '600' },
});
