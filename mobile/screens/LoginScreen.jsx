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
import { authApi, setAuthToken } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập số điện thoại / email và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({
        identifier: identifier.trim(),
        password: password
      });

      if (res.data && res.data.success) {
        const { token, user } = res.data.data;
        setAuthToken(token);
        
        Alert.alert(
          'Đăng nhập thành công',
          `Xin chào, ${user.fullName} (${user.role})!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (user.role === 'MANAGER' || user.role === 'STAFF') {
                  navigation.navigate('TenantManagement', { currentUser: user });
                } else {
                  navigation.navigate('Profile', { currentUser: user });
                }
              }
            }
          ]
        );
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Nút điền nhanh tài khoản mẫu để test tiện lợi
  const fillQuickAccount = (phone, pass) => {
    setIdentifier(phone);
    setPassword(pass);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🏠</Text>
          </View>
          <Text style={styles.title}>Quản Lý Nhà Trọ</Text>
          <Text style={styles.subtitle}>Đăng nhập phân hệ Xác thực & Khách thuê (UC01)</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Đăng Nhập Tài Khoản</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại hoặc Email</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0912345678 hoặc email@domain.com"
              placeholderTextColor="#9ca3af"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginBtnText}>ĐĂNG NHẬP NGAY</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>Chưa có tài khoản khách thuê? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Fast Login Helper */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>⚡ Điền nhanh tài khoản kiểm thử:</Text>
          <View style={styles.demoBtnsRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0901234567', '123456')}
            >
              <Text style={styles.demoBtnText}>👑 Chủ trọ (Manager)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0987654321', '123456')}
            >
              <Text style={styles.demoBtnText}>👔 Nhân viên (Staff)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => fillQuickAccount('0912345678', '123456')}
            >
              <Text style={styles.demoBtnText}>👤 Khách thuê (Tenant)</Text>
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
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  promptText: {
    fontSize: 13,
    color: '#64748b',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  demoBox: {
    marginTop: 20,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3730a3',
    marginBottom: 8,
  },
  demoBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5b4fc',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338ca',
  },
});
