import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { roomApi, authApi, contractApi, getInvoices, getCurrentUserStore } from '../services/api';

/**
 * Màn hình Trang chủ (HomeScreen) - Mobile App
 * Đồng bộ chuẩn 100% logic phân quyền với Web (frontend/src/screens/HomeScreen.jsx)
 * - Guest (Chưa đăng nhập): Giới thiệu khu trọ, tìm phòng, xem phòng trống, nút Đăng nhập / Đăng ký. TUYỆT ĐỐI KHÔNG hiện phòng của tôi.
 * - Tenant (Khách thuê): Hiện thẻ "PHÒNG TRỌ CỦA TÔI" nếu có hợp đồng, cảnh báo hóa đơn chưa thanh toán, lối tắt khách thuê.
 * - Staff / Manager: Bảng điều khiển quản trị vận hành, KPI phòng, duyệt yêu cầu, chốt điện nước, hóa đơn.
 */
export default function HomeScreen({ navigation, onOpenMenu, currentUser: propUser }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(propUser || getCurrentUserStore());
  const [myContract, setMyContract] = useState(null);
  const [myRoom, setMyRoom] = useState(null);
  const [unpaidInvoice, setUnpaidInvoice] = useState(null);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // 1. Tải danh sách phòng từ Backend
      const roomRes = await roomApi.getRooms();
      const allRooms = roomRes.data?.data || [];
      setRooms(allRooms);

      // 2. Tải thông tin tài khoản đang đăng nhập
      let user = propUser || getCurrentUserStore();
      try {
        const uRes = await authApi.getProfile();
        if (uRes.data?.data) {
          user = uRes.data.data;
        }
      } catch (e) {
        // Chưa đăng nhập (Guest)
        user = null;
      }
      setCurrentUser(user);

      // 3. Phân nhánh dữ liệu theo vai trò người dùng
      if (!user) {
        // Khách vãng lai: Xóa sạch dữ liệu phòng thuê
        setMyContract(null);
        setMyRoom(null);
        setUnpaidInvoice(null);
      } else if (user.role === 'TENANT') {
        // Khách thuê: Tìm CHÍNH XÁC hợp đồng của khách thuê này
        try {
          const cRes = await contractApi.getContracts();
          const allContracts = cRes.data?.data || [];

          const activeContract = allContracts.find(c => {
            const tId = c.tenantId?._id || c.tenantId;
            const matchesId = tId && user._id && tId.toString() === user._id.toString();
            const matchesPhone = user.phone && c.tenantPhone === user.phone;
            const matchesCccd = user.identityNumber && (
              c.tenantCccd === user.identityNumber || 
              c.tenantIdentityNumber === user.identityNumber
            );
            return (matchesId || matchesPhone || matchesCccd) && (c.status === 'ACTIVE' || c.status === 'PENDING');
          });

          setMyContract(activeContract || null);

          if (activeContract) {
            const rId = activeContract.roomId?._id || activeContract.roomId;
            const foundRoom = allRooms.find(r => r._id === rId || r.roomNumber === activeContract.roomNumber);
            setMyRoom(foundRoom || null);

            // Tìm hóa đơn chưa thanh toán của phòng này
            try {
              const invs = await getInvoices();
              const myInv = (invs || []).find(i => 
                (i.roomNumber === activeContract.roomNumber || i.roomId === rId) && 
                i.status === 'UNPAID'
              );
              setUnpaidInvoice(myInv || null);
            } catch (invErr) {
              setUnpaidInvoice(null);
            }
          } else {
            setMyRoom(null);
            setUnpaidInvoice(null);
          }
        } catch (cErr) {
          console.log('Lỗi tải hợp đồng khách thuê:', cErr.message);
          setMyContract(null);
          setMyRoom(null);
        }
      } else {
        // Quản lý hoặc Nhân viên: Không có phòng cá nhân
        setMyContract(null);
        setMyRoom(null);
        setUnpaidInvoice(null);
      }
    } catch (err) {
      console.log('Lỗi tải dữ liệu HomeScreen:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [propUser]);

  const availableCount = rooms.filter(r => r.status === 'AVAILABLE').length;
  const rentedCount = rooms.filter(r => r.status === 'RENTED').length;
  const maintenanceCount = rooms.filter(r => r.status === 'MAINTENANCE').length;

  const isGuest = !currentUser;
  const isTenant = currentUser && currentUser.role === 'TENANT';
  const isStaff = currentUser && currentUser.role === 'STAFF';
  const isManager = currentUser && currentUser.role === 'MANAGER';
  const isStaffOrManager = isStaff || isManager;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadAllData(); }}
          colors={['#2563eb']}
        />
      }
    >
      {/* ======================================================== */}
      {/* 1. HERO BANNER - ĐỒNG BỘ PHÂN QUYỀN VỚI WEB              */}
      {/* ======================================================== */}
      <View style={[styles.hero, isStaffOrManager && styles.heroAdmin]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroBadge}>
              {isGuest && '🌟 HỆ THỐNG NHÀ TRỌ THÔNG MINH'}
              {isTenant && `🙋 KHÁCH THUÊ • ${currentUser.fullName?.toUpperCase()}`}
              {isStaff && '🛡️ BẢNG ĐIỀU KHIỂN NHÂN VIÊN'}
              {isManager && '👑 BẢNG ĐIỀU KHIỂN CHỦ TRỌ / QUẢN LÝ'}
            </Text>
            <Text style={styles.heroTitle}>
              {isGuest && 'Motel Manager'}
              {isTenant && 'Phòng Trọ Của Tôi'}
              {isStaffOrManager && 'Trung Tâm Quản Trị'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuPill}
            onPress={() => onOpenMenu && onOpenMenu()}
            activeOpacity={0.8}
          >
            <Text style={styles.menuPillIcon}>☰</Text>
            <Text style={styles.menuPillText}>Menu</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heroSubtitle}>
          {isGuest && 'Không gian sống tiện nghi, an ninh 24/7 • Giờ giấc tự do • Tìm phòng trực tuyến'}
          {isTenant && 'Tra cứu thông tin phòng thuê, hóa đơn tiền điện nước & hợp đồng trực tuyến'}
          {isStaffOrManager && 'Theo dõi tình trạng phòng theo thời gian thực, duyệt yêu cầu & chốt điện nước'}
        </Text>

        {/* Nút hành động nhanh trong Hero cho Khách vãng lai */}
        {isGuest && (
          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={styles.heroBtnWhite}
              onPress={() => navigation.navigate('RoomList')}
            >
              <Text style={styles.heroBtnWhiteText}>🛏️ Xem danh sách phòng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroBtnOutline}
              onPress={() => navigation.navigate('RoomSearch')}
            >
              <Text style={styles.heroBtnOutlineText}>🔍 Tìm phòng trống</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroBtnGreen}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.heroBtnGreenText}>🔑 Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thống kê nhanh tình trạng phòng */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10b981' }]}>{availableCount}</Text>
            <Text style={styles.statLabel}>Còn trống</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#38bdf8' }]}>{rentedCount}</Text>
            <Text style={styles.statLabel}>Đang thuê</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#fbbf24' }]}>{maintenanceCount}</Text>
            <Text style={styles.statLabel}>Bảo trì</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. KHU VỰC DÀNH CHO KHÁCH THUÊ (TENANT)                   */}
      {/* ======================================================== */}
      {isTenant && (
        <View style={styles.sectionWrap}>
          {myContract ? (
            /* THẺ PHÒNG TRỌ CỦA TÔI NẾU ĐÃ KÝ HỢP ĐỒNG */
            <View style={styles.myRoomCard}>
              <View style={styles.myRoomCardHeader}>
                <View style={styles.myRoomBadge}>
                  <Text style={styles.myRoomBadgeText}>🏠 PHÒNG TRỌ CỦA TÔI</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>
                    {myContract.status === 'ACTIVE' ? '🟢 Đang thuê' : '🟡 ' + myContract.status}
                  </Text>
                </View>
              </View>

              <View style={styles.myRoomMainInfo}>
                <Text style={styles.myRoomNumber}>
                  Phòng {myContract.roomNumber || myRoom?.roomNumber || '---'}
                </Text>
                <Text style={styles.myRoomPrice}>
                  {(myContract.rentalPrice || myRoom?.basePrice || 0).toLocaleString('vi-VN')} đ/tháng
                </Text>
              </View>

              {myRoom && (
                <Text style={styles.myRoomSpecs}>
                  📐 {myRoom.area} m²  •  👥 Tối đa {myRoom.maxOccupants} người
                </Text>
              )}

              <View style={styles.contractMiniInfo}>
                <Text style={styles.contractLine}>
                  📄 <Text style={styles.contractBold}>Mã HĐ:</Text> {myContract.contractNumber || ('#' + (myContract._id ? myContract._id.slice(-8).toUpperCase() : '9EC5AE42'))}
                </Text>
                <Text style={styles.contractLine}>
                  📅 <Text style={styles.contractBold}>Thời hạn:</Text> {myContract.startDate ? new Date(myContract.startDate).toLocaleDateString('vi-VN') : '---'} ➔ {myContract.endDate ? new Date(myContract.endDate).toLocaleDateString('vi-VN') : '---'}
                </Text>
                <Text style={styles.contractLine}>
                  💰 <Text style={styles.contractBold}>Tiền cọc:</Text> {(myContract.depositAmount || 0).toLocaleString('vi-VN')} đ
                </Text>
              </View>

              {/* Thông báo hóa đơn dịch vụ chưa thanh toán */}
              {unpaidInvoice && (
                <View style={styles.invoiceNoticeBox}>
                  <Text style={styles.invoiceNoticeTitle}>⚡ Hóa đơn cần thanh toán:</Text>
                  <Text style={styles.invoiceNoticeAmount}>
                    {unpaidInvoice.totalAmount?.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              )}

              <View style={styles.myRoomActionRow}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => navigation.navigate('MyRoom')}
                >
                  <Text style={styles.btnPrimaryText}>🔑 Chi tiết phòng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => navigation.navigate('InvoiceList')}
                >
                  <Text style={styles.btnSecondaryText}>🧾 Hóa đơn & VNPay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* THẺ THÔNG BÁO CHƯA CÓ PHÒNG THUÊ DÀNH CHO KHÁCH MỚI */
            <View style={styles.noRoomCard}>
              <Text style={styles.noRoomIcon}>🛏️</Text>
              <Text style={styles.noRoomTitle}>Bạn chưa có phòng đang thuê</Text>
              <Text style={styles.noRoomDesc}>
                Tài khoản của bạn hiện chưa có hợp đồng thuê phòng nào có hiệu lực. Hãy khám phá danh sách phòng trống và gửi yêu cầu giữ phòng ngay hôm nay!
              </Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('RoomList')}
              >
                <Text style={styles.btnPrimaryText}>🛏️ Khám phá & Đặt phòng ngay</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lối tắt chức năng dành cho khách thuê */}
          <Text style={styles.sectionTitle}>Lối tắt khách thuê</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyRoom')}>
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={styles.actionTitle}>Phòng của tôi</Text>
              <Text style={styles.actionDesc}>Chi tiết phòng đang ở</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('InvoiceList')}>
              <Text style={styles.actionIcon}>🧾</Text>
              <Text style={styles.actionTitle}>Hóa đơn & VNPay</Text>
              <Text style={styles.actionDesc}>Điện nước & thanh toán</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ContractList')}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionTitle}>Hợp đồng</Text>
              <Text style={styles.actionDesc}>Hợp đồng đã ký kết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyRentalRequests')}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>Yêu cầu thuê</Text>
              <Text style={styles.actionDesc}>Theo dõi trạng thái</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RoomSearch')}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Tìm phòng mới</Text>
              <Text style={styles.actionDesc}>Lọc giá & tiện ích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionTitle}>Hồ sơ cá nhân</Text>
              <Text style={styles.actionDesc}>CCCD & thông tin</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 3. KHU VỰC DÀNH CHO KHÁCH VÃNG LAI (GUEST - CHƯA ĐĂNG NHẬP) */}
      {/* ======================================================== */}
      {isGuest && (
        <View style={styles.sectionWrap}>
          {/* Banner giới thiệu & kêu gọi hành động */}
          <View style={styles.guestPromoCard}>
            <View style={styles.guestPromoHeader}>
              <Text style={styles.guestPromoIcon}>🏠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.guestPromoTitle}>Tìm Kiếm Phòng Trọ Ưng Ý</Text>
                <Text style={styles.guestPromoSub}>Tiện nghi đầy đủ • Camera 24/7 • Giờ giấc tự do</Text>
              </View>
            </View>
            <Text style={styles.guestPromoDesc}>
              Hệ thống phòng trọ cao cấp với khóa cửa vân tay, điều hòa inverter, gác lửng và ban công thoáng mát. Hãy đăng nhập hoặc đăng ký tài khoản để gửi yêu cầu đặt phòng nhanh chóng!
            </Text>
            <View style={styles.guestPromoBtnRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate('RoomList')}
              >
                <Text style={styles.btnPrimaryText}>🛏️ Xem danh sách phòng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.btnSecondaryText}>🔑 Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lối tắt khám phá */}
          <Text style={styles.sectionTitle}>Khám phá hệ thống</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RoomList')}>
              <Text style={styles.actionIcon}>🛏️</Text>
              <Text style={styles.actionTitle}>Danh sách phòng</Text>
              <Text style={styles.actionDesc}>Xem chi tiết các phòng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RoomSearch')}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Tìm phòng trống</Text>
              <Text style={styles.actionDesc}>Lọc theo giá & diện tích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={styles.actionTitle}>Đăng nhập</Text>
              <Text style={styles.actionDesc}>Truy cập tài khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionTitle}>Đăng ký</Text>
              <Text style={styles.actionDesc}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. KHU VỰC DÀNH CHO NHÂN VIÊN & CHỦ TRỌ (STAFF / MANAGER)  */}
      {/* ======================================================== */}
      {isStaffOrManager && (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Nghiệp vụ quản trị & vận hành</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ManageRoom')}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Quản lý phòng</Text>
              <Text style={styles.actionDesc}>Thêm, sửa, đổi giá</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('RequestManagement')}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>Duyệt yêu cầu</Text>
              <Text style={styles.actionDesc}>Duyệt yêu cầu đặt phòng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ManageContract')}>
              <Text style={styles.actionIcon}>✍️</Text>
              <Text style={styles.actionTitle}>Lập hợp đồng</Text>
              <Text style={styles.actionDesc}>Ký hợp đồng thuê mới</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Utility')}>
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={styles.actionTitle}>Điện & Nước</Text>
              <Text style={styles.actionDesc}>Ghi chỉ số hàng tháng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('InvoiceList')}>
              <Text style={styles.actionIcon}>🧾</Text>
              <Text style={styles.actionTitle}>Hóa đơn & VNPay</Text>
              <Text style={styles.actionDesc}>Lập & thu tiền trọ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('TenantManagement')}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Khách thuê & CCCD</Text>
              <Text style={styles.actionDesc}>Khai báo tạm trú</Text>
            </TouchableOpacity>

            {isManager && (
              <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('StaffManagement')}>
                <Text style={styles.actionIcon}>🛡️</Text>
                <Text style={styles.actionTitle}>Quản lý nhân viên</Text>
                <Text style={styles.actionDesc}>Phân quyền nhân sự</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionTitle}>Hồ sơ cá nhân</Text>
              <Text style={styles.actionDesc}>Thông tin tài khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* 5. DANH SÁCH PHÒNG TRỐNG NỔI BẬT                         */}
      {/* ======================================================== */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phòng trống hiện có</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoomList')}>
            <Text style={styles.linkText}>Xem tất cả ({rooms.length}) →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />
        ) : (
          rooms.filter(r => r.status === 'AVAILABLE').slice(0, 4).map((room) => (
            <TouchableOpacity
              key={room._id}
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomDetail', { roomId: room._id })}
              activeOpacity={0.7}
            >
              <View style={styles.roomHeader}>
                <Text style={styles.roomName}>Phòng {room.roomNumber}</Text>
                <Text style={styles.roomPrice}>{(room.basePrice || 0).toLocaleString('vi-VN')} đ/tháng</Text>
              </View>
              <Text style={styles.roomDetails}>
                📐 {room.area}m²  •  👥 Tối đa {room.maxOccupants} người  •  Tầng {room.floor || 1}
              </Text>
              <View style={styles.amenitiesRow}>
                {(room.amenities || []).slice(0, 3).map((a, idx) => (
                  <Text key={idx} style={styles.amenityTag}>{a}</Text>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 40 },

  // Hero Banner
  hero: {
    backgroundColor: '#0f172a',
    padding: 18,
    paddingTop: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroAdmin: {
    backgroundColor: '#090d16',
    borderBottomColor: '#2563eb',
    borderBottomWidth: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  heroBadge: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3
  },
  menuPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  menuPillIcon: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  menuPillText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 18
  },

  // Hero Actions for Guest
  heroActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  heroBtnWhite: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  heroBtnWhiteText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  heroBtnOutline: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBtnOutlineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroBtnGreen: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  heroBtnGreenText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '600' },

  // Section wrap
  sectionWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },

  // Guest Promo Card
  guestPromoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestPromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  guestPromoIcon: {
    fontSize: 28,
  },
  guestPromoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  guestPromoSub: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 2,
  },
  guestPromoDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  guestPromoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // My Room Card (Tenant)
  myRoomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  myRoomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myRoomBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  myRoomBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  myRoomMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRoomNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  myRoomPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563eb',
  },
  myRoomSpecs: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 10,
  },
  contractMiniInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  contractLine: {
    fontSize: 12,
    color: '#475569',
  },
  contractBold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  invoiceNoticeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  invoiceNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  invoiceNoticeAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b45309',
  },
  myRoomActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btnSecondaryText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },

  // No Room Card
  noRoomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  noRoomIcon: { fontSize: 36, marginBottom: 8 },
  noRoomTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  noRoomDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  actionDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },

  // Room Card
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  roomPrice: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  roomDetails: { fontSize: 12, color: '#64748b', marginTop: 4 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  amenityTag: {
    fontSize: 11,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
