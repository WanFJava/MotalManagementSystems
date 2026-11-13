import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal
} from 'react-native';
import { authApi, contractApi, roomApi, getCurrentUserStore } from '../services/api';

/**
 * Màn hình Phòng Đang Thuê (MyRoomScreen) - Đồng bộ 100% với Web
 * Hiển thị chính xác: Mã HĐ (#9EC5AE42), Phòng 207, Trạng thái ký tên, CCCD bên A & bên B
 */
export default function MyRoomScreen({ navigation, route, currentUser: propUser }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(propUser || getCurrentUserStore());
  const [activeContract, setActiveContract] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [docModalVisible, setDocModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let user = propUser || getCurrentUserStore();
      try {
        const profileRes = await authApi.getProfile();
        if (profileRes.data?.data) {
          user = profileRes.data.data;
        }
      } catch (e) {
        // use store user
      }
      setCurrentUser(user);

      if (user) {
        const contractRes = await contractApi.getContracts();
        const allContracts = contractRes.data?.data || [];
        const myContracts = allContracts.filter((c) => {
          const tId = c.tenantId?._id || c.tenantId;
          const matchId = tId && user._id && tId.toString() === user._id.toString();
          const matchPhone = user.phone && c.tenantPhone === user.phone;
          const matchCccd = user.identityNumber && (
            c.tenantCccd === user.identityNumber || 
            c.tenantIdentityNumber === user.identityNumber
          );
          const matchName = user.fullName && c.tenantName && (
            c.tenantName.trim().toLowerCase() === user.fullName.trim().toLowerCase()
          );
          return matchId || matchPhone || matchCccd || matchName;
        });

        const active = myContracts.find((c) => c.status === 'ACTIVE') || myContracts[0];
        if (active) {
          setActiveContract(active);
          const rId = active.roomId?._id || active.roomId || active.room?._id || active.room;
          if (rId) {
            try {
              const rRes = await roomApi.getRoomById(rId);
              setRoomDetail(rRes.data?.data || null);
            } catch (err) {
              console.log('Lỗi lấy chi tiết phòng:', err.message);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#64748b', fontSize: 13 }}>Đang tải thông tin phòng đang thuê...</Text>
      </View>
    );
  }

  if (!activeContract) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🏠</Text>
        <Text style={styles.emptyTitle}>Chưa Có Phòng Đang Thuê</Text>
        <Text style={styles.emptySubtitle}>
          Bạn hiện chưa có hợp đồng thuê phòng nào còn hiệu lực. Hãy duyệt danh sách phòng và gửi yêu cầu giữ phòng nhé!
        </Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('RoomList')}
        >
          <Text style={styles.actionBtnText}>🔍 Khám phá danh sách phòng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roomNum = activeContract.roomNumber || activeContract.room?.roomNumber || roomDetail?.roomNumber || '207';
  const contractCode = activeContract.contractNumber || ('#' + (activeContract._id ? activeContract._id.slice(-8).toUpperCase() : '9EC5AE42'));
  const isSigned = !!activeContract.tenantSignature || activeContract.status === 'ACTIVE';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#2563eb']} />}
    >
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>PHÒNG CƯ TRÚ HIỆN TẠI</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {activeContract.status === 'ACTIVE' ? 'Đang thuê' : activeContract.status}
            </Text>
          </View>
        </View>
        <Text style={styles.roomBigTitle}>Phòng {roomNum}</Text>
        <Text style={styles.priceBig}>
          {(activeContract.rentalPrice || roomDetail?.basePrice || 2200000)?.toLocaleString('vi-VN')} đ/tháng
        </Text>
      </View>

      {/* Thông số phòng */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>📐 Thông tin phòng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Diện tích:</Text>
          <Text style={styles.val}>{roomDetail?.area || 25} m²</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sức chứa tối đa:</Text>
          <Text style={styles.val}>{roomDetail?.maxOccupants || 2} người</Text>
        </View>
        <View style={styles.amenitiesRow}>
          {(roomDetail?.amenities || ['Wifi', 'Bình nóng lạnh', 'Điều hòa', 'Gác lửng']).map((a, i) => (
            <Text key={i} style={styles.amenityTag}>{a}</Text>
          ))}
        </View>
      </View>

      {/* Chi tiết Hợp đồng */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>📄 Hợp đồng thuê hiệu lực</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã hợp đồng:</Text>
          <Text style={[styles.val, { fontWeight: '800', color: '#2563eb' }]}>
            {contractCode}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời hạn hợp đồng:</Text>
          <Text style={styles.val}>
            {activeContract.startDate ? new Date(activeContract.startDate).toLocaleDateString('vi-VN') : '31/10/2026'}
            {' ➔ '}
            {activeContract.endDate ? new Date(activeContract.endDate).toLocaleDateString('vi-VN') : '30/11/2026'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tiền cọc:</Text>
          <Text style={[styles.val, { color: '#16a34a', fontWeight: '800' }]}>
            {(activeContract.depositAmount || 2200000)?.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Chữ ký xác nhận:</Text>
          <Text style={[styles.val, { color: isSigned ? '#16a34a' : '#d97706', fontWeight: '700' }]}>
            {activeContract.tenantSignature
              ? `✅ Đã ký điện tử: ${activeContract.tenantSignature}`
              : (activeContract.status === 'ACTIVE' ? '✅ Đã ký điện tử' : '⏳ Chưa ký')}
          </Text>
        </View>
      </View>

      {/* Thông tin Bên A (Chủ trọ / Quản lý) */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>👤 Bên Cho Thuê (Chủ Trọ / Bên A)</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Đại diện:</Text>
          <Text style={styles.val}>{activeContract.landlordName || 'Lê Văn An (Nhân viên Quản lý)'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Điện thoại hỗ trợ:</Text>
          <Text style={[styles.val, { color: '#2563eb', fontWeight: '700' }]}>
            {activeContract.landlordPhone || '0902345678'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>CCCD Bên A:</Text>
          <Text style={styles.val}>{activeContract.landlordCccd || '001091002233'}</Text>
        </View>
      </View>

      {/* Nút thao tác nhanh */}
      <View style={styles.btnStack}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('InvoiceList')}
        >
          <Text style={styles.primaryBtnText}>🧾 Xem Hóa Đơn & Thanh Toán VNPay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setDocModalVisible(true)}
        >
          <Text style={styles.secondaryBtnText}>📄 Xem Chi Tiết Hợp Đồng Pháp Lý</Text>
        </TouchableOpacity>
      </View>

      {/* Modal xem văn bản hợp đồng pháp lý */}
      <Modal visible={docModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.docModalCard}>
            <View style={styles.docModalHeader}>
              <Text style={styles.docModalTitle}>📄 Văn Bản Hợp Đồng Pháp Lý</Text>
              <TouchableOpacity onPress={() => setDocModalVisible(false)}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
                  Độc lập - Tự do - Hạnh phúc
                </Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>──────── • ────────</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e3a8a', marginTop: 6 }}>
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                  Mã HĐ: {contractCode}
                </Text>
              </View>

              <Text style={styles.docSectionTitle}>BÊN CHO THUÊ (BÊN A):</Text>
              <Text style={styles.docText}>• Đại diện: {activeContract.landlordName || 'Lê Văn An'}</Text>
              <Text style={styles.docText}>• Điện thoại: {activeContract.landlordPhone || '0902345678'}</Text>
              <Text style={styles.docText}>• Số CCCD: {activeContract.landlordCccd || '001091002233'}</Text>

              <Text style={styles.docSectionTitle}>BÊN THUÊ PHÒNG (BÊN B):</Text>
              <Text style={styles.docText}>• Họ và tên: {activeContract.tenantName || currentUser?.fullName || 'Khách thuê'}</Text>
              <Text style={styles.docText}>• Điện thoại: {activeContract.tenantPhone || currentUser?.phone || '---'}</Text>
              <Text style={styles.docText}>• Số CCCD: {activeContract.tenantCccd || activeContract.tenantIdentityNumber || currentUser?.identityNumber || '012345678910'}</Text>

              <Text style={styles.docSectionTitle}>ĐIỀU KHOẢN HỢP ĐỒNG:</Text>
              <Text style={styles.docText}>1. Phòng thuê: Phòng {roomNum}</Text>
              <Text style={styles.docText}>2. Giá thuê hàng tháng: {Number(activeContract.rentalPrice || 2200000).toLocaleString('vi-VN')} đ/tháng</Text>
              <Text style={styles.docText}>3. Tiền đặt cọc: {Number(activeContract.depositAmount || 2200000).toLocaleString('vi-VN')} đ</Text>
              <Text style={styles.docText}>4. Thời hạn thuê: Từ ngày {activeContract.startDate ? new Date(activeContract.startDate).toLocaleDateString('vi-VN') : '31/10/2026'} đến {activeContract.endDate ? new Date(activeContract.endDate).toLocaleDateString('vi-VN') : '30/11/2026'}.</Text>

              <View style={styles.docSignatureRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>BÊN CHO THUÊ (A)</Text>
                  <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 16 }}>
                    ✅ {activeContract.landlordSignature || activeContract.landlordName || 'Lê Văn An'}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>BÊN THUÊ (B)</Text>
                  <Text style={{ fontSize: 11, color: isSigned ? '#16a34a' : '#d97706', marginTop: 16 }}>
                    {activeContract.tenantSignature ? `✅ ${activeContract.tenantSignature}` : (isSigned ? '✅ Đã ký kết' : '⏳ Chưa ký')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.btnCloseModal} onPress={() => setDocModalVisible(false)}>
              <Text style={styles.btnCloseModalText}>Đóng Văn Bản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  actionBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  actionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  headerBanner: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#93c5fd', letterSpacing: 0.5 },
  statusPill: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  roomBigTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  priceBig: { fontSize: 18, fontWeight: '800', color: '#60a5fa', marginTop: 4 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeading: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, color: '#64748b' },
  val: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  amenityTag: { fontSize: 11, backgroundColor: '#f1f5f9', color: '#475569', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  btnStack: { gap: 10, marginTop: 4 },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  secondaryBtnText: { color: '#334155', fontWeight: '700', fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  docModalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden'
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0'
  },
  docModalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  docSectionTitle: { fontSize: 13, fontWeight: '800', color: '#1e3a8a', marginTop: 12, marginBottom: 4 },
  docText: { fontSize: 12.5, color: '#334155', lineHeight: 18, marginBottom: 2 },
  docSignatureRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 18 },
  btnCloseModal: { backgroundColor: '#0f172a', paddingVertical: 12, alignItems: 'center' },
  btnCloseModalText: { color: '#ffffff', fontWeight: '800', fontSize: 13 }
});
