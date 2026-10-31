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

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('TENANT');
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
        role
      });

      if (res.data && res.data.success) {
        Alert.alert(
          'Đăng ký thành công 🎉',
          `Tài khoản "${fullName}" đã được tạo thành công! Hãy đăng nhập để bắt đầu trải nghiệm.`,
          [
            {
              text: 'Đến Đăng Nhập',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng ký tài khoản thất bại!';
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tạo Tài Khoản Mới</Text>
          <Text style={styles.subtitle}>Phân hệ Xác thực & Khách thuê (UC01 / TC_USER_01)</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
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

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: user@motel.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Vai trò */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vai trò người dùng</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'TENANT' && styles.roleBtnActive]}
                onPress={() => setRole('TENANT')}
              >
                <Text style={[styles.roleBtnText, role === 'TENANT' && styles.roleBtnTextActive]}>
                  👤 Khách thuê trọ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'MANAGER' && styles.roleBtnActive]}
                onPress={() => setRole('MANAGER')}
              >
                <Text style={[styles.roleBtnText, role === 'MANAGER' && styles.roleBtnTextActive]}>
                  👑 Quản lý / Chủ trọ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Nhập lại mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại chính xác mật khẩu"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>HOÀN TẤT ĐĂNG KÝ</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  req: {
    color: '#ef4444',
  },
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
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  roleBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  roleBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  roleBtnTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    backgroundColor: '#86efac',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  promptText: {
    fontSize: 13,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
});
