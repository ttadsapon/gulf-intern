import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import MealGrid from '../components/MealGrid';
import WorkoutGrid from '../components/WorkoutGrid';
import HealthCalculator from '../components/HealthCalculator';
import WeightChart from '../components/WeightChart';
import ChecklistCard from '../components/ChecklistCard';
import {
  DAYS_OF_WEEK,
  Meal,
  DayPlan,
  DEFAULT_WEEKLY_MEALS,
  DEFAULT_WEEKLY_WORKOUTS,
} from '../data/plannerData';
import { useRouter } from 'expo-router';

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

interface WeightEntry {
  date: string;
  weight: number;
}

const GOALS = [
  { id: 'fat-loss', title: 'ลดไขมัน (Fat Loss)' },
  { id: 'maintenance', title: 'รักษาน้ำหนัก (Maintenance)' },
  { id: 'muscle-gain', title: 'สร้างกล้ามเนื้อ (Muscle Gain)' },
];

const generateDefaultWeek2Workouts = () => {
  const week2: Record<string, any> = {};
  for (const day in DEFAULT_WEEKLY_WORKOUTS) {
    const original = DEFAULT_WEEKLY_WORKOUTS[day];
    week2[day] = {
      ...original,
      workoutTitle: original.workoutTitle !== 'Rest & Recover' && original.workoutTitle !== 'Active Recovery' 
        ? `${original.workoutTitle} (สัปดาห์ที่ 2)` 
        : original.workoutTitle,
      exercises: original.exercises.map((ex) => {
        let newReps = ex.reps;
        let newSets = ex.sets;
        if (ex.reps.includes('ครั้ง')) {
          const num = parseInt(ex.reps);
          if (!isNaN(num)) newReps = `${num + 3} ครั้ง`;
        } else if (ex.reps.includes('วินาที')) {
          const num = parseInt(ex.reps);
          if (!isNaN(num)) newReps = `${num + 15} วินาที`;
        }
        return {
          ...ex,
          sets: newSets + 1,
          reps: newReps,
          description: ex.description + ' (เพิ่มความก้าวหน้า)',
        };
      }),
    };
  }
  return week2;
};

const generateDefaultWeek2Meals = () => {
  const week2: Record<string, any> = {};
  for (const day in DEFAULT_WEEKLY_MEALS) {
    const originalMeals = DEFAULT_WEEKLY_MEALS[day];
    week2[day] = originalMeals.map((meal) => {
      if (!meal) return null;
      return {
        ...meal,
        name: meal.category === 'breakfast' || meal.category === 'lunch' || meal.category === 'dinner'
          ? `${meal.name} (เมนูสุขภาพสัปดาห์ 2)`
          : meal.name,
        calories: Math.round(meal.calories * 0.95), // ลดแคลอรีเล็กน้อยเพื่อสุขภาพ
      };
    });
  }
  return week2;
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<string>('จันทร์');
  const [activeWeek, setActiveWeek] = useState<'week1' | 'week2'>('week1');
  const [twoWeekWorkoutPlan, setTwoWeekWorkoutPlan] = useState<any>(null);
  const [twoWeekMealPlan, setTwoWeekMealPlan] = useState<any>(null);
  const [weeklyMeals, setWeeklyMeals] = useState<Record<string, (Meal | null)[]>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, string[]>>({});
  const [waterIntake, setWaterIntake] = useState<Record<string, number>>({});
  
  // สถานะเพิ่มเติมสำหรับระบบสุขภาพดั้งเดิม
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [dailyChecklist, setDailyChecklist] = useState<Record<string, Record<string, boolean>>>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCalculatorForm, setShowCalculatorForm] = useState<boolean>(false);

  // สเตตสำหรับบันทึกข้อมูลมวลร่างกายของตัวผู้ใช้งานเอง
  const [userWeight, setUserWeight] = useState<string>('');
  const [userBodyFat, setUserBodyFat] = useState<string>('');
  const [userMuscle, setUserMuscle] = useState<string>('');

  // โหลดข้อมูลจาก LocalStorage เมื่อเริ่มต้น
  useEffect(() => {
    try {
      const savedMeals = localStorage.getItem('aura_weekly_meals');
      const savedExercises = localStorage.getItem('aura_completed_exercises_v2') || localStorage.getItem('aura_completed_exercises');
      const savedWater = localStorage.getItem('aura_water_intake');
      const savedProfile = localStorage.getItem('aura_user_profile');
      const savedWeightHistory = localStorage.getItem('aura_weight_history');
      const savedChecklist = localStorage.getItem('aura_daily_checklist');
      const savedTwoWeekPlan = localStorage.getItem('aura_two_week_workout_plan');

      if (savedMeals) {
        setWeeklyMeals(JSON.parse(savedMeals));
      } else {
        setWeeklyMeals(DEFAULT_WEEKLY_MEALS);
        localStorage.setItem('aura_weekly_meals', JSON.stringify(DEFAULT_WEEKLY_MEALS));
      }

      if (savedExercises) {
        setCompletedExercises(JSON.parse(savedExercises));
      } else {
        setCompletedExercises({});
      }

      if (savedWater) {
        setWaterIntake(JSON.parse(savedWater));
      } else {
        setWaterIntake({});
      }

      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
        setShowCalculatorForm(false);
      } else {
        setUserProfile(null);
        setShowCalculatorForm(true); // ถ้ายังไม่มีโปรไฟล์ ให้แสดงฟอร์มคำนวณก่อน
      }

      if (savedWeightHistory) {
        setWeightHistory(JSON.parse(savedWeightHistory));
      } else {
        const defaultHistory = [
          { date: '21/5', weight: 72.5 },
          { date: '22/5', weight: 72.1 },
          { date: '23/5', weight: 71.8 },
          { date: '24/5', weight: 71.5 },
          { date: '25/5', weight: 71.2 }
        ];
        setWeightHistory(defaultHistory);
        localStorage.setItem('aura_weight_history', JSON.stringify(defaultHistory));
      }

      if (savedChecklist) {
        setDailyChecklist(JSON.parse(savedChecklist));
      } else {
        setDailyChecklist({});
      }

      if (savedTwoWeekPlan) {
        setTwoWeekWorkoutPlan(JSON.parse(savedTwoWeekPlan));
      } else {
        const defaultTwoWeek = {
          week1: DEFAULT_WEEKLY_WORKOUTS,
          week2: generateDefaultWeek2Workouts()
        };
        setTwoWeekWorkoutPlan(defaultTwoWeek);
        localStorage.setItem('aura_two_week_workout_plan', JSON.stringify(defaultTwoWeek));
      }

      const savedTwoWeekMealPlan = localStorage.getItem('aura_two_week_meal_plan');
      if (savedTwoWeekMealPlan) {
        setTwoWeekMealPlan(JSON.parse(savedTwoWeekMealPlan));
      } else {
        const defaultTwoWeekMeals = {
          week1: DEFAULT_WEEKLY_MEALS,
          week2: generateDefaultWeek2Meals()
        };
        setTwoWeekMealPlan(defaultTwoWeekMeals);
        localStorage.setItem('aura_two_week_meal_plan', JSON.stringify(defaultTwoWeekMeals));
      }

      // โหลดและดึงค่าสถิติมวลร่างกายล่าสุด
      const savedUserStats = localStorage.getItem('aura_user_stats');
      if (savedUserStats) {
        const stats = JSON.parse(savedUserStats);
        setUserWeight(stats.currentWeight ? String(stats.currentWeight) : '');
        setUserBodyFat(stats.currentBodyFat ? String(stats.currentBodyFat) : '');
        setUserMuscle(stats.currentMuscleMass ? String(stats.currentMuscleMass) : '');
      } else if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserWeight(profile.weight ? String(profile.weight) : '');
        setUserBodyFat('20');
        setUserMuscle('30');
      }
    } catch (e) {
      console.warn('Failed to load storage data:', e);
      setWeeklyMeals(DEFAULT_WEEKLY_MEALS);
      setCompletedExercises({});
      setWaterIntake({});
      setWeightHistory([]);
      setDailyChecklist({});
      setTwoWeekWorkoutPlan({
        week1: DEFAULT_WEEKLY_WORKOUTS,
        week2: DEFAULT_WEEKLY_WORKOUTS
      });
      setTwoWeekMealPlan({
        week1: DEFAULT_WEEKLY_MEALS,
        week2: DEFAULT_WEEKLY_MEALS
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // บันทึกโปรไฟล์สุขภาพ
  const handleSaveProfile = (profile: ProfileData) => {
    setUserProfile(profile);
    localStorage.setItem('aura_user_profile', JSON.stringify(profile));
    setShowCalculatorForm(false);

    // บันทึกน้ำหนักเข้าประวัติสำหรับวันนี้อัตโนมัติ
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}`;
    
    // ตรวจหาประวัติซ้ำในวันเดียวกัน
    const updatedHistory = weightHistory.filter(h => h.date !== dateStr);
    updatedHistory.push({ date: dateStr, weight: profile.weight });
    const trimmedHistory = updatedHistory.slice(-7); // เก็บสูงสุด 7 วัน
    
    setWeightHistory(trimmedHistory);
    localStorage.setItem('aura_weight_history', JSON.stringify(trimmedHistory));

    alert('บันทึกข้อมูลและคำนวณแคลอรีเป้าหมายประจำวันเรียบร้อยแล้ว!');
  };

  // บันทึกน้ำหนักเพิ่ม
  const handleAddWeight = (weightVal: number) => {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}`;
    
    const updatedHistory = weightHistory.filter(h => h.date !== dateStr);
    updatedHistory.push({ date: dateStr, weight: weightVal });
    const trimmedHistory = updatedHistory.slice(-7);
    
    setWeightHistory(trimmedHistory);
    localStorage.setItem('aura_weight_history', JSON.stringify(trimmedHistory));

    // อัปเดตน้ำหนักในโปรไฟล์สุขภาพด้วย
    if (userProfile) {
      const updatedProfile = { ...userProfile, weight: weightVal };
      // คำนวณ BMI ใหม่
      const heightInMeters = updatedProfile.height / 100;
      updatedProfile.bmi = parseFloat((weightVal / (heightInMeters * heightInMeters)).toFixed(1));
      
      setUserProfile(updatedProfile);
      localStorage.setItem('aura_user_profile', JSON.stringify(updatedProfile));
    }
  };

  // บันทึกและคำนวณสถิติมวลร่างกายจากหน้าหลัก
  const handleSaveStatsFromDashboard = () => {
    const weightVal = parseFloat(userWeight);
    const fatVal = parseFloat(userBodyFat);
    const muscleVal = parseFloat(userMuscle);

    if (isNaN(weightVal) || isNaN(fatVal) || isNaN(muscleVal)) {
      alert('กรุณากรอกข้อมูลร่างกายให้ถูกต้องครบถ้วนครับ');
      return;
    }

    try {
      const savedUserStats = localStorage.getItem('aura_user_stats');
      let baseStats = {
        id: 'user',
        name: 'ตัวคุณเอง',
        avatar: '⭐️',
        team: 'lose' as const,
        initialWeight: weightVal,
        currentWeight: weightVal,
        initialBodyFat: fatVal,
        currentBodyFat: fatVal,
        initialMuscleMass: muscleVal,
        currentMuscleMass: muscleVal,
        workoutCompletion: 80,
        mealCompletion: 75,
      };

      if (savedUserStats) {
        baseStats = {
          ...baseStats,
          ...JSON.parse(savedUserStats),
          currentWeight: weightVal,
          currentBodyFat: fatVal,
          currentMuscleMass: muscleVal,
        };
      } else if (userProfile) {
        baseStats.team = (userProfile.goal === 'fat-loss' ? 'lose' : userProfile.goal === 'muscle-gain' ? 'gain' : 'maintain') as any;
        baseStats.initialWeight = userProfile.weight || weightVal;
        baseStats.initialBodyFat = fatVal;
        baseStats.initialMuscleMass = muscleVal;
      }

      localStorage.setItem('aura_user_stats', JSON.stringify(baseStats));

      // บันทึกน้ำหนักและจำลองลงกราฟน้ำหนักของวันนี้ด้วย
      handleAddWeight(weightVal);

      alert('📊 อัปเดตมวลร่างกายและคำนวณคะแนนศักยภาพจัดอันดับใหม่เรียบร้อยแล้ว!');
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // อัปเดตอาหารรายวัน
  const handleUpdateMeal = (mealIndex: number, meal: Meal) => {
    if (twoWeekMealPlan) {
      const updatedPlan = { ...twoWeekMealPlan };
      if (!updatedPlan[activeWeek]) {
        updatedPlan[activeWeek] = {};
      }
      if (!updatedPlan[activeWeek][activeDay]) {
        updatedPlan[activeWeek][activeDay] = [null, null, null, null];
      }
      updatedPlan[activeWeek][activeDay][mealIndex] = meal;
      setTwoWeekMealPlan(updatedPlan);
      try {
        localStorage.setItem('aura_two_week_meal_plan', JSON.stringify(updatedPlan));
      } catch (e) {}
    } else {
      const updatedMeals = { ...weeklyMeals };
      if (!updatedMeals[activeDay]) {
        updatedMeals[activeDay] = [null, null, null, null];
      }
      updatedMeals[activeDay][mealIndex] = meal;
      setWeeklyMeals(updatedMeals);
      try {
        localStorage.setItem('aura_weekly_meals', JSON.stringify(updatedMeals));
      } catch (e) {}
    }
  };

  // อัปเดตการออกกำลังกาย (Toggle)
  const handleToggleExercise = (exerciseName: string) => {
    const updatedExercises = { ...completedExercises };
    const compKey = `${activeWeek}_${activeDay}`;
    if (!updatedExercises[compKey]) {
      updatedExercises[compKey] = [];
    }

    const currentList = updatedExercises[compKey];
    if (currentList.includes(exerciseName)) {
      updatedExercises[compKey] = currentList.filter((name) => name !== exerciseName);
    } else {
      updatedExercises[compKey] = [...currentList, exerciseName];
    }

    setCompletedExercises(updatedExercises);
    try {
      localStorage.setItem('aura_completed_exercises_v2', JSON.stringify(updatedExercises));
    } catch (e) {}
  };

  // เซฟตารางรวมเป้าหมายเป็นรูปภาพ PNG ประจำสัปดาห์
  const handleSaveScheduleAsImage = () => {
    if (Platform.OS !== 'web') {
      alert('ฟังก์ชันนี้รองรับการใช้งานบนเว็บบราวเซอร์เท่านั้นครับ');
      return;
    }

    try {
      const activeWorkout = twoWeekWorkoutPlan?.[activeWeek] || DEFAULT_WEEKLY_WORKOUTS;
      const activeMeals = twoWeekMealPlan?.[activeWeek] || DEFAULT_WEEKLY_MEALS;
      
      const canvas = document.createElement('canvas');
      const width = 1350;
      const padding = 50;
      const headerHeight = 150;
      const rowHeight = 190;
      const rowGap = 15;
      const footerHeight = 90;
      
      const daysList = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
      
      const height = padding * 2 + headerHeight + (rowHeight + rowGap) * 7 + footerHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('ไม่สามารถสร้างรูปภาพได้ในบราวเซอร์ของคุณ');
        return;
      }
      
      // 1. วาดพื้นหลัง ไล่เฉดสีขาว-น้ำเงินหรูหรา
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#EFF6FF');
      bg.addColorStop(0.5, '#FFFFFF');
      bg.addColorStop(1, '#EFF6FF');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      
      // 2. วาดหัวข้อหลัก (Header)
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 38px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`AuraHealth — ตารางอาหารและออกกำลังกายประจำสัปดาห์`, padding, padding + 45);
      
      ctx.fillStyle = '#475569';
      ctx.font = '600 22px Arial';
      ctx.fillText(`แผนดูแลสุขภาพรายบุคคลสำหรับ: ${activeWeek === 'week1' ? 'สัปดาห์ที่ 1 (วันที่ 1-7)' : 'สัปดาห์ที่ 2 (วันที่ 8-14)'}`, padding, padding + 85);
      
      // วาดเส้นแบ่งหัวข้อ
      ctx.strokeStyle = '#BFDBFE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 115);
      ctx.lineTo(width - padding, padding + 115);
      ctx.stroke();
      
      // แผนผังสีประจำวันของไทย
      const dayColorMap: Record<string, { label: string; text: string; bg: string }> = {
        'จันทร์': { label: '#EAB308', text: '#FFFFFF', bg: '#FEFCE8' },
        'อังคาร': { label: '#EC4899', text: '#FFFFFF', bg: '#FDF2F8' },
        'พุธ': { label: '#22C55E', text: '#FFFFFF', bg: '#F0FDF4' },
        'พฤหัสบดี': { label: '#F97316', text: '#FFFFFF', bg: '#FFF7ED' },
        'ศุกร์': { label: '#0EA5E9', text: '#FFFFFF', bg: '#F0F9FF' },
        'เสาร์': { label: '#A855F7', text: '#FFFFFF', bg: '#FAF5FF' },
        'อาทิตย์': { label: '#EF4444', text: '#FFFFFF', bg: '#FEF2F2' },
      };
      
      let y = padding + headerHeight;
      
      daysList.forEach((dayName) => {
        const colors = dayColorMap[dayName] || { label: '#3B82F6', text: '#FFFFFF', bg: '#F8FAFC' };
        
        // วาดการ์ดพื้นหลังของแถบวัน
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(30, 64, 175, 0.05)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        
        // วาดโค้งการ์ดหลัก
        ctx.beginPath();
        ctx.roundRect(padding, y, width - padding * 2, rowHeight, 16);
        ctx.fill();
        
        // กรอบการ์ดบางๆ
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(padding, y, width - padding * 2, rowHeight, 16);
        ctx.stroke();
        
        // เคลียร์ shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // --- ส่วนที่ 1: ป้ายวัน (Left Column) ---
        const badgeX = padding + 20;
        const badgeY = y + 25;
        const badgeW = 120;
        const badgeH = 46;
        
        ctx.fillStyle = colors.label;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
        ctx.fill();
        
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dayName, badgeX + badgeW / 2, badgeY + badgeH / 2);
        
        // --- ส่วนที่ 2: ออกกำลังกาย (Middle Column) ---
        const workoutData = activeWorkout[dayName];
        const workoutX = padding + 170;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        if (workoutData) {
          ctx.fillStyle = '#1E3A8A';
          ctx.font = 'bold 22px Arial';
          ctx.fillText(`💪 ${workoutData.workoutTitle}`, workoutX, y + 25);
          
          ctx.fillStyle = '#64748B';
          ctx.font = '500 15px Arial';
          ctx.fillText(`จุดเน้น: ${workoutData.workoutFocus}`, workoutX, y + 60);
          
          // วาดรายการท่าฝึก
          ctx.fillStyle = '#334155';
          ctx.font = '15px Arial';
          const exercises = workoutData.exercises || [];
          if (exercises.length === 0) {
            ctx.fillStyle = '#94A3B8';
            ctx.font = 'italic 16px Arial';
            ctx.fillText('😴 วันพักผ่อนและยืดเหยียดฟื้นฟูกล้ามเนื้อ', workoutX, y + 100);
          } else {
            exercises.forEach((ex: any, idx: number) => {
              if (idx < 3) {
                ctx.fillText(`• ${ex.name} (${ex.sets} เซ็ต x ${ex.reps})`, workoutX, y + 95 + idx * 26);
              }
            });
            if (exercises.length > 3) {
              ctx.fillStyle = '#94A3B8';
              ctx.fillText(`• และท่าอื่นๆ อีก ${exercises.length - 3} ท่า...`, workoutX, y + 95 + 3 * 26);
            }
          }
        }
        
        // --- ส่วนที่ 3: ตารางอาหาร (Right Column) ---
        const dayMeals = activeMeals[dayName] || [];
        const mealsX = padding + 680;
        
        ctx.fillStyle = '#065F46';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('🥗 โภชนาการอาหารเพื่อสุขภาพ', mealsX, y + 25);
        
        const dayCalories = dayMeals.reduce((sum: number, m: any) => sum + (m ? m.calories : 0), 0);
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`พลังงานรวมวันนี้: ${dayCalories} kcal`, mealsX, y + 60);
        
        // วาดเมนู 4 มื้อ
        ctx.fillStyle = '#334155';
        ctx.font = '15px Arial';
        const mealLabels = ['เช้า', 'กลางวัน', 'เย็น', 'ของว่าง'];
        
        mealLabels.forEach((label, idx) => {
          const meal = dayMeals[idx];
          const textY = y + 95 + idx * 21;
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(`[${label}]`, mealsX, textY);
          
          ctx.fillStyle = '#1E293B';
          ctx.font = '14px Arial';
          if (meal) {
            ctx.fillText(` ${meal.name} (${meal.calories} kcal)`, mealsX + 65, textY);
          } else {
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(' ยังไม่ระบุเมนูอาหาร', mealsX + 65, textY);
          }
        });
        
        y += rowHeight + rowGap;
      });
      
      // 3. วาดข้อความท้ายรูปภาพ (Footer)
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('จัดทำโดยแอปวางแผนสุขภาพ AuraHealth Planner', padding, height - padding / 2);
      
      ctx.textAlign = 'right';
      ctx.fillText(`บันทึกเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, width - padding, height - padding / 2);
      
      // 4. สั่งดาวน์โหลด
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AuraHealth_Combined_Plan_${activeWeek}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert('📸 บันทึกตารางรวมสุขภาพเป็นไฟล์รูปภาพ PNG สำเร็จแล้ว!');
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเซฟรูปภาพ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // เพิ่มน้ำดื่ม
  const handleAddWater = (amount: number) => {
    const updatedWater = { ...waterIntake };
    const currentWater = updatedWater[activeDay] || 0;
    updatedWater[activeDay] = currentWater + amount;
    setWaterIntake(updatedWater);
    try {
      localStorage.setItem('aura_water_intake', JSON.stringify(updatedWater));
    } catch (e) {}

    // อัปเดตเช็คลิสต์เมื่อดื่มน้ำครบ 2,000 มล.
    if (currentWater + amount >= 2000) {
      updateChecklistItem('water', true);
    }
  };

  // รีเซ็ตน้ำดื่ม
  const handleResetWater = () => {
    const updatedWater = { ...waterIntake };
    updatedWater[activeDay] = 0;
    setWaterIntake(updatedWater);
    try {
      localStorage.setItem('aura_water_intake', JSON.stringify(updatedWater));
    } catch (e) {}
    updateChecklistItem('water', false);
  };

  // อัปเดตเช็คลิสต์รายวัน
  const handleToggleChecklist = (taskId: string) => {
    const dayCheck = dailyChecklist[activeDay] || {};
    const updatedDayCheck = { ...dayCheck, [taskId]: !dayCheck[taskId] };
    
    const updatedChecklist = { ...dailyChecklist, [activeDay]: updatedDayCheck };
    setDailyChecklist(updatedChecklist);
    try {
      localStorage.setItem('aura_daily_checklist', JSON.stringify(updatedChecklist));
    } catch (e) {}
  };

  // ฟังก์ชันช่วยเหลือสำหรับปรับค่าเช็คลิสต์อัตโนมัติ (เช่น ดื่มน้ำครบ)
  const updateChecklistItem = (taskId: string, status: boolean) => {
    const dayCheck = dailyChecklist[activeDay] || {};
    const updatedDayCheck = { ...dayCheck, [taskId]: status };
    
    const updatedChecklist = { ...dailyChecklist, [activeDay]: updatedDayCheck };
    setDailyChecklist(updatedChecklist);
    try {
      localStorage.setItem('aura_daily_checklist', JSON.stringify(updatedChecklist));
    } catch (e) {}
  };

  // คำนวณสรุปผลโภชนาการประจำวัน
  const currentMeals = twoWeekMealPlan?.[activeWeek]?.[activeDay] || weeklyMeals[activeDay] || [null, null, null, null];
  const totalCalories = currentMeals.reduce((sum: number, meal: any) => sum + (meal ? meal.calories : 0), 0);
  const currentWater = waterIntake[activeDay] || 0;
  const targetCalories = userProfile?.targetCalories || 2000;

  // คำนวณความคืบหน้าออกกำลังกาย
  const currentWorkoutPlan = twoWeekWorkoutPlan?.[activeWeek]?.[activeDay] || DEFAULT_WEEKLY_WORKOUTS[activeDay];
  const totalExercises = currentWorkoutPlan?.exercises?.length || 0;
  const completedCount = currentWorkoutPlan?.exercises
    ? currentWorkoutPlan.exercises.filter((ex: any) =>
        (completedExercises[`${activeWeek}_${activeDay}`] || []).includes(ex.name)
      ).length
    : 0;

  const workoutProgressPercent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 100;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลโภชนาการและการฝึกของคุณ...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* แผงควบคุมสัปดาห์และการเซฟตาราง */}
        <View style={styles.globalControlCard}>
          <View style={styles.globalControlRow}>
            <View style={styles.globalWeekSelector}>
              <Pressable
                style={[styles.globalWeekBtn, activeWeek === 'week1' && styles.globalWeekBtnActive]}
                onPress={() => setActiveWeek('week1')}
              >
                <Text style={[styles.globalWeekBtnText, activeWeek === 'week1' && styles.globalWeekBtnTextActive]}>
                  📅 สัปดาห์ที่ 1
                </Text>
              </Pressable>
              <Pressable
                style={[styles.globalWeekBtn, activeWeek === 'week2' && styles.globalWeekBtnActive]}
                onPress={() => setActiveWeek('week2')}
              >
                <Text style={[styles.globalWeekBtnText, activeWeek === 'week2' && styles.globalWeekBtnTextActive]}>
                  📅 สัปดาห์ที่ 2
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.globalSaveImageBtn}
              onPress={handleSaveScheduleAsImage}
            >
              <Text style={styles.globalSaveImageBtnText}>📸 เซฟตารางเป็นรูปภาพ</Text>
            </Pressable>

            <Pressable
              style={styles.globalRankingBtn}
              onPress={() => router.push('/ranking')}
            >
              <Text style={styles.globalRankingBtnText}>🏆 จัดอันดับคะแนนทีม</Text>
            </Pressable>
          </View>
        </View>

        {/* แถบเลือกวันในสัปดาห์ */}
        <View style={styles.daySelectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabScroll}>
            {DAYS_OF_WEEK.map((day) => {
              const isActive = activeDay === day;
              return (
                <Pressable
                  key={day}
                  style={[styles.dayTab, isActive && styles.dayTabActive]}
                  onPress={() => setActiveDay(day)}
                >
                  <Text style={[styles.dayTabText, isActive && styles.dayTabTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* แผงสถิติ & ข้อมูลด่วนวันนี้ */}
        <StatsGrid
          totalCalories={totalCalories}
          targetCalories={targetCalories}
          waterIntake={currentWater}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
          workoutProgressPercent={workoutProgressPercent}
        />

        {/* จัดวาง Dashboard เป็น 3 คอลัมน์สำหรับหน้าเว็บ (Responsive Grid Layout) */}
        <View style={styles.dashboardGridContainer}>
          
          {/* คอลัมน์ที่ 1: ข้อมูลสุขภาพส่วนตัว & เช็คลิสต์ */}
          <View style={styles.gridColumn}>
            {showCalculatorForm ? (
              <HealthCalculator onSaveProfile={handleSaveProfile} savedProfile={userProfile} />
            ) : (
              <View style={styles.card}>
                <View style={styles.profileSummaryHeader}>
                  <Text style={styles.columnTitle}>👤 ข้อมูลร่างกายของคุณ</Text>
                  <Pressable style={styles.editBtn} onPress={() => setShowCalculatorForm(true)}>
                    <Text style={styles.editBtnText}>แก้ไขข้อมูล</Text>
                  </Pressable>
                </View>

                {userProfile && (
                  <View style={styles.profileSummaryContent}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>เป้าหมายหลัก:</Text>
                      <Text style={styles.summaryValue}>
                        {GOALS.find(g => g.id === userProfile.goal)?.title || userProfile.goal}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>ดัชนีมวลกาย (BMI):</Text>
                      <Text style={[styles.summaryValue, styles.bold]}>{userProfile.bmi}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>BMR / TDEE:</Text>
                      <Text style={styles.summaryValue}>
                        {userProfile.bmr} / {userProfile.tdee} kcal
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>แคลอรีเป้าหมาย:</Text>
                      <Text style={[styles.summaryValue, styles.primaryText]}>
                        {userProfile.targetCalories} kcal
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* การ์ดเช็คลิสต์ภารกิจรายวัน */}
            <ChecklistCard
              dailyChecklist={dailyChecklist[activeDay] || {}}
              onToggleChecklist={handleToggleChecklist}
            />
          </View>

          {/* คอลัมน์ที่ 2: ตารางโภชนาการอาหารรายวัน */}
          <View style={styles.gridColumn}>
            {/* ส่วนควบคุมตารางอาหาร 2 สัปดาห์ */}
            <View style={[styles.workoutPlanHeaderCard, styles.mealPlanHeaderCard]}>
              <View style={styles.workoutHeaderRow}>
                <Text style={styles.workoutSectionHeader}>🥗 ตารางอาหารประจำวัน</Text>
                <Pressable
                  style={styles.designMealPlanBtn}
                  onPress={() => router.push('/meal-planner')}
                >
                  <Text style={styles.designMealPlanBtnText}>🎯 ออกแบบตารางอาหาร</Text>
                </Pressable>
              </View>
            </View>

            <MealGrid currentMeals={currentMeals} onUpdateMeal={handleUpdateMeal} />
          </View>

          {/* คอลัมน์ที่ 3: กราฟแท่งแนวโน้มน้ำหนักตัว & ตารางการออกกำลังกาย */}
          <View style={styles.gridColumn}>
            {/* กราฟน้ำหนักตัวและบันทึกมวลร่างกาย */}
            <WeightChart
              weightHistory={weightHistory}
              weight={userWeight}
              bodyFat={userBodyFat}
              muscle={userMuscle}
              onChangeWeight={setUserWeight}
              onChangeBodyFat={setUserBodyFat}
              onChangeMuscle={setUserMuscle}
              onUpdateStats={handleSaveStatsFromDashboard}
            />

            {/* ส่วนควบคุมตารางออกกำลังกาย 2 สัปดาห์ */}
            <View style={styles.workoutPlanHeaderCard}>
              <View style={styles.workoutHeaderRow}>
                <Text style={styles.workoutSectionHeader}>🏋️ ตารางฝึกซ้อมประจำวัน</Text>
                <Pressable
                  style={styles.designPlanBtn}
                  onPress={() => router.push('/workout-planner')}
                >
                  <Text style={styles.designPlanBtnText}>🎯 ออกแบบตาราง 2 สัปดาห์</Text>
                </Pressable>
              </View>
            </View>

            {/* ตารางออกกำลังกาย */}
            <WorkoutGrid
              currentWorkoutPlan={currentWorkoutPlan}
              completedExercises={completedExercises[`${activeWeek}_${activeDay}`] || []}
              onToggleExercise={handleToggleExercise}
            />
          </View>

        </View>
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
    maxWidth: 1280,
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
    fontWeight: '700',
    color: '#64748B',
  },
  daySelectorWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  dayTabScroll: {
    gap: 8,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  dayTabActive: {
    backgroundColor: '#2563EB',
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  dashboardGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    width: '100%',
  },
  gridColumn: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 380 : '100%',
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
    marginBottom: 20,
  },
  profileSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  profileSummaryContent: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  bold: {
    fontWeight: '800',
  },
  primaryText: {
    color: '#2563EB',
    fontWeight: '800',
  },
  workoutPlanHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
    gap: 12,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  designPlanBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  designPlanBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  weekSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  weekSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  weekSelectBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  weekSelectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  weekSelectBtnTextActive: {
    color: '#2563EB',
  },
  mealPlanHeaderCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#FFFFFF',
  },
  designMealPlanBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  designMealPlanBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  saveImageBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  saveImageBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  globalControlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
    width: '100%',
  },
  globalControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  globalWeekSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    minWidth: Platform.OS === 'web' ? 280 : '100%',
  },
  globalWeekBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 9,
  },
  globalWeekBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  globalWeekBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  globalWeekBtnTextActive: {
    color: '#2563EB',
  },
  globalSaveImageBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'web' ? 260 : '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  globalSaveImageBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  globalRankingBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'web' ? 240 : '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  globalRankingBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  compactStatsInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 10,
  },
  compactInputCol: {
    flex: 1,
    gap: 4,
  },
  compactInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  compactTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    outlineStyle: 'none',
  } as any,
  compactSaveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSaveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
