import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { authApi } from '../services/api';

/**
 * Màn hình Đăng Ký Tài Khoản Khách Thuê (RegisterScreen)
 * Đồng bộ chuẩn 100% với Web (frontend/src/screens/AuthScreen.jsx)
 * - Tab Switch trên cùng: [ 🔑 Đăng Nhập ] | [ 📝 Đăng Ký Khách Thuê ]
 * - Các trường: Họ và tên, SĐT, Email, Mật khẩu, Xác nhận mật khẩu
 * - Box lưu ý phân quyền mặc định là Khách thuê (Tenant)
 * - Nút submit xanh lá [#10b981]: "📝 Hoàn Tất Đăng Ký"
 */
export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      setError('Số điện thoại phải bao gồm từ 9 đến 11 chữ số!');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Định dạng địa chỉ Email không hợp lệ!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu tối thiểu phải từ 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp với mật khẩu đã nhập!');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        role: 'TENANT' // Tài khoản đăng ký qua cổng người dùng luôn là Khách thuê
      });

      if (res.data && res.data.success) {
        Alert.alert(
          'Đăng ký thành công 🎉',
          `Tài khoản "${fullName}" đã được tạo thành công! Bạn có thể đăng nhập ngay.`,
          [
            {
              text: 'Đến Đăng Nhập Ngay',
              onPress: () => navigation.navigate('Login', { fillPhone: phone.trim(), fillPass: password })
            }
          ]
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại!';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Switch Tabs Đồng bộ chuẩn Web */}
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.tabBtnText}>🔑 Đăng Nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>
              📝 Đăng Ký Khách Thuê
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tạo Tài Khoản Khách Thuê Mới</Text>
          <Text style={styles.cardSubtitle}>
            Đăng ký tài khoản để tìm phòng, đặt thuê phòng và thanh toán hóa đơn trực tuyến
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Họ và tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Nguyễn Văn An"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Số điện thoại */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0912345678"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Địa chỉ Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: email@domain.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Xác nhận Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại chính xác mật khẩu..."
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Box ghi chú phân quyền mặc định giống Web */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              ℹ️ Tài khoản đăng ký tại đây sẽ có vai trò là <Text style={{ fontWeight: '800' }}>Khách thuê (Tenant)</Text>. Nếu bạn là nhân viên vận hành, vui lòng liên hệ Chủ trọ (Manager) để được cấp tài khoản.
            </Text>
          </View>

          {/* Nút Đăng ký xanh lá chuẩn Web */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>📝 Hoàn Tất Đăng Ký</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  req: { color: '#dc2626' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  infoBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  promptText: { fontSize: 13, color: '#64748b' },
  loginLink: { fontSize: 13, color: '#2563eb', fontWeight: '800' },
});
