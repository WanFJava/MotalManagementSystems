import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { authApi, setAuthToken } from '../services/api';

export default function ProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(route?.params?.currentUser || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [identityIssuedDate, setIdentityIssuedDate] = useState('');
  const [identityIssuedPlace, setIdentityIssuedPlace] = useState('');
  const [identityCardFront, setIdentityCardFront] = useState('');
  const [identityCardBack, setIdentityCardBack] = useState('');
  const [hometown, setHometown] = useState('');
  const [gender, setGender] = useState('MALE');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getProfile();
      if (res.data && res.data.success) {
        const u = res.data.data;
        setUser(u);
        populateForm(u);
      }
    } catch (err) {
      console.log('Không thể lấy profile qua token:', err.message);
      if (route?.params?.currentUser) {
        populateForm(route.params.currentUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (u) => {
    setFullName(u.fullName || '');
    setPhone(u.phone || '');
    setEmail(u.email || '');
    setAddress(u.address || u.currentAddress || '');
    setIdentityNumber(u.identityNumber || '');
    setIdentityIssuedDate(u.identityIssuedDate ? u.identityIssuedDate.substring(0, 10) : '');
    setIdentityIssuedPlace(u.identityIssuedPlace || '');
    setIdentityCardFront(u.identityCardFront || '');
    setIdentityCardBack(u.identityCardBack || '');
    setHometown(u.hometown || '');
    setGender(u.gender || 'MALE');
  };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Họ tên, số điện thoại và email không được bỏ trống!');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        identityNumber: identityNumber.trim(),
        identityIssuedDate: identityIssuedDate || undefined,
        identityIssuedPlace: identityIssuedPlace.trim(),
        identityCardFront: identityCardFront.trim(),
        identityCardBack: identityCardBack.trim(),
        hometown: hometown.trim(),
        gender
      };

      if (password.length >= 6) {
        payload.password = password;
      }

      const res = await authApi.updateProfile(payload);
      if (res.data && res.data.success) {
        setUser(res.data.data);
        populateForm(res.data.data);
        setIsEditing(false);
        setPassword('');
        Alert.alert('Thành công', 'Hồ sơ cá nhân đã được cập nhật thành công!');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Cập nhật hồ sơ thất bại!';
      Alert.alert('Lỗi cập nhật', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setAuthToken(null);
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  if (loading && !user) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Đang tải hồ sơ cá nhân...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card Header */}
        <View style={styles.profileHeaderCard}>
          <Image
            source={{
              uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'
            }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Người Dùng'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, user?.role === 'MANAGER' ? styles.mgrBg : user?.role === 'STAFF' ? styles.stfBg : styles.tntBg]}>
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'MANAGER' ? '👑 CHỦ TRỌ' : user?.role === 'STAFF' ? '👔 NHÂN VIÊN' : '👤 KHÁCH THUÊ'}
                </Text>
              </View>
              <View style={[styles.statusBadge, user?.isActive !== false ? styles.activeBg : styles.lockedBg]}>
                <Text style={styles.statusBadgeText}>
                  {user?.isActive !== false ? '● Hoạt động' : '🔒 Đã khóa'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Toggle Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, !isEditing && styles.actionBtnActive]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={[styles.actionBtnText, !isEditing && styles.actionBtnTextActive]}>
              👁️ Xem hồ sơ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, isEditing && styles.actionBtnActive]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={[styles.actionBtnText, isEditing && styles.actionBtnTextActive]}>
              ✏️ Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Note Box - Ý nghĩa nghiệp vụ thực tế */}
        <View style={styles.businessNoteBox}>
          <Text style={styles.businessNoteTitle}>📋 Ý nghĩa nghiệp vụ thực tế của ProfileScreen:</Text>
          <Text style={styles.businessNoteDesc}>
            1. <Text style={styles.boldText}>Định danh pháp lý:</Text> Cập nhật CCCD 12 số, ngày cấp, nơi cấp, địa chỉ & ảnh 2 mặt để Chủ trọ khai báo tạm trú Công an theo Luật Cư trú.{'\n'}
            2. <Text style={styles.boldText}>Liên lạc & Bảo mật:</Text> Cập nhật SĐT/Email nhận hóa đơn tiền phòng; Đổi mật khẩu tài khoản.{'\n'}
            3. <Text style={styles.boldText}>Tự động điền (Auto-fill):</Text> Khi sang phân hệ gửi Yêu cầu thuê phòng, hệ thống tự động điền thông tin từ Profile sang.
          </Text>
        </View>

        {/* Content Box */}
        <View style={styles.infoCard}>
          {!isEditing ? (
            /* VIEW MODE */
            <View style={styles.viewSection}>
              <InfoRow label="Số điện thoại" value={user?.phone} icon="📞" />
              <InfoRow label="Email" value={user?.email} icon="✉️" />
              <InfoRow label="Số CCCD / Hộ chiếu" value={user?.identityNumber || 'Chưa cập nhật'} icon="🪪" highlight />
              <InfoRow label="Ngày cấp CCCD" value={user?.identityIssuedDate ? user.identityIssuedDate.substring(0, 10) : 'Chưa cập nhật'} icon="📅" />
              <InfoRow label="Nơi cấp CCCD" value={user?.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH'} icon="🏛️" />
              <InfoRow label="Địa chỉ cư trú" value={user?.address || user?.currentAddress || 'Chưa cập nhật'} icon="📍" />
              <InfoRow label="Quê quán" value={user?.hometown || 'Chưa cập nhật'} icon="🏡" />
              <InfoRow label="Giới tính" value={user?.gender === 'FEMALE' ? 'Nữ' : 'Nam'} icon="⚧" />
              <InfoRow
                label="Tình trạng tạm trú"
                value={
                  user?.temporaryResidenceStatus === 'REGISTERED'
                    ? '✅ Đã đăng ký tạm trú'
                    : user?.temporaryResidenceStatus === 'PENDING'
                    ? '⏳ Đang chờ duyệt'
                    : '❌ Chưa đăng ký'
                }
                icon="📋"
              />
              {user?.currentRoom ? (
                <InfoRow
                  label="Phòng đang thuê"
                  value={user.currentRoom.roomNumber ? `Phòng ${user.currentRoom.roomNumber}` : 'Có phòng'}
                  icon="🚪"
                />
              ) : null}

              {/* Ảnh 2 mặt thẻ CCCD phục vụ khai báo tạm trú */}
              <View style={styles.cccdPhotosContainer}>
                <Text style={styles.cccdPhotosTitle}>🪪 Ảnh chụp 2 mặt thẻ CCCD (Khai báo tạm trú Công an):</Text>
                <View style={styles.cccdImagesRow}>
                  <View style={styles.cccdImageCol}>
                    <Text style={styles.cccdSubLabel}>Mặt trước</Text>
                    {user?.identityCardFront ? (
                      <Image source={{ uri: user.identityCardFront }} style={styles.cccdThumb} />
                    ) : (
                      <View style={styles.cccdPlaceholder}>
                        <Text style={styles.placeholderIcon}>📷</Text>
                        <Text style={styles.placeholderText}>Chưa có ảnh</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cccdImageCol}>
                    <Text style={styles.cccdSubLabel}>Mặt sau</Text>
                    {user?.identityCardBack ? (
                      <Image source={{ uri: user.identityCardBack }} style={styles.cccdThumb} />
                    ) : (
                      <View style={styles.cccdPlaceholder}>
                        <Text style={styles.placeholderIcon}>📷</Text>
                        <Text style={styles.placeholderText}>Chưa có ảnh</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* EDIT MODE */
            <View style={styles.editSection}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên</Text>
                <TextInput
                  style={styles.formInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.formInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Nhập số điện thoại"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="Nhập email"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số CCCD (12 chữ số)</Text>
                <TextInput
                  style={styles.formInput}
                  value={identityNumber}
                  onChangeText={setIdentityNumber}
                  keyboardType="numeric"
                  placeholder="VD: 001202888999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày cấp CCCD (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={identityIssuedDate}
                  onChangeText={setIdentityIssuedDate}
                  placeholder="VD: 2022-06-15"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nơi cấp CCCD</Text>
                <TextInput
                  style={styles.formInput}
                  value={identityIssuedPlace}
                  onChangeText={setIdentityIssuedPlace}
                  placeholder="VD: Cục Cảnh sát QLHC về TTXH"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Link ảnh mặt trước CCCD</Text>
                <TextInput
                  style={styles.formInput}
                  value={identityCardFront}
                  onChangeText={setIdentityCardFront}
                  placeholder="https://... hoặc link ảnh mặt trước"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Link ảnh mặt sau CCCD</Text>
                <TextInput
                  style={styles.formInput}
                  value={identityCardBack}
                  onChangeText={setIdentityCardBack}
                  placeholder="https://... hoặc link ảnh mặt sau"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ thường trú / Hiện tại (Address)</Text>
                <TextInput
                  style={styles.formInput}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="VD: Số 99 Xuân Thủy, Cầu Giấy, Hà Nội"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quê quán (Hometown)</Text>
                <TextInput
                  style={styles.formInput}
                  value={hometown}
                  onChangeText={setHometown}
                  placeholder="VD: Nam Định"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mật khẩu mới (Bỏ trống nếu không đổi)</Text>
                <TextInput
                  style={styles.formInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Tối thiểu 6 ký tự"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>LƯU THAY ĐỔI HỒ SƠ</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Đăng xuất khỏi tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ label, value, icon, highlight }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  headerInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mgrBg: { backgroundColor: '#fef3c7' },
  stfBg: { backgroundColor: '#e0e7ff' },
  tntBg: { backgroundColor: '#dcfce7' },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBg: { backgroundColor: '#f0fdf4' },
  lockedBg: { backgroundColor: '#fee2e2' },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  actionBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  actionBtnTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  viewSection: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
    maxWidth: '55%',
  },
  rowHighlight: {
    color: '#2563eb',
    fontWeight: '700',
  },
  editSection: {},
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  businessNoteBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  businessNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  businessNoteDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: '#1e293b',
  },
  cccdPhotosContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cccdPhotosTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  cccdImagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cccdImageCol: {
    flex: 1,
    alignItems: 'center',
  },
  cccdSubLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  cccdThumb: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  cccdPlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
