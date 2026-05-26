import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';

interface ProfileData {
  gender: 'male' | 'female';
  weight: number;
  height: number;
  age: number;
  activity: string;
  goal: string;
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface HealthCalculatorProps {
  onSaveProfile: (profile: ProfileData) => void;
  savedProfile: ProfileData | null;
}

const ACTIVITIES = [
  { id: 'sedentary', label: '🚶 ออกกำลังกายน้อยมาก (นั่งทำงานตลอดวัน)' },
  { id: 'light', label: '🏃 ออกกำลังกายเบาๆ (1-3 วัน/สัปดาห์)' },
  { id: 'moderate', label: '🏋️ ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)' },
  { id: 'heavy', label: '🚴 ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)' },
  { id: 'extreme', label: '🔥 ออกกำลังกายหนักมาก (นักกีฬา/งานใช้แรงงานเยอะ)' },
];

const GOALS = [
  { id: 'fat-loss', title: 'ลดไขมัน (Fat Loss)', desc: 'เน้นควบคุมพลังงานเพื่อกระตุ้นการเผาผลาญไขมันสะสม (-15% แคลอรี)' },
  { id: 'maintenance', title: 'รักษาน้ำหนัก (Maintenance)', desc: 'รักษาสมดุลแคลอรีตามอัตราการใช้พลังงานเพื่อสุขภาพโดยรวม' },
  { id: 'muscle-gain', title: 'สร้างกล้ามเนื้อ (Muscle Gain)', desc: 'เพิ่มพลังงานและโปรตีนเพื่อซ่อมแซมและเสริมสร้างขนาดกล้ามเนื้อ (+15% แคลอรี)' },
];

export default function HealthCalculator({ onSaveProfile, savedProfile }: HealthCalculatorProps) {
  const [gender, setGender] = useState<'male' | 'female'>(savedProfile?.gender || 'male');
  const [weight, setWeight] = useState(savedProfile?.weight ? String(savedProfile.weight) : '');
  const [height, setHeight] = useState(savedProfile?.height ? String(savedProfile.height) : '');
  const [age, setAge] = useState(savedProfile?.age ? String(savedProfile.age) : '');
  const [activity, setActivity] = useState(savedProfile?.activity || 'light');
  const [goal, setGoal] = useState(savedProfile?.goal || 'fat-loss');

  // สำหรับการทำ Dropdown แบบกำหนดเอง
  const [showActivityMenu, setShowActivityMenu] = useState(false);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (!w || !h || !a || isNaN(w) || isNaN(h) || isNaN(a)) {
      alert('กรุณากรอกข้อมูลส่วนตัวในกล่องข้อความให้ครบถ้วนและถูกต้องครับ');
      return;
    }

    // 1. คำนวณ BMI
    const bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));

    // 2. คำนวณ BMR (Mifflin-St Jeor)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    bmr = Math.round(bmr);

    // 3. คำนวณ TDEE ตามกิจกรรม
    let multiplier = 1.2;
    switch (activity) {
      case 'sedentary': multiplier = 1.2; break;
      case 'light': multiplier = 1.375; break;
      case 'moderate': multiplier = 1.55; break;
      case 'heavy': multiplier = 1.725; break;
      case 'extreme': multiplier = 1.9; break;
    }
    const tdee = Math.round(bmr * multiplier);

    // 4. เป้าหมายพลังงานประจำวันตามเป้าหมายสุขภาพ
    let targetCalories = tdee;
    if (goal === 'fat-loss') {
      targetCalories = Math.round(tdee * 0.85); // คุมพลังงานลดลง 15%
    } else if (goal === 'muscle-gain') {
      targetCalories = Math.round(tdee * 1.15); // เพิ่ม 15%
    }

    // 5. สัดส่วน Macronutrients
    let pRatio = 0.3, cRatio = 0.4, fRatio = 0.3;
    if (goal === 'fat-loss') {
      pRatio = 0.35; cRatio = 0.35; fRatio = 0.30;
    } else if (goal === 'muscle-gain') {
      pRatio = 0.30; cRatio = 0.50; fRatio = 0.20;
    }

    const protein = Math.round((targetCalories * pRatio) / 4);
    const carbs = Math.round((targetCalories * cRatio) / 4);
    const fat = Math.round((targetCalories * fRatio) / 9);

    onSaveProfile({
      gender,
      weight: w,
      height: h,
      age: a,
      activity,
      goal,
      bmi,
      bmr,
      tdee,
      targetCalories,
      protein,
      carbs,
      fat,
    });
  };

  const getBMICategory = (val: number) => {
    if (val < 18.5) {
      return { label: 'น้ำหนักน้อย / ต่ำกว่าเกณฑ์', color: '#3B82F6', bgColor: '#EFF6FF' };
    }
    if (val < 23.0) {
      return { label: 'น้ำหนักปกติ / สุขภาพดี', color: '#10B981', bgColor: '#ECFDF5' };
    }
    if (val < 25.0) {
      return { label: 'น้ำหนักเกิน (ท้วม)', color: '#F59E0B', bgColor: '#FFF7ED' };
    }
    return { label: 'ภาวะอ้วนสะสม / แนะนำคุมอาหาร', color: '#EF4444', bgColor: '#FEF2F2' };
  };

  const bmiInfo = savedProfile ? getBMICategory(savedProfile.bmi) : null;
  const selectedActivityObj = ACTIVITIES.find(act => act.id === activity);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📐 คำนวณร่างกายส่วนบุคคล</Text>
        <Text style={styles.cardDesc}>คำนวณ BMI, BMR และ TDEE เพื่อวางแผนควบคุมแคลอรีที่ถูกต้อง</Text>

        {/* เลือกเพศ */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>เพศ</Text>
          <View style={styles.btnGroup}>
            <Pressable
              style={[styles.btnChoice, gender === 'male' && styles.btnChoiceActive]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.btnChoiceText, gender === 'male' && styles.btnChoiceTextActive]}>ชาย</Text>
            </Pressable>
            <Pressable
              style={[styles.btnChoice, gender === 'female' && styles.btnChoiceActive]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.btnChoiceText, gender === 'female' && styles.btnChoiceTextActive]}>หญิง</Text>
            </Pressable>
          </View>
        </View>

        {/* น้ำหนัก ส่วนสูง อายุ */}
        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.label}>น้ำหนัก (กก.)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="เช่น 70"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.label}>ส่วนสูง (ซม.)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="เช่น 175"
              value={height}
              onChangeText={setHeight}
            />
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.label}>อายุ (ปี)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="เช่น 25"
              value={age}
              onChangeText={setAge}
            />
          </View>
        </View>

        {/* ระดับกิจกรรม Dropdown */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>ระดับกิจกรรมประจำวัน</Text>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setShowActivityMenu(!showActivityMenu)}
          >
            <Text style={styles.dropdownTriggerText}>
              {selectedActivityObj ? selectedActivityObj.label : 'เลือกกิจกรรม'}
            </Text>
            <Text style={styles.dropdownArrow}>{showActivityMenu ? '▲' : '▼'}</Text>
          </Pressable>

          {showActivityMenu && (
            <View style={styles.dropdownMenu}>
              {ACTIVITIES.map((act) => (
                <Pressable
                  key={act.id}
                  style={[styles.dropdownItem, activity === act.id && styles.dropdownItemActive]}
                  onPress={() => {
                    setActivity(act.id);
                    setShowActivityMenu(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, activity === act.id && styles.dropdownItemTextActive]}>
                    {act.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* เป้าหมายสุขภาพ */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>เป้าหมายสุขภาพ</Text>
          <View style={styles.optionsList}>
            {GOALS.map((item) => {
              const isActive = goal === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.optionCard, isActive && styles.optionCardActive]}
                  onPress={() => setGoal(item.id)}
                >
                  <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isActive && styles.optionTitleActive]}>
                      {item.title}
                    </Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ปุ่มประมวลผล */}
        <Pressable style={styles.submitBtn} onPress={handleCalculate}>
          <Text style={styles.submitBtnText}>ประมวลผลแผนสุขภาพ</Text>
        </Pressable>
      </View>

      {/* ผลลัพธ์ */}
      {savedProfile && (
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultHeader}>✨ ผลลัพธ์การวิเคราะห์ร่างกาย</Text>

          <View style={styles.resultGrid}>
            <View style={styles.resultItemHighlight}>
              <Text style={styles.resultLabelHighlight}>แคลอรีที่แนะนำต่อวัน</Text>
              <Text style={styles.resultValueHighlight}>
                {savedProfile.targetCalories} <Text style={styles.unitHighlight}>kcal</Text>
              </Text>
              <Text style={styles.resultDescHighlight}>
                {savedProfile.goal === 'fat-loss'
                  ? 'ควบคุมแคลอรีเชิงรุกเพื่อการสลายไขมันสะสม'
                  : savedProfile.goal === 'muscle-gain'
                  ? 'เพิ่มโภชนาการเพื่อสนับสนุนการเติบโตของกล้ามเนื้อ'
                  : 'รักษาสมดุลพลังงานคงที่เพื่อสุขภาพที่ดี'}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>ดัชนีมวลกาย (BMI)</Text>
                <Text style={styles.resultValue}>{savedProfile.bmi}</Text>
                {bmiInfo && (
                  <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.bgColor }]}>
                    <Text style={[styles.bmiBadgeText, { color: bmiInfo.color }]}>
                      {bmiInfo.label}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>อัตราเผาผลาญพื้นฐาน</Text>
                <Text style={styles.resultValue}>
                  {savedProfile.bmr} <Text style={styles.unit}>BMR</Text>
                </Text>
                <Text style={styles.resultLabel}>การใช้พลังงานรวมประจำวัน</Text>
                <Text style={styles.resultSubValue}>
                  {savedProfile.tdee} <Text style={styles.unit}>TDEE</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* สัดส่วนสารอาหารหลัก */}
          <Text style={styles.macroTitle}>📊 สัดส่วนสารอาหารหลักที่แนะนำต่อวัน</Text>
          <View style={styles.macroContainer}>
            <View style={[styles.macroItem, { borderLeftColor: '#2563EB' }]}>
              <Text style={styles.macroLabel}>โปรตีน (P)</Text>
              <Text style={styles.macroValue}>{savedProfile.protein} กรัม</Text>
              <Text style={styles.macroCal}>{savedProfile.protein * 4} kcal</Text>
            </View>
            <View style={[styles.macroItem, { borderLeftColor: '#3B82F6' }]}>
              <Text style={styles.macroLabel}>คาร์บ (C)</Text>
              <Text style={styles.macroValue}>{savedProfile.carbs} กรัม</Text>
              <Text style={styles.macroCal}>{savedProfile.carbs * 4} kcal</Text>
            </View>
            <View style={[styles.macroItem, { borderLeftColor: '#06B6D4' }]}>
              <Text style={styles.macroLabel}>ไขมัน (F)</Text>
              <Text style={styles.macroValue}>{savedProfile.fat} กรัม</Text>
              <Text style={styles.macroCal}>{savedProfile.fat * 9} kcal</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  btnGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  btnChoice: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnChoiceActive: {
    backgroundColor: '#2563EB',
  },
  btnChoiceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  btnChoiceTextActive: {
    color: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  input: {
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1E293B',
    outlineStyle: 'none',
  } as any,
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dropdownTriggerText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
    }),
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#334155',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#2563EB',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    gap: 10,
  },
  optionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2563EB',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  optionTitleActive: {
    color: '#2563EB',
  },
  optionDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FDFEFF',
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 14,
    textAlign: 'center',
  },
  resultGrid: {
    gap: 12,
    marginBottom: 16,
  },
  resultItemHighlight: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  resultLabelHighlight: {
    fontSize: 11,
    color: '#BFDBFE',
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValueHighlight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  unitHighlight: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultDescHighlight: {
    fontSize: 10,
    color: '#EFF6FF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resultItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginVertical: 4,
  },
  resultSubValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  unit: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '400',
  },
  bmiBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  bmiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  macroTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 8,
  },
  macroLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 2,
  },
  macroCal: {
    fontSize: 8,
    color: '#94A3B8',
  },
});
