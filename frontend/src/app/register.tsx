import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS = [
  { id: 'fat-loss', title: 'ลดไขมัน' },
  { id: 'maintenance', title: 'รักษาน้ำหนัก' },
  { id: 'muscle-gain', title: 'เพิ่มกล้ามเนื้อ' },
];

export default function RegisterScreen() {
  const router = useRouter();

  // บัญชีผู้ใช้
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ข้อมูลร่างกายเริ่มต้น
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('maintenance');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // คำนวณสารอาหารเบื้องต้นตามส่วนสูงน้ำหนักในฝั่ง Client ก่อนส่ง
  const calculateInitialProfileData = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return null;

    const heightInMeters = h / 100;
    const bmi = parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));

    // คำนวณ BMR (สูตร Mifflin-St Jeor)
    let bmr = 0;
    if (gender === 'male') {
      bmr = Math.round(10 * w + 6.25 * h - 5 * a + 5);
    } else {
      bmr = Math.round(10 * w + 6.25 * h - 5 * a - 161);
    }

    // คำนวณ TDEE (สมมติออกกำลังกายปานกลาง 1.375)
    const tdee = Math.round(bmr * 1.375);

    // คำนวณเป้าหมายแคลอรีตามเป้าหมายหลัก
    let targetCalories = tdee;
    if (goal === 'fat-loss') targetCalories = Math.round(tdee - 400);
    else if (goal === 'muscle-gain') targetCalories = Math.round(tdee + 300);

    // อัตราส่วนสารอาหารจำลอง
    const protein = Math.round(w * 2); // 2g ต่อ นน.ตัว 1kg
    const fat = Math.round((targetCalories * 0.25) / 9); // ไขมัน 25% ของพลังงาน
    const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4); // คาร์บส่วนที่เหลือ

    return {
      name: name.trim(),
      gender,
      weight: w,
      height: h,
      age: a,
      activity: '1.375',
      goal,
      bmi,
      bmr,
      tdee,
      targetCalories,
      protein,
      carbs,
      fat,
    };
  };

  const handleRegister = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อหรือนามแฝงสำหรับตารางจัดอันดับ');
      return;
    }

    if (!email || !password || !confirmPassword) {
      setErrorMsg('กรุณากรอกข้อมูลบัญชีให้ครบถ้วน');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const initialProfile = calculateInitialProfileData();
    if (!initialProfile) {
      setErrorMsg('กรุณากรอกข้อมูลร่างกาย (น้ำหนัก, ส่วนสูง, อายุ) ให้ครบถ้วนถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          profile: initialProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'การลงทะเบียนสมาชิกล้มเหลว');
      }

      // บันทึกโทเค็นล็อกอินอัตโนมัติหลังสมัครเสร็จ
      await AsyncStorage.setItem('@aura_session_token', data.token);
      await AsyncStorage.setItem('@aura_user_email', data.user.email);
      await AsyncStorage.setItem('@aura_user_id', data.user.id);
      
      // บันทึกโปรไฟล์ลงเครื่องด้วย
      await AsyncStorage.setItem('aura_user_profile', JSON.stringify(initialProfile));

      alert('สมัครสมาชิกสำเร็จเรียบร้อยแล้ว!');
      router.replace('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถลงทะเบียนได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGradient}>
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.glassCard}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🌱 AuraHealth</Text>
                <Text style={styles.logoSubtitle}>สร้างบัญชีของคุณเพื่อคำนวณแผนสุขภาพเฉพาะตัว</Text>
              </View>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                </View>
              ) : null}

              {/* ส่วนบัญชีผู้ใช้ */}
              <Text style={styles.sectionTitle}>🔑 ข้อมูลบัญชีผู้ใช้</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อ / นามแฝง (แสดงในตารางคะแนน)</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="เช่น คุณอาร์ม (Arm)"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>อีเมล</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="ตั้งรหัสผ่านของคุณ"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* ส่วนสัดส่วนร่างกาย */}
              <View style={styles.separator} />
              <Text style={styles.sectionTitle}>⚖️ สัดส่วนร่างกายเริ่มต้น</Text>

              <View style={styles.genderRow}>
                <Pressable
                  style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                    👨 เพศชาย
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                    👩 เพศหญิง
                  </Text>
                </Pressable>
              </View>

              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.label}>น้ำหนัก (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="เช่น 70"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.label}>ส่วนสูง (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="เช่น 170"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.label}>อายุ (ปี)</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="เช่น 25"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ส่วนเป้าหมายหลัก */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>🎯 เป้าหมายหลักของคุณ</Text>
                <View style={styles.goalsRow}>
                  {GOALS.map((g) => {
                    const isSelected = goal === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        style={[styles.goalBtn, isSelected && styles.goalBtnActive]}
                        onPress={() => setGoal(g.id)}
                      >
                        <Text style={[styles.goalBtnText, isSelected && styles.goalBtnTextActive]}>
                          {g.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.registerBtnText}>ลงทะเบียนและเข้าใช้งาน</Text>
                )}
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>เป็นสมาชิกอยู่แล้ว?</Text>
                <Pressable onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    top: -50,
    right: -50,
  },
  bubble2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    bottom: -80,
    left: -80,
  },
  keyboardView: {
    width: '100%',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    width: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      },
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3B82F6',
  },
  logoSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B82F6',
    marginTop: 10,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 13,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  } as any,
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  genderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  genderTextActive: {
    color: '#3B82F6',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
    gap: 6,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  goalBtn: {
    flex: 1,
    minWidth: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  goalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  goalBtnTextActive: {
    color: '#10B981',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  registerBtnDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    shadowOpacity: 0,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  loginLink: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
});
