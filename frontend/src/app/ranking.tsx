import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. โครงสร้างข้อมูลสมาชิกจำลองของทีมต่างๆ
interface MemberStats {
  id: string;
  name: string;
  avatar: string;
  team: 'lose' | 'gain' | 'maintain';
  initialWeight: number;
  currentWeight: number;
  initialBodyFat: number;
  currentBodyFat: number;
  initialMuscleMass: number;
  currentMuscleMass: number;
  workoutCompletion: number; // 0-100 %
  mealCompletion: number;    // 0-100 %
  potentialScore?: number;
  height?: number;
}

const MOCK_MEMBERS: MemberStats[] = [
  // ทีมลดน้ำหนัก (lose)
  { id: 'm1', name: 'คุณออม (Aom)', avatar: '🏃‍♀️', team: 'lose', initialWeight: 75.2, currentWeight: 69.8, initialBodyFat: 28.5, currentBodyFat: 23.2, initialMuscleMass: 24.5, currentMuscleMass: 24.3, workoutCompletion: 92, mealCompletion: 88, height: 165 },
  { id: 'm2', name: 'คุณเต้ย (Toey)', avatar: '🏃‍♂️', team: 'lose', initialWeight: 88.5, currentWeight: 83.1, initialBodyFat: 32.1, currentBodyFat: 27.8, initialMuscleMass: 29.1, currentMuscleMass: 28.8, workoutCompletion: 85, mealCompletion: 80, height: 178 },
  { id: 'm3', name: 'คุณพีช (Peach)', avatar: '👩‍🦰', team: 'lose', initialWeight: 62.0, currentWeight: 59.5, initialBodyFat: 26.0, currentBodyFat: 22.1, initialMuscleMass: 20.8, currentMuscleMass: 21.0, workoutCompletion: 88, mealCompletion: 92, height: 160 },
  
  // ทีมเพิ่มกล้ามเนื้อ (gain)
  { id: 'm4', name: 'คุณนนท์ (Nont)', avatar: '🏋️‍♂️', team: 'gain', initialWeight: 65.4, currentWeight: 69.1, initialBodyFat: 12.5, currentBodyFat: 13.0, initialMuscleMass: 31.2, currentMuscleMass: 33.8, workoutCompletion: 95, mealCompletion: 90, height: 172 },
  { id: 'm5', name: 'คุณปอนด์ (Pond)', avatar: '💪', team: 'gain', initialWeight: 70.2, currentWeight: 73.5, initialBodyFat: 14.2, currentBodyFat: 14.8, initialMuscleMass: 33.1, currentMuscleMass: 35.4, workoutCompletion: 90, mealCompletion: 85, height: 175 },
  { id: 'm6', name: 'คุณมาร์ค (Mark)', avatar: '🧑‍💻', team: 'gain', initialWeight: 58.5, currentWeight: 61.2, initialBodyFat: 11.0, currentBodyFat: 11.8, initialMuscleMass: 28.0, currentMuscleMass: 29.5, workoutCompletion: 80, mealCompletion: 82, height: 168 },
  
  // ทีมรักษาสุขภาพ (maintain)
  { id: 'm7', name: 'คุณกิ๊ฟ (Gift)', avatar: '🧘‍♀️', team: 'maintain', initialWeight: 52.4, currentWeight: 52.3, initialBodyFat: 19.5, currentBodyFat: 19.3, initialMuscleMass: 19.8, currentMuscleMass: 20.0, workoutCompletion: 94, mealCompletion: 95, height: 160 },
  { id: 'm8', name: 'คุณวิว (View)', avatar: '👱‍♀️', team: 'maintain', initialWeight: 55.0, currentWeight: 55.2, initialBodyFat: 21.2, currentBodyFat: 21.3, initialMuscleMass: 20.5, currentMuscleMass: 20.6, workoutCompletion: 86, mealCompletion: 88, height: 163 },
  { id: 'm9', name: 'คุณเจเจ (JJ)', avatar: '👨‍⚕️', team: 'maintain', initialWeight: 68.5, currentWeight: 68.3, initialBodyFat: 16.5, currentBodyFat: 16.4, initialMuscleMass: 30.5, currentMuscleMass: 30.6, workoutCompletion: 90, mealCompletion: 91, height: 175 },
];

// กิจกรรมแจ้งเตือนล่าสุดจำลอง
const MOCK_ACTIVITIES = [
  { id: 'a1', name: 'คุณออม (Aom)', icon: '🏃‍♀️', text: 'พิชิตเป้าหมายคาร์ดิโอ สัปดาห์ที่ 2 สำเร็จ', time: '10 นาทีที่แล้ว' },
  { id: 'a2', name: 'คุณนนท์ (Nont)', icon: '🏋️‍♂️', text: 'ทานเมนูเพิ่มโปรตีนและบันทึกแคลอรี่ครบกำหนด', time: '25 นาทีที่แล้ว' },
  { id: 'a3', name: 'คุณกิ๊ฟ (Gift)', icon: '🧘‍♀️', text: 'บันทึกน้ำดื่มครบ 2,200 มล. เป็นเวลา 5 วันติดต่อกัน', time: '1 ชั่วโมงที่แล้ว' },
  { id: 'a4', name: 'คุณปอนด์ (Pond)', icon: '💪', text: 'น้ำหนักกล้ามเนื้ออัปเดตเพิ่มขึ้นอีก 0.5 kg', time: '2 ชั่วโมงที่แล้ว' },
  { id: 'a5', name: 'คุณพีช (Peach)', icon: '👩‍🦰', text: 'ลบเปอร์เซ็นต์ไขมันสะสมออกได้อีก 1.2% สำเร็จ', time: '4 ชั่วโมงที่แล้ว' },
];

// 2. ฟังก์ชันคำนวณคะแนนศักยภาพ (Potential Score)
const safeToNumber = (val: any, fallback = 0): number => {
  if (val === undefined || val === null) return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
};

const safeToFixed = (val: any, decimals = 1, fallback = '0.0'): string => {
  if (val === undefined || val === null) return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num.toFixed(decimals);
};

export const calculatePotentialScore = (member: MemberStats): number => {
  const team = member.team || 'lose';
  const initialWeight = safeToNumber(member.initialWeight, 75);
  const currentWeight = safeToNumber(member.currentWeight, initialWeight || 75);
  const initialBodyFat = safeToNumber(member.initialBodyFat, 24);
  const currentBodyFat = safeToNumber(member.currentBodyFat, initialBodyFat || 24);
  const initialMuscleMass = safeToNumber(member.initialMuscleMass, 28);
  const currentMuscleMass = safeToNumber(member.currentMuscleMass, initialMuscleMass || 28);
  const workoutCompletion = safeToNumber(member.workoutCompletion, 0);
  const mealCompletion = safeToNumber(member.mealCompletion, 0);
  const height = safeToNumber(member.height, 170);

  const consistency = (workoutCompletion + mealCompletion) / 2;
  let targetProgressScore = 0;

  if (team === 'maintain') {
    // ทีมรักษาสุขภาพ: แบ่งเป็น 2 ส่วน
    // ส่วนที่ 1: BMI ในวันสุดท้ายของกิจกรรมต้องอยู่ในช่วง 18.5 - 24.9 ถึงจะจัดอันดับได้ (มิฉะนั้นคะแนน = 0)
    const heightInM = height / 100;
    const bmi = heightInM > 0 ? currentWeight / (heightInM * heightInM) : 22;
    const isBmiEligible = bmi >= 18.5 && bmi <= 24.9;

    if (!isBmiEligible) {
      return 0; // ไม่สามารถจัดอันดับได้ (คะแนนเป็น 0)
    }

    // ส่วนที่ 2: ค่าไขมันในร่างกาย เพิ่ม/ลด และ ค่ามวลกล้ามเนื้อ เพิ่ม/ลด
    // - ค่าไขมัน: ไขมันลดลงหรือคงที่ได้คะแนนเต็ม 50, หากเพิ่มจะหักคะแนน
    const fatLoss = initialBodyFat - currentBodyFat;
    const bfScore = fatLoss >= 0 ? 50 : Math.max(0, 50 + fatLoss * 10);

    // - ค่ามวลกล้ามเนื้อ: มวลกล้ามเนื้อเพิ่มหรือคงที่ได้คะแนนเต็ม 50, หากลดจะหักคะแนน
    const muscleGain = currentMuscleMass - initialMuscleMass;
    const mmScore = muscleGain >= 0 ? 50 : Math.max(0, 50 + muscleGain * 15);

    targetProgressScore = bfScore + mmScore;
  } else if (team === 'lose') {
    // ทีมลดน้ำหนัก: ค่าไขมันในร่างกาย เพิ่ม/ลด, ค่ามวลกล้ามเนื้อ เพิ่ม/ลด, ค่าน้ำหนัก เพิ่ม/ลด
    // - ค่าน้ำหนัก (สูงสุด 40 คะแนน): น้ำหนักลดลงได้คะแนน
    const weightLoss = initialWeight - currentWeight;
    const wlScore = weightLoss > 0 ? Math.min(40, weightLoss * 10) : 0;

    // - ค่าไขมัน (สูงสุด 40 คะแนน): ไขมันลดลงได้คะแนน
    const fatLoss = initialBodyFat - currentBodyFat;
    const bfScore = fatLoss > 0 ? Math.min(40, fatLoss * 15) : 0;

    // - ค่ามวลกล้ามเนื้อ (สูงสุด 20 คะแนน): รักษากล้ามเนื้อหรือเพิ่มกล้ามเนื้อ
    const muscleGain = currentMuscleMass - initialMuscleMass;
    const mmScore = muscleGain >= 0 ? 20 : Math.max(0, 20 + muscleGain * 10);

    targetProgressScore = wlScore + bfScore + mmScore;
  } else {
    // ทีมเพิ่มกล้ามเนื้อ: ค่าไขมันในร่างกาย เพิ่ม/ลด, ค่ามวลกล้ามเนื้อ เพิ่ม/ลด (ไม่คิดน้ำหนักตัว)
    // - ค่ามวลกล้ามเนื้อ (สูงสุด 70 คะแนน): มวลกล้ามเนื้อเพิ่มขึ้นได้คะแนน
    const muscleGain = currentMuscleMass - initialMuscleMass;
    const mmScore = muscleGain > 0 ? Math.min(70, muscleGain * 20) : 0;

    // - ค่าไขมัน (สูงสุด 30 คะแนน): ไขมันลดลงหรือคงที่ได้คะแนนเต็ม 30, หากเพิ่มจะหักคะแนน
    const fatLoss = initialBodyFat - currentBodyFat;
    const bfScore = fatLoss >= 0 ? 30 : Math.max(0, 30 + fatLoss * 8);

    targetProgressScore = mmScore + bfScore;
  }

  // คะแนนสุดท้าย = (ความก้าวหน้าตามเป้าหมาย 70%) + (ความสม่ำเสมอในการออกกำลังกายและควบคุมอาหาร 30%)
  const finalScore = targetProgressScore * 0.7 + consistency * 0.3;
  const rounded = Math.round(finalScore);
  return isNaN(rounded) ? 0 : Math.max(0, Math.min(100, rounded));
};

export default function RankingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'team' | 'individual' | 'log'>('team');
  const [filterTeam, setFilterTeam] = useState<'all' | 'lose' | 'gain' | 'maintain'>('all');
  
  // ข้อมูลของตัวผู้ใช้เอง
  const [userStats, setUserStats] = useState<MemberStats>({
    id: 'user',
    name: 'ตัวคุณเอง',
    avatar: '⭐️',
    team: 'lose',
    initialWeight: 75.0,
    currentWeight: 73.2,
    initialBodyFat: 24.0,
    currentBodyFat: 22.5,
    initialMuscleMass: 28.5,
    currentMuscleMass: 28.6,
    workoutCompletion: 80,
    mealCompletion: 75,
    height: 170,
  });

  // สถานะเก็บสตริงสำหรับอินพุต เพื่อป้องกันปัญหาพิมพ์ทศนิยมหรือศูนย์
  const [inputInitialWeight, setInputInitialWeight] = useState('');
  const [inputCurrentWeight, setInputCurrentWeight] = useState('');
  const [inputInitialBodyFat, setInputInitialBodyFat] = useState('');
  const [inputCurrentBodyFat, setInputCurrentBodyFat] = useState('');
  const [inputInitialMuscleMass, setInputInitialMuscleMass] = useState('');
  const [inputCurrentMuscleMass, setInputCurrentMuscleMass] = useState('');

  const [leaderboardData, setLeaderboardData] = useState<MemberStats[]>([]);
  const [teamStats, setTeamStats] = useState<Record<string, { averagePotential: number; memberCount: number; color: string; label: string; icon: string }>>({});
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันคำนวณและอัปเดตตารางคะแนนทั้งหมด
  const recalculateLeaderboard = (currentUser: MemberStats) => {
    // 1. คำนวณคะแนนของตัวผู้ใช้งานเอง
    const userWithScore = {
      ...currentUser,
      potentialScore: calculatePotentialScore(currentUser),
    };

    // 2. คำนวณคะแนนของคนอื่น
    const allMembersWithScores = MOCK_MEMBERS.map((m) => ({
      ...m,
      potentialScore: calculatePotentialScore(m),
    }));

    // 3. รวมและจัดอันดับรายบุคคล
    const totalList = [userWithScore, ...allMembersWithScores].sort(
      (a, b) => (b.potentialScore || 0) - (a.potentialScore || 0)
    );
    setLeaderboardData(totalList);

    // 4. คำนวณความก้าวหน้าจัดอันดับกลุ่มทีม
    const teams = {
      lose: { scoreSum: 0, count: 0, label: 'ทีมลดน้ำหนัก', color: '#EF4444', icon: '🏃‍♂️' },
      gain: { scoreSum: 0, count: 0, label: 'ทีมเพิ่มกล้ามเนื้อ', color: '#2563EB', icon: '🏋️‍♂️' },
      maintain: { scoreSum: 0, count: 0, label: 'ทีมรักษาสุขภาพ', color: '#10B981', icon: '🧘‍♀️' },
    };

    totalList.forEach((m) => {
      if (teams[m.team]) {
        teams[m.team].scoreSum += m.potentialScore || 0;
        teams[m.team].count += 1;
      }
    });

    const calculatedTeamStats = {
      lose: { averagePotential: Math.round(teams.lose.scoreSum / Math.max(1, teams.lose.count)), memberCount: teams.lose.count, color: teams.lose.color, label: teams.lose.label, icon: teams.lose.icon },
      gain: { averagePotential: Math.round(teams.gain.scoreSum / Math.max(1, teams.gain.count)), memberCount: teams.gain.count, color: teams.gain.color, label: teams.gain.label, icon: teams.gain.icon },
      maintain: { averagePotential: Math.round(teams.maintain.scoreSum / Math.max(1, teams.maintain.count)), memberCount: teams.maintain.count, color: teams.maintain.color, label: teams.maintain.label, icon: teams.maintain.icon },
    };

    setTeamStats(calculatedTeamStats);
  };

  // โหลดสถิติดั้งเดิมและคำนวณอันดับ
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // ดึงโปรไฟล์ดั้งเดิมจาก AsyncStorage (ถ้ามี)
        const savedProfile = await AsyncStorage.getItem('aura_user_profile');
        const savedUserStats = await AsyncStorage.getItem('aura_user_stats');
        
        let baseStats = { ...userStats };
        
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          baseStats.team = (profile.goal === 'fat-loss' ? 'lose' : profile.goal === 'muscle-gain' ? 'gain' : 'maintain') as any;
          baseStats.initialWeight = parseFloat(profile.weight as any) || 75;
          baseStats.height = parseFloat(profile.height as any) || 170;
          if (profile.name) {
            baseStats.name = profile.name;
          }
        }
        
        if (savedUserStats) {
          const parsedStats = JSON.parse(savedUserStats);
          baseStats = {
            ...baseStats,
            ...parsedStats,
            initialWeight: parseFloat(parsedStats.initialWeight as any) || baseStats.initialWeight,
            currentWeight: parseFloat(parsedStats.currentWeight as any) || baseStats.currentWeight,
            initialBodyFat: parseFloat(parsedStats.initialBodyFat as any) || baseStats.initialBodyFat,
            currentBodyFat: parseFloat(parsedStats.currentBodyFat as any) || baseStats.currentBodyFat,
            initialMuscleMass: parseFloat(parsedStats.initialMuscleMass as any) || baseStats.initialMuscleMass,
            currentMuscleMass: parseFloat(parsedStats.currentMuscleMass as any) || baseStats.currentMuscleMass,
          };
        } else {
          // อิงค่าน้ำหนักตัวปัจจุบันจากประวัติการลงบันทึกในหน้าหลัก
          const savedHistory = await AsyncStorage.getItem('aura_weight_history');
          if (savedHistory) {
            const history = JSON.parse(savedHistory);
            if (history.length > 0) {
              baseStats.currentWeight = parseFloat(history[history.length - 1].weight as any) || baseStats.currentWeight;
            }
          }
        }

        // คำนวณความคืบหน้าการทำงานจริงของผู้ใช้ (Workout & Meal)
        const savedExercises = (await AsyncStorage.getItem('aura_completed_exercises_v2')) || (await AsyncStorage.getItem('aura_completed_exercises'));
        if (savedExercises) {
          const completed = JSON.parse(savedExercises);
          let totalCount = 0;
          for (const key in completed) {
            totalCount += completed[key].length;
          }
          baseStats.workoutCompletion = Math.min(100, Math.max(50, 60 + totalCount * 2));
        }
        
        const savedMeals = await AsyncStorage.getItem('aura_two_week_meal_plan');
        if (savedMeals) {
          baseStats.mealCompletion = Math.min(100, Math.max(40, 78));
        }

        setUserStats(baseStats);
        recalculateLeaderboard(baseStats);

        // กำหนดสถานะอินพุตเริ่มต้นเป็นสตริง
        setInputInitialWeight(String(baseStats.initialWeight));
        setInputCurrentWeight(String(baseStats.currentWeight));
        setInputInitialBodyFat(String(baseStats.initialBodyFat));
        setInputCurrentBodyFat(String(baseStats.currentBodyFat));
        setInputInitialMuscleMass(String(baseStats.initialMuscleMass));
        setInputCurrentMuscleMass(String(baseStats.currentMuscleMass));
      } catch (e) {
        console.warn(e);
        recalculateLeaderboard(userStats);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // จัดการอัปเดตสตริงและสถานะจัดอันดับ
  const handleTextChange = (key: keyof MemberStats, val: string) => {
    // 1. อัปเดตสถานะอินพุตสตริงชั่วคราว เพื่อให้พิมพ์ได้สะดวก
    if (key === 'initialWeight') setInputInitialWeight(val);
    else if (key === 'currentWeight') setInputCurrentWeight(val);
    else if (key === 'initialBodyFat') setInputInitialBodyFat(val);
    else if (key === 'currentBodyFat') setInputCurrentBodyFat(val);
    else if (key === 'initialMuscleMass') setInputInitialMuscleMass(val);
    else if (key === 'currentMuscleMass') setInputCurrentMuscleMass(val);

    // 2. แปลงค่าเป็นตัวเลขเพื่อบันทึกลงในสถิติและจัดอันดับทันที (ถ้ายังป้อนไม่เสร็จหรือไม่ใช่ตัวเลข ให้ใช้ค่า 0 ชั่วคราว)
    const numVal = parseFloat(val);
    const safeVal = isNaN(numVal) ? 0 : numVal;

    setUserStats((prev) => {
      const updated = { ...prev, [key]: safeVal };
      AsyncStorage.setItem('aura_user_stats', JSON.stringify(updated)).catch(e => console.warn(e));
      recalculateLeaderboard(updated);
      return updated;
    });
  };

  // สลับประเภทความสนใจของผู้ใช้หลัก
  const handleToggleUserTeam = async (teamId: 'lose' | 'gain' | 'maintain') => {
    const updated = { ...userStats, team: teamId };
    setUserStats(updated);
    recalculateLeaderboard(updated);

    try {
      await AsyncStorage.setItem('aura_user_stats', JSON.stringify(updated));
      
      // ซิงก์เป้าหมายกลับไปยังโปรไฟล์หลัก
      const savedProfile = await AsyncStorage.getItem('aura_user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        profile.goal = teamId === 'lose' ? 'fat-loss' : teamId === 'gain' ? 'muscle-gain' : 'maintenance';
        await AsyncStorage.setItem('aura_user_profile', JSON.stringify(profile));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // กรองตารางจัดอันดับเดี่ยว
  const filteredLeaderboard = leaderboardData.filter((member) => {
    if (filterTeam === 'all') return true;
    return member.team === filterTeam;
  });

  // ค้นหารายการโพเดียม 3 อันดับแรก
  const podiumList = leaderboardData.slice(0, 3);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>กำลังดึงข้อมูลการจัดอันดับและสถิติ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ส่วนหัวแอป */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>⬅️ กลับแดชบอร์ด</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🏆 กระดานจัดอันดับ & ศักยภาพกลุ่ม</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          ตารางเปรียบเทียบผลประกอบการและศักยภาพสุขภาพ (Potential) ระหว่างประเภททีมและรายบุคคล
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* แถบเลือกแท็บการแสดงผล */}
        <View style={styles.tabWrapper}>
          <Pressable
            style={[styles.tabButton, activeTab === 'team' && styles.tabButtonActive]}
            onPress={() => setActiveTab('team')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'team' && styles.tabButtonTextActive]}>
              🥊 จัดอันดับประเภททีม
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'individual' && styles.tabButtonActive]}
            onPress={() => setActiveTab('individual')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'individual' && styles.tabButtonTextActive]}>
              🥇 จัดอันดับรายบุคคล
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'log' && styles.tabButtonActive]}
            onPress={() => setActiveTab('log')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'log' && styles.tabButtonTextActive]}>
              📝 บันทึกข้อมูลของฉัน
            </Text>
          </Pressable>
        </View>

        {/* ---------------- แท็บที่ 1: จัดอันดับประเภททีม ---------------- */}
        {activeTab === 'team' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>🏆 อันดับประสิทธิภาพภาพรวมรายทีม</Text>
            
            {/* แสดงผลการ์ดเปรียบเทียบ 3 ทีม */}
            <View style={styles.teamGridContainer}>
              {Object.entries(teamStats)
                .sort((a, b) => b[1].averagePotential - a[1].averagePotential)
                .map(([teamId, data], idx) => {
                  const isWinner = idx === 0;
                  return (
                    <View key={teamId} style={[styles.teamCard, isWinner && styles.winnerTeamCard]}>
                      <View style={styles.teamCardHeader}>
                        <Text style={styles.teamCardEmoji}>{data.icon}</Text>
                        <View>
                          <Text style={styles.teamCardTitle}>{data.label}</Text>
                          <Text style={styles.teamMemberCount}>สมาชิก {data.memberCount} คน</Text>
                        </View>
                        {isWinner && <Text style={styles.goldMedalBadge}>🥇 อันดับ 1</Text>}
                      </View>
                      
                      <View style={styles.teamPotentialWrapper}>
                        <Text style={styles.teamPotentialLabel}>ศักยภาพเฉลี่ยทีม (Potential)</Text>
                        <Text style={[styles.teamPotentialValue, { color: data.color }]}>
                          {data.averagePotential} <Text style={styles.potentialScoreUnit}>คะแนน</Text>
                        </Text>
                      </View>

                      {/* แถบ Progress Bar */}
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${data.averagePotential}%`, backgroundColor: data.color }]} />
                      </View>

                      <View style={styles.teamDetailsRow}>
                        <Text style={styles.teamDetailStat}>
                          เป้าหมายหลัก: {teamId === 'lose' ? 'ลดไขมัน/น้ำหนัก' : teamId === 'gain' ? 'สร้างมวลกล้ามเนื้อ' : 'รักษาสมดุลร่างกาย'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>

            {/* กิจกรรมล่าสุดของทีม */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>⚡ กิจกรรมและการอัปเดตล่าสุดของเพื่อนร่วมทีม</Text>
              <View style={styles.activityList}>
                {MOCK_ACTIVITIES.map((act) => (
                  <View key={act.id} style={styles.activityItem}>
                    <Text style={styles.activityIcon}>{act.icon}</Text>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityUser}>{act.name}</Text>
                      <Text style={styles.activityText}>{act.text}</Text>
                    </View>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ---------------- แท็บที่ 2: จัดอันดับรายบุคคล ---------------- */}
        {activeTab === 'individual' && (
          <View style={styles.contentSection}>
            {/* โพเดียม Top 3 */}
            <Text style={styles.sectionTitle}>🏆 อันดับศักยภาพส่วนบุคคลยอดเยี่ยมประจำสัปดาห์</Text>
            
            <View style={styles.podiumContainer}>
              {/* อันดับ 2 */}
              {podiumList[1] && (
                <View style={[styles.podiumPlace, styles.podiumSecond]}>
                  <Text style={styles.podiumEmoji}>{podiumList[1].avatar}</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>{podiumList[1].name}</Text>
                  <Text style={[styles.podiumScore, styles.colorSecond]}>{podiumList[1].potentialScore} คะแนน</Text>
                  <View style={styles.podiumBarSecond}>
                    <Text style={styles.podiumRankText}>🥈 อันดับ 2</Text>
                  </View>
                </View>
              )}

              {/* อันดับ 1 */}
              {podiumList[0] && (
                <View style={[styles.podiumPlace, styles.podiumFirst]}>
                  <Text style={styles.podiumTrophy}>👑</Text>
                  <Text style={styles.podiumEmoji}>{podiumList[0].avatar}</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>{podiumList[0].name}</Text>
                  <Text style={[styles.podiumScore, styles.colorFirst]}>{podiumList[0].potentialScore} คะแนน</Text>
                  <View style={styles.podiumBarFirst}>
                    <Text style={styles.podiumRankText}>🥇 อันดับ 1</Text>
                  </View>
                </View>
              )}

              {/* อันดับ 3 */}
              {podiumList[2] && (
                <View style={[styles.podiumPlace, styles.podiumThird]}>
                  <Text style={styles.podiumEmoji}>{podiumList[2].avatar}</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>{podiumList[2].name}</Text>
                  <Text style={[styles.podiumScore, styles.colorThird]}>{podiumList[2].potentialScore} คะแนน</Text>
                  <View style={styles.podiumBarThird}>
                    <Text style={styles.podiumRankText}>🥉 อันดับ 3</Text>
                  </View>
                </View>
              )}
            </View>

            {/* ส่วนตัวควบคุม Filter ตารางจัดอันดับ */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>กรองเฉพาะทีม:</Text>
              <View style={styles.filterButtonsRow}>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'lose', label: 'ลดน้ำหนัก 🏃‍♂️' },
                  { id: 'gain', label: 'เพิ่มกล้ามเนื้อ 🏋️‍♂️' },
                  { id: 'maintain', label: 'รักษาสุขภาพ 🧘‍♀️' },
                ].map((btn) => (
                  <Pressable
                    key={btn.id}
                    style={[styles.filterBtn, filterTeam === btn.id && styles.filterBtnActive]}
                    onPress={() => setFilterTeam(btn.id as any)}
                  >
                    <Text style={[styles.filterBtnText, filterTeam === btn.id && styles.filterBtnTextActive]}>
                      {btn.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ตารางแสดงผลรายบุคคล */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.thCell, styles.thRank]}>อันดับ</Text>
                <Text style={[styles.thCell, styles.thName]}>สมาชิก / ทีม</Text>
                <Text style={[styles.thCell, styles.thStats]}>น้ำหนัก (เริ่ม➡️ปัจจุบัน)</Text>
                <Text style={[styles.thCell, styles.thFat]}>ไขมัน / กล้ามเนื้อ</Text>
                <Text style={[styles.thCell, styles.thPotential]}>ศักยภาพ (Potential)</Text>
              </View>

              {filteredLeaderboard.map((member, idx) => {
                // หาตำแหน่งอันดับจริงจากรายการทั้งหมด (ไม่ใช่รายการที่กรอง)
                const realRank = leaderboardData.findIndex(m => m.id === member.id) + 1;
                const isMe = member.id === 'user';
                const teamLabel = member.team === 'lose' ? 'ลดน้ำหนัก' : member.team === 'gain' ? 'เพิ่มกล้าม' : 'รักษาสุขภาพ';
                const teamColor = member.team === 'lose' ? '#EF4444' : member.team === 'gain' ? '#2563EB' : '#10B981';

                // คำนวณ BMI สำหรับการแสดงผลของทีมรักษาสุขภาพ
                const memberHeight = safeToNumber(member.height, 170);
                const heightInM = memberHeight / 100;
                const currentBmi = heightInM > 0 ? safeToNumber(member.currentWeight) / (heightInM * heightInM) : 0;
                const isBmiEligible = currentBmi >= 18.5 && currentBmi <= 24.9;

                return (
                  <View key={member.id} style={[styles.tableRow, isMe && styles.tableRowHighlight]}>
                    {/* คอลัมน์ที่ 1: อันดับ */}
                    <View style={[styles.tdCell, styles.thRank, styles.centerAlign]}>
                      <Text style={[styles.rankText, realRank <= 3 && styles.boldRankText]}>
                        {realRank === 1 ? '🥇' : realRank === 2 ? '🥈' : realRank === 3 ? '🥉' : realRank}
                      </Text>
                    </View>

                    {/* คอลัมน์ที่ 2: โปรไฟล์ / สังกัดทีม */}
                    <View style={[styles.tdCell, styles.thName]}>
                      <Text style={styles.memberNameText}>
                        {member.avatar} {member.name} {isMe && <Text style={styles.meBadge}>คุณ</Text>}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                        <Text style={[styles.memberTeamText, { color: teamColor }]}>
                          ● {teamLabel}
                        </Text>
                        {member.team === 'maintain' && (
                          <Text style={[
                            styles.bmiBadge,
                            isBmiEligible ? styles.bmiEligibleText : styles.bmiWarningText
                          ]}>
                            BMI: {currentBmi.toFixed(1)} {isBmiEligible ? '✅' : '⚠️ ไม่ผ่านเกณฑ์'}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* คอลัมน์ที่ 3: น้ำหนัก */}
                    <View style={[styles.tdCell, styles.thStats]}>
                      <Text style={styles.statsValueText}>
                        {safeToFixed(member.initialWeight)} ➡️ {safeToFixed(member.currentWeight)} kg
                      </Text>
                      {member.team === 'lose' && (
                        <Text style={[styles.diffText, styles.greenText]}>
                          ลดลง: {safeToFixed(safeToNumber(member.initialWeight) - safeToNumber(member.currentWeight))} kg
                        </Text>
                      )}
                      {member.team === 'gain' && (
                        <Text style={[styles.diffText, styles.blueText]}>
                          เพิ่มขึ้น: {safeToFixed(safeToNumber(member.currentWeight) - safeToNumber(member.initialWeight))} kg
                        </Text>
                      )}
                    </View>

                    {/* คอลัมน์ที่ 4: เปอร์เซ็นต์ไขมัน & กล้ามเนื้อ */}
                    <View style={[styles.tdCell, styles.thFat]}>
                      <Text style={styles.statsDetailText}>
                        ไขมัน: {safeToFixed(member.initialBodyFat)}% ➡️ {safeToFixed(member.currentBodyFat)}%
                      </Text>
                      <Text style={styles.statsDetailText}>
                        กล้ามเนื้อ: {safeToFixed(member.initialMuscleMass)} ➡️ {safeToFixed(member.currentMuscleMass)} kg
                      </Text>
                    </View>

                    {/* คอลัมน์ที่ 5: คะแนนศักยภาพ */}
                    <View style={[styles.tdCell, styles.thPotential, styles.centerAlign]}>
                      <Text style={[styles.potentialValueText, { color: teamColor }]}>
                        {member.potentialScore} คะแนน
                      </Text>
                      <Text style={styles.completionDetailText}>
                        ความสม่ำเสมอ: {Math.round((member.workoutCompletion + member.mealCompletion) / 2)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ---------------- แท็บที่ 3: บันทึกข้อมูลของฉัน ---------------- */}
        {activeTab === 'log' && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>📝 อัปเดตสถิติมวลร่างกายและสังกัดทีมของคุณ</Text>
            
            <View style={styles.logFormCard}>
              
              {/* เลือกทีมที่คุณสังกัด */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>🎯 เลือกสังกัดทีมเพื่อคำนวณสูตรศักยภาพ (Potential)</Text>
                <View style={styles.teamSelectionRow}>
                  {[
                    { id: 'lose', label: 'ทีมลดน้ำหนัก 🏃‍♂️', desc: 'เน้นลดไขมัน/น้ำหนัก' },
                    { id: 'gain', label: 'ทีมเพิ่มกล้ามเนื้อ 🏋️‍♂️', desc: 'เน้นเพิ่มกล้ามเนื้อ' },
                    { id: 'maintain', label: 'ทีมรักษาสุขภาพ 🧘‍♀️', desc: 'เน้นคงน้ำหนักเสถียร' },
                  ].map((teamOpt) => {
                    const isSelected = userStats.team === teamOpt.id;
                    return (
                      <Pressable
                        key={teamOpt.id}
                        style={[styles.teamSelectCard, isSelected && styles.teamSelectCardActive]}
                        onPress={() => handleToggleUserTeam(teamOpt.id as any)}
                      >
                        <Text style={[styles.teamSelectLabel, isSelected && styles.teamSelectLabelActive]}>
                          {teamOpt.label}
                        </Text>
                        <Text style={styles.teamSelectDesc}>{teamOpt.desc}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.separator} />

              {/* ป้อนสถิติน้ำหนักตัว */}
              <View style={styles.formRowInput}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>⚖️ น้ำหนักเริ่มต้น (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputInitialWeight}
                    onChangeText={(val) => handleTextChange('initialWeight', val)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>⚖️ น้ำหนักปัจจุบัน (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputCurrentWeight}
                    onChangeText={(val) => handleTextChange('currentWeight', val)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ป้อนค่าเปอร์เซ็นต์ไขมันร่างกาย */}
              <View style={styles.formRowInput}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>📉 เปอร์เซ็นต์ไขมันเริ่มต้น (%)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputInitialBodyFat}
                    onChangeText={(val) => handleTextChange('initialBodyFat', val)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>📉 เปอร์เซ็นต์ไขมันปัจจุบัน (%)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputCurrentBodyFat}
                    onChangeText={(val) => handleTextChange('currentBodyFat', val)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ป้อนสถิติมวลกล้ามเนื้อ */}
              <View style={styles.formRowInput}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>🥩 มวลกล้ามเนื้อเริ่มต้น (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputInitialMuscleMass}
                    onChangeText={(val) => handleTextChange('initialMuscleMass', val)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>🥩 มวลกล้ามเนื้อปัจจุบัน (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputCurrentMuscleMass}
                    onChangeText={(val) => handleTextChange('currentMuscleMass', val)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  💡 **คะแนนศักยภาพ (Potential)** ของคุณจะคิดคำนวณแบบเรียลไทม์จากตัวเลขที่ป้อนด้านบนนี้ และข้อมูลการเช็คลิสต์กิจกรรมของคุณในหน้าหลัก
                </Text>
              </View>

              <Pressable style={styles.confirmSaveButton} onPress={() => alert('✨ บันทึกข้อมูลและประมวลผลจัดอันดับเรียบร้อยแล้ว!')}>
                <Text style={styles.confirmSaveButtonText}>💾 ยืนยันบันทึกข้อมูลของฉัน</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 16,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    minWidth: 150,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#2563EB',
  },
  contentSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  teamGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  teamCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 320 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    gap: 16,
  },
  winnerTeamCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FFFBEB',
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamCardEmoji: {
    fontSize: 32,
  },
  teamCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  teamMemberCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  goldMedalBadge: {
    marginLeft: 'auto',
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  teamPotentialWrapper: {
    flexDirection: 'column',
    gap: 2,
  },
  teamPotentialLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  teamPotentialValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  potentialScoreUnit: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 10,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  teamDetailsRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  teamDetailStat: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    fontSize: 24,
  },
  activityDetails: {
    flex: 1,
    gap: 2,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  activityText: {
    fontSize: 12,
    color: '#64748B',
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 240,
    marginBottom: 20,
    gap: 14,
    paddingHorizontal: 10,
  },
  podiumPlace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: 160,
  },
  podiumFirst: {
    height: '100%',
  },
  podiumSecond: {
    height: '80%',
  },
  podiumThird: {
    height: '70%',
  },
  podiumTrophy: {
    fontSize: 24,
    marginBottom: 2,
  },
  podiumEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  colorFirst: { color: '#D97706' },
  colorSecond: { color: '#475569' },
  colorThird: { color: '#B45309' },
  podiumBarFirst: {
    width: '100%',
    height: 100,
    backgroundColor: '#FEF3C7',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  podiumBarSecond: {
    width: '100%',
    height: 75,
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  podiumBarThird: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFEDD5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  podiumRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  thRank: { width: 50 },
  thName: { flex: 2 },
  thStats: { flex: 2 },
  thFat: { flex: 2 },
  thPotential: { flex: 1.5, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tableRowHighlight: {
    backgroundColor: '#F0F9FF',
  },
  tdCell: {
    justifyContent: 'center',
  },
  centerAlign: {
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  boldRankText: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  memberTeamText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  statsValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  greenText: { color: '#10B981' },
  blueText: { color: '#2563EB' },
  statsDetailText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  potentialValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  completionDetailText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  meBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
  },
  logFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    gap: 20,
  },
  formGroup: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  teamSelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teamSelectCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  teamSelectCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  teamSelectLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  teamSelectLabelActive: {
    color: '#2563EB',
  },
  teamSelectDesc: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  formRowInput: {
    flexDirection: 'row',
    gap: 16,
  },
  inputCol: {
    flex: 1,
    gap: 8,
  },
  textInput: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    outlineStyle: 'none',
  } as any,
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
  },
  infoBannerText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
    fontWeight: '500',
  },
  confirmSaveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmSaveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bmiBadge: {
    fontSize: 9,
    fontWeight: '700',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bmiEligibleText: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  bmiWarningText: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
});
