import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { contractApi, getCurrentUserStore, roomApi } from '../services/api';

/**
 * Màn hình Hợp Đồng Thuê Phòng (Đồng bộ chuẩn 100% với Web MyContractsScreen.jsx & ManageContractsScreen.jsx)
 * - Tabs: Tất cả | ✍️ Chờ bạn ký | Đang hiệu lực | Đã thanh lý | 🔄 Tải lại
 * - Card: Mã hợp đồng (#9EC5AE42), Phòng 207, Giá thuê, Tiền cọc, Thời hạn, Chữ ký
 * - Hỗ trợ Modal Ký tên Online, Modal Xem văn bản hợp đồng pháp lý, Modal Xem CCCD 2 mặt
 */
export default function ContractListScreen({ navigation, route, currentUser: propUser }) {
  const [contracts, setContracts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [viewingDocContract, setViewingDocContract] = useState(null);
  const [signingContract, setSigningContract] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [viewingCccdContract, setViewingCccdContract] = useState(null);

  const currentUser = propUser || route?.params?.currentUser || getCurrentUserStore();
  const isTenant = currentUser && currentUser.role === 'TENANT';

  useEffect(() => {
    fetchContracts();
  }, [currentUser]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const queryParams = (isTenant && currentUser) ? {
        tenantId: currentUser._id,
        tenantPhone: currentUser.phone,
        tenantIdentityNumber: currentUser.identityNumber,
      } : {};
      const res = await contractApi.getContracts(queryParams);
      let allContracts = res.data?.data || [];

      // Phân quyền: Nếu là Khách thuê, chỉ lọc hợp đồng thuộc về mình
      if (isTenant && currentUser) {
        allContracts = allContracts.filter(c => {
          const tId = c.tenantId?._id || c.tenantId;
          const matchId = tId && currentUser._id && tId.toString() === currentUser._id.toString();
          const matchPhone = currentUser.phone && c.tenantPhone === currentUser.phone;
          const matchCccd = currentUser.identityNumber && (
            c.tenantCccd === currentUser.identityNumber || 
            c.tenantIdentityNumber === currentUser.identityNumber
          );
          const matchName = currentUser.fullName && c.tenantName && (
            c.tenantName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()
          );
          return matchId || matchPhone || matchCccd || matchName;
        });
      }

      setContracts(allContracts);
    } catch (err) {
      console.error('Lỗi tải hợp đồng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'WAITING_TENANT_SIGNATURE') {
      return c.status === 'WAITING_TENANT_SIGNATURE' || c.status === 'PENDING_SIGNATURE' || (!c.tenantSignature && c.status !== 'TERMINATED');
    }
    return c.status === filterStatus;
  });

  const getStatusInfo = (c) => {
    const isWaiting = c.status === 'WAITING_TENANT_SIGNATURE' || c.status === 'PENDING_SIGNATURE' || (!c.tenantSignature && c.status === 'PENDING');
    if (isWaiting) {
      return { text: '✍️ CHỜ BẠN KÝ ONLINE', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    }
    if (c.status === 'ACTIVE') {
      return { text: 'ĐANG HIỆU LỰC', bg: '#dcfce7', color: '#166534', border: '#86efac' };
    }
    if (c.status === 'TERMINATED') {
      return { text: 'ĐÃ THANH LÝ', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    }
    return { text: c.status || 'DỰ THẢO', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  };

  const handleOpenSignModal = (contract) => {
    setSigningContract(contract);
    setSignatureName(currentUser?.fullName || contract.tenantName || '');
    setAgreedTerms(false);
  };

  const handleConfirmSign = async () => {
    if (!signatureName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn để làm chữ ký điện tử xác nhận!');
      return;
    }
    if (!agreedTerms) {
      Alert.alert('Thông báo', 'Vui lòng tích chọn đồng ý với các điều khoản của hợp đồng thuê phòng!');
      return;
    }

    try {
      setSigningLoading(true);
      await contractApi.signContract(signingContract._id, {
        signature: signatureName.trim(),
        tenantName: signatureName.trim(),
        userId: currentUser?._id
      });
      Alert.alert('Ký tên thành công 🎉', 'Hợp đồng đã chính thức được kích hoạt có hiệu lực!');
      setSigningContract(null);
      fetchContracts();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Ký tên online thất bại!');
    } finally {
      setSigningLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const room = item.roomId || item.room || {};
    const roomNum = item.roomNumber || room.roomNumber || '207';
    const statusInfo = getStatusInfo(item);
    const isWaiting = statusInfo.text.includes('CHỜ BẠN KÝ');
    const contractCode = item.contractNumber || ('#' + (item._id ? item._id.slice(-8).toUpperCase() : 'HĐ-9EC5AE42'));
    const startStr = item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '31/10/2026';
    const endStr = item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : '30/11/2026';

    return (
      <View style={[styles.card, { borderColor: statusInfo.border }]}>
        {/* Header Card Hợp Đồng */}
        <View style={[styles.cardHeader, { backgroundColor: isWaiting ? '#fffbeb' : statusInfo.bg }]}>
          <View>
            <Text style={styles.contractCodeLabel}>MÃ HỢP ĐỒNG: {contractCode}</Text>
            <Text style={styles.roomTitle}>Phòng {roomNum}</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: statusInfo.bg, borderColor: statusInfo.border }]}>
            <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Banner nhắc nhở ký tên nếu đang chờ ký */}
        {isWaiting && (
          <View style={styles.signAlertBox}>
            <Text style={styles.signAlertIcon}>⚠️</Text>
            <Text style={styles.signAlertText}>
              <Text style={{ fontWeight: '800' }}>Yêu cầu xác nhận:</Text> Chủ nhà đã lập hợp đồng. Bạn cần bấm <Text style={{ fontWeight: '800' }}>"Ký Tên Online"</Text> bên dưới để hợp đồng chính thức có hiệu lực và nhận phòng!
            </Text>
          </View>
        )}

        {/* Nội dung thông tin chi tiết */}
        <View style={styles.cardBody}>
          <View style={styles.infoGridRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Giá thuê hàng tháng:</Text>
              <Text style={styles.rentPrice}>
                {Number(item.rentalPrice || 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Tiền đặt cọc:</Text>
              <Text style={styles.depositPrice}>
                {Number(item.depositAmount || 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Thời hạn hợp đồng:</Text>
            <Text style={styles.detailVal}>{startStr}  ➔  {endStr}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Bên Cho Thuê (A):</Text>
            <Text style={styles.detailVal}>{item.landlordName || 'Lê Văn An (Nhân viên Quản lý)'} ({item.landlordPhone || '0902345678'})</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🙋 Bên Thuê Phòng (B):</Text>
            <Text style={styles.detailVal}>
              {item.tenantName || currentUser?.fullName || 'Khách thuê'} - CCCD: {item.tenantCccd || item.tenantIdentityNumber || currentUser?.identityNumber || '012345678910'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✍️ Chữ ký Bên B:</Text>
            <Text style={[styles.detailVal, { color: (item.tenantSignature || item.status === 'ACTIVE') ? '#16a34a' : '#d97706', fontWeight: '700' }]}>
              {item.tenantSignature ? `✅ Đã ký điện tử: ${item.tenantSignature}` : (item.status === 'ACTIVE' ? '✅ Đã ký hợp đồng' : '⏳ Chưa ký xác nhận')}
            </Text>
          </View>

          {/* Hàng nút bấm hành động */}
          <View style={styles.actionBtnRow}>
            {isWaiting && (
              <TouchableOpacity
                style={styles.btnSignOnline}
                onPress={() => handleOpenSignModal(item)}
              >
                <Text style={styles.btnSignOnlineText}>✍️ Ký Tên Online (Nhận Phòng)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.btnDoc}
              onPress={() => setViewingDocContract(item)}
            >
              <Text style={styles.btnDocText}>📄 Xem Văn Bản Hợp Đồng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCccd}
              onPress={() => setViewingCccdContract(item)}
            >
              <Text style={styles.btnCccdText}>🆔 Xem CCCD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề & Mô tả */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>
          {isTenant ? '📄 Hợp Đồng Thuê Phòng Của Tôi' : '📄 Quản Lý Hợp Đồng Thuê'}
        </Text>
        <Text style={styles.screenSub}>
          Xem lại hợp đồng đã lập, ký tên online để kích hoạt hiệu lực, kiểm tra thời hạn và thông tin CCCD
        </Text>
      </View>

      {/* Tabs lọc trạng thái y hệt Web */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'WAITING_TENANT_SIGNATURE', label: '✍️ Chờ bạn ký' },
          { key: 'ACTIVE', label: 'Đang hiệu lực' },
          { key: 'TERMINATED', label: 'Đã thanh lý' }
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabPill, filterStatus === t.key && styles.tabPillActive]}
            onPress={() => setFilterStatus(t.key)}
          >
            <Text style={[styles.tabPillText, filterStatus === t.key && styles.tabPillTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.reloadBtn} onPress={fetchContracts}>
          <Text style={styles.reloadBtnText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách hợp đồng...</Text>
        </View>
      ) : filteredContracts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📑</Text>
          <Text style={styles.emptyTitle}>Bạn chưa có hợp đồng thuê phòng nào</Text>
          <Text style={styles.emptySub}>
            Sau khi yêu cầu giữ phòng của bạn được ban quản lý phê duyệt và hoàn tất thủ tục lập hợp đồng, văn bản hợp đồng sẽ hiển thị tại đây.
          </Text>
          <TouchableOpacity
            style={styles.btnExploreRooms}
            onPress={() => navigation.navigate('RoomList')}
          >
            <Text style={styles.btnExploreRoomsText}>🔍 Xem danh sách phòng trống</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item._id || item.contractNumber || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContracts(); }} colors={['#2563eb']} />
          }
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 1: KÝ TÊN ONLINE (BÊN B XÁC NHẬN HỢP ĐỒNG)         */}
      {/* ======================================================== */}
      <Modal visible={!!signingContract} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.signModalCard}>
            <Text style={styles.modalTitle}>✍️ Ký Tên Điện Tử Online</Text>
            <Text style={styles.modalSubtitle}>
              Xác nhận ký kết hợp đồng thuê phòng {signingContract?.roomNumber || '207'}
            </Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Họ và tên người ký (Bên B) *</Text>
              <TextInput
                style={styles.textInput}
                value={signatureName}
                onChangeText={setSignatureName}
                placeholder="Nhập đầy đủ họ và tên..."
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20 }}>{agreedTerms ? '☑️' : '⬜'}</Text>
              <Text style={styles.checkboxText}>
                Tôi đã đọc kỹ và hoàn toàn đồng ý với mọi điều khoản, quy định trong bản hợp đồng thuê phòng này.
              </Text>
            </TouchableOpacity>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setSigningContract(null)}
              >
                <Text style={styles.btnCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnConfirmSign, (!agreedTerms || signingLoading) && { opacity: 0.6 }]}
                onPress={handleConfirmSign}
                disabled={!agreedTerms || signingLoading}
              >
                {signingLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.btnConfirmSignText}>Xác Nhận Ký Hợp Đồng</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: XEM VĂN BẢN HỢP ĐỒNG PHÁP LÝ CHI TIẾT           */}
      {/* ======================================================== */}
      <Modal visible={!!viewingDocContract} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.docModalCard}>
            <View style={styles.docModalHeader}>
              <Text style={styles.docModalTitle}>📄 Văn Bản Hợp Đồng Thuê Phòng</Text>
              <TouchableOpacity onPress={() => setViewingDocContract(null)}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.docModalScroll}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>
                  Độc lập - Tự do - Hạnh phúc
                </Text>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>──────── • ────────</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e3a8a', marginTop: 8 }}>
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                  Số: {viewingDocContract?.contractNumber || ('#' + (viewingDocContract?._id?.slice(-8).toUpperCase() || '9EC5AE42'))}
                </Text>
              </View>

              <Text style={styles.docSectionTitle}>BÊN CHO THUÊ (BÊN A):</Text>
              <Text style={styles.docText}>• Họ tên: {viewingDocContract?.landlordName || 'Lê Văn An (Nhân viên Quản lý)'}</Text>
              <Text style={styles.docText}>• Điện thoại: {viewingDocContract?.landlordPhone || '0902345678'}</Text>
              <Text style={styles.docText}>• CCCD: {viewingDocContract?.landlordCccd || '001091002233'}</Text>

              <Text style={styles.docSectionTitle}>BÊN THUÊ PHÒNG (BÊN B):</Text>
              <Text style={styles.docText}>• Họ tên: {viewingDocContract?.tenantName || currentUser?.fullName || 'Khách thuê'}</Text>
              <Text style={styles.docText}>• Điện thoại: {viewingDocContract?.tenantPhone || currentUser?.phone || '---'}</Text>
              <Text style={styles.docText}>• Số CCCD: {viewingDocContract?.tenantCccd || viewingDocContract?.tenantIdentityNumber || currentUser?.identityNumber || '---'}</Text>

              <Text style={styles.docSectionTitle}>ĐIỀU KHOẢN HỢP ĐỒNG:</Text>
              <Text style={styles.docText}>
                1. Phòng thuê: <Text style={{ fontWeight: '700' }}>Phòng {viewingDocContract?.roomNumber || '207'}</Text>
              </Text>
              <Text style={styles.docText}>
                2. Giá thuê hàng tháng: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{Number(viewingDocContract?.rentalPrice || 0).toLocaleString('vi-VN')} VNĐ/tháng</Text>
              </Text>
              <Text style={styles.docText}>
                3. Tiền đặt cọc bảo đảm: <Text style={{ fontWeight: '700', color: '#16a34a' }}>{Number(viewingDocContract?.depositAmount || 0).toLocaleString('vi-VN')} VNĐ</Text>
              </Text>
              <Text style={styles.docText}>
                4. Thời hạn thuê: Từ ngày {viewingDocContract?.startDate ? new Date(viewingDocContract.startDate).toLocaleDateString('vi-VN') : '31/10/2026'} đến ngày {viewingDocContract?.endDate ? new Date(viewingDocContract.endDate).toLocaleDateString('vi-VN') : '30/11/2026'}.
              </Text>
              <Text style={styles.docText}>
                5. Tiền điện nước và dịch vụ tính theo chỉ số đồng hồ thực tế hàng tháng.
              </Text>

              <View style={styles.docSignatureRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>ĐẠI DIỆN BÊN A</Text>
                  <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 20 }}>
                    {viewingDocContract?.landlordSignature || '✅ Lê Văn An'}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>ĐẠI DIỆN BÊN B</Text>
                  <Text style={{ fontSize: 11, color: viewingDocContract?.tenantSignature ? '#16a34a' : '#d97706', marginTop: 20 }}>
                    {viewingDocContract?.tenantSignature ? `✅ ${viewingDocContract.tenantSignature}` : (viewingDocContract?.status === 'ACTIVE' ? '✅ Đã ký kết' : '⏳ Chưa ký xác nhận')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.btnCloseModal} onPress={() => setViewingDocContract(null)}>
              <Text style={styles.btnCloseModalText}>Đóng Văn Bản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: XEM CĂN CƯỚC CÔNG DÂN (CCCD) 2 MẶT              */}
      {/* ======================================================== */}
      <Modal visible={!!viewingCccdContract} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.cccdModalCard}>
            <View style={styles.docModalHeader}>
              <Text style={styles.docModalTitle}>🆔 Thông Tin CCCD Khách Thuê</Text>
              <TouchableOpacity onPress={() => setViewingCccdContract(null)}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.docText}>• Họ và tên: <Text style={{ fontWeight: '700' }}>{viewingCccdContract?.tenantName || currentUser?.fullName}</Text></Text>
              <Text style={styles.docText}>• Số CCCD: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{viewingCccdContract?.tenantCccd || viewingCccdContract?.tenantIdentityNumber || currentUser?.identityNumber || '012345678910'}</Text></Text>
              <Text style={styles.docText}>• Nơi cấp: Cục Cảnh sát QLHC về TTXH</Text>
              <Text style={styles.docText}>• Tình trạng cư trú: <Text style={{ color: '#16a34a', fontWeight: '700' }}>✅ Đã đăng ký tạm trú</Text></Text>

              <Text style={[styles.docSectionTitle, { marginTop: 14 }]}>Ảnh chụp thẻ CCCD:</Text>
              <View style={styles.cccdImageRow}>
                <View style={styles.cccdBox}>
                  <Text style={styles.cccdImgLabel}>Mặt trước thẻ</Text>
                  <Image
                    source={{ uri: viewingCccdContract?.tenantId?.identityCardFront || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.cccdImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.cccdBox}>
                  <Text style={styles.cccdImgLabel}>Mặt sau thẻ</Text>
                  <Image
                    source={{ uri: viewingCccdContract?.tenantId?.identityCardBack || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.cccdImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.btnCloseModal} onPress={() => setViewingCccdContract(null)}>
              <Text style={styles.btnCloseModalText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 14 },
  titleSection: { marginBottom: 12 },
  screenTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  screenSub: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  tabScroll: { maxHeight: 44, marginBottom: 12 },
  tabContent: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tabPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tabPillActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tabPillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  tabPillTextActive: { color: '#ffffff', fontWeight: '700' },
  reloadBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  reloadBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0'
  },
  contractCodeLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  roomTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  badgePill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },

  signAlertBox: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderColor: '#ffedd5',
    padding: 12,
    alignItems: 'center',
    gap: 8
  },
  signAlertIcon: { fontSize: 20 },
  signAlertText: { flex: 1, fontSize: 12, color: '#9a3412', lineHeight: 16 },

  cardBody: { padding: 14 },
  infoGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  rentPrice: { fontSize: 16, fontWeight: '800', color: '#2563eb' },
  depositPrice: { fontSize: 16, fontWeight: '800', color: '#16a34a' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailLabel: { fontSize: 12, color: '#64748b' },
  detailVal: { fontSize: 12, fontWeight: '600', color: '#1e293b', flexShrink: 1, textAlign: 'right' },

  actionBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  btnSignOnline: {
    width: '100%',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 4
  },
  btnSignOnlineText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  btnDoc: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnDocText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  btnCccd: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  btnCccdText: { color: '#334155', fontSize: 12, fontWeight: '700' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748b', fontSize: 13 },
  emptyBox: { backgroundColor: '#ffffff', padding: 30, borderRadius: 16, alignItems: 'center', marginVertical: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  btnExploreRooms: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  btnExploreRoomsText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  signModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0f172a'
  },
  checkboxRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 18 },
  checkboxText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 16 },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  btnCancelText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  btnConfirmSign: { flex: 2, backgroundColor: '#10b981', paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  btnConfirmSignText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },

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
  docModalScroll: { padding: 16 },
  docSectionTitle: { fontSize: 13, fontWeight: '800', color: '#1e3a8a', marginTop: 12, marginBottom: 4 },
  docText: { fontSize: 12.5, color: '#334155', lineHeight: 18, marginBottom: 2 },
  docSignatureRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  btnCloseModal: { backgroundColor: '#0f172a', paddingVertical: 12, alignItems: 'center' },
  btnCloseModalText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },

  cccdModalCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden'
  },
  cccdImageRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cccdBox: { flex: 1, alignItems: 'center' },
  cccdImgLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  cccdImage: { width: '100%', height: 110, borderRadius: 8, backgroundColor: '#e2e8f0' }
});
