import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

// ข้อมูลสำหรับใช้งานคัดกรองการออกกำลังกาย
const UPPER_BODY_POOL = [
  { name: 'Push-ups (วิดพื้น)', description: 'บริหารอก ไหล่ และหลังแขน' },
  { name: 'Tricep Dips (ดิปส์กับเก้าอี้)', description: 'สร้างความแข็งแรงของต้นแขนด้านหลัง' },
  { name: 'Superman Hold (ท่าซุปเปอร์แมน)', description: 'บริหารแผ่นหลังส่วนล่างและบ่ากระชับหลัง' },
  { name: 'Shoulder Taps (แตะบ่าสลับข้าง)', description: 'ฝึกแกนกลางลำตัวและการทรงตัวของหัวไหล่' },
  { name: 'Arm Circles (หมุนแขน)', description: 'เพิ่มความกระชับและยืดหยุ่นรอบข้อไหล่' },
  { name: 'Plank Shoulder Taps', description: 'แพลงก์แล้วยกมือแตะไหล่สลับข้าง' },
];

const LOWER_BODY_POOL = [
  { name: 'Bodyweight Squats (สควอท)', description: 'สร้างกล้ามเนื้อต้นขา ก้น และสะโพก' },
  { name: 'Lunges (ย่อขาก้าวเดิน)', description: 'เสริมความทนทานของหน้าขาและสะโพกทีละข้าง' },
  { name: 'Glute Bridges (ยกสะโพกดันก้น)', description: 'กระชับกล้ามเนื้อก้น หลังขา และหลังส่วนล่าง' },
  { name: 'Calf Raises (เขย่งข้อเท้า)', description: 'ฝึกน่องและข้อเท้าให้แข็งแรงและมั่นคง' },
  { name: 'Sumo Squats (ซูโม่สควอท)', description: 'เน้นกระชับต้นขาด้านในและก้นย้อย' },
  { name: 'Wall Sit (นั่งพิงกำแพงเกร็งขา)', description: 'สร้างความทนทานแบบเกร็งค้างให้กล้ามเนื้อขา' },
];

const CORE_POOL = [
  { name: 'Plank Hold (เกร็งแพลงก์)', description: 'ฝึกความแข็งแรงกล้ามเนื้อแกนกลางลำตัวทั้งหมด' },
  { name: 'Bicycle Crunches (ถีบจักรยาน)', description: 'ลดไขมันหน้าท้องส่วนล่างและเอวด้านข้าง' },
  { name: 'Russian Twists (บิดตัวเกร็งส้น)', description: 'บริหารกล้ามเนื้อเอวด้านข้างและหน้าท้องเฉียง' },
  { name: 'Flutter Kicks (เตะขาสลับยิงหน้าท้อง)', description: 'กระชับหน้าท้องส่วนล่างและกล้ามเนื้อพับสะโพก' },
  { name: 'Bird Dog (ยืดแขนขาแกนกลาง)', description: 'สร้างความแข็งแรงหลังและแกนกลางแบบปลอดภัยสูง' },
  { name: 'Dead Bug (นอนเกร็งท้อง)', description: 'ฝึกความเสถียรของหน้าท้องโดยไม่มีแรงกดทับหลัง' },
];

const CARDIO_POOL = [
  { name: 'Jumping Jacks (กระโดดตบ)', description: 'กระตุ้นอัตราการเต้นหัวใจและเริ่มการเผาผลาญ' },
  { name: 'Mountain Climbers (ปีนเขา)', description: 'คาร์ดิโอกระตุ้นชีพจรพร้อมกระชับหน้าท้อง' },
  { name: 'High Knees (วิ่งยกเข่าสูง)', description: 'กระตุ้นการเผาผลาญไขมันและเพิ่มความแข็งแรงของขา' },
  { name: 'Burpees (เบอร์พีปราบเซียน)', description: 'ออกกำลังกายแบบองค์รวมระดับความเข้มข้นสูง' },
  { name: 'Skater Hops (สเก็ตเตอร์แดนซ์)', description: 'ฝึกการระเบิดพลังด้านข้างและเผาผลาญไขมันสะสม' },
];

const RECOVERY_POOL = [
  { name: 'Cat-Cow Stretch (ยืดหลังท่าแมว)', description: 'ยืดเหยียดผ่อนคลายกระดูกสันหลังและเอว' },
  { name: 'Child\'s Pose (ท่าเด็กหมอบ)', description: 'ยืดคลายความตึงสะโพก หลัง และบ่าไหล่' },
  { name: 'Cobra Stretch (ท่าคอบร้าแก้งัว)', description: 'เปิดทรวงอกและยืดกล้ามเนื้อหน้าท้อง' },
  { name: 'Hamstring Stretch (ยืดหลังขาพับ)', description: 'ยืดเหยียดใต้เข่าและหลังส่วนล่าง' },
  { name: 'Chest Opener (ยืดหน้าอกพาดผนัง)', description: 'ลดความล้าของกล้ามเนื้ออกและบ่าหลังจากนั่งนาน' },
];

export default function WorkoutPlannerScreen() {
  const router = useRouter();
  
  // ฟอร์มกรอกข้อมูล
  const [selectedTime, setSelectedTime] = useState<number>(30);
  const [bodyType, setBodyType] = useState<'ectomorph' | 'mesomorph' | 'endomorph'>('mesomorph');
  const [goal, setGoal] = useState<'gain' | 'maintain' | 'lose'>('maintain');
  const [medicalCondition, setMedicalCondition] = useState<string>('');
  
  // สถานะระหว่างดำเนินการ
  const [showBodyTypeInfo, setShowBodyTypeInfo] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [previewWeek, setPreviewWeek] = useState<'week1' | 'week2'>('week1');

  // ข้อความแสดงสถานะโหลดบิลด์
  const loadingMessages = [
    '🤖 กำลังอ่านประวัติสุขภาพและวิเคราะห์ข้อมูลส่วนตัวของคุณ...',
    '🛡️ ตรวจสอบโรคประจำตัวและคัดเลือกท่าออกกำลังกายที่ปลอดภัยที่สุด...',
    '⚡ ออกแบบความหนักเบาของท่าฝึกให้ตรงตามเป้าหมาย (Progression)...',
    '📅 จัดตารางฝึกแบบไล่ระดับความท้าทาย สัปดาห์ที่ 1 และสัปดาห์ที่ 2...',
    '✨ ตกแต่งตารางออกกำลังกายให้ลงตัวเรียบร้อยแล้ว!'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            // แสดงหน้าตารางที่สร้างเสร็จ
            setTimeout(() => {
              const plan = generatePlanLogic();
              setGeneratedPlan(plan);
              setIsGenerating(false);
            }, 500);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // ตรรกะคัดกรองและสุ่มท่าออกกำลังกายอัจฉริยะในฝั่งไคลเอนต์ (14 วัน)
  const generatePlanLogic = () => {
    const hasKneeIssue = /เข่า|ข้อ|knee|leg|ขา/i.test(medicalCondition);
    const hasBackIssue = /หลัง|เอว|back|spine|waist/i.test(medicalCondition);

    // กรองท่าออกกำลังกายที่ปลอดภัย
    const filterSafe = (pool: typeof UPPER_BODY_POOL, isKneeSafe: boolean, isBackSafe: boolean) => {
      return pool.filter(ex => {
        const name = ex.name.toLowerCase();
        // ท่าที่ต้องระวังเรื่องเข่า
        if (hasKneeIssue && !isKneeSafe) {
          if (/squat|lunge|jump|burpee|knees|skater/i.test(name)) return false;
        }
        // ท่าที่ต้องระวังเรื่องหลัง
        if (hasBackIssue && !isBackSafe) {
          if (/burpee|twist|superman/i.test(name)) return false;
        }
        return true;
      });
    };

    const safeUpper = filterSafe(UPPER_BODY_POOL, true, true);
    const safeLower = filterSafe(LOWER_BODY_POOL, false, true);
    const safeCore = filterSafe(CORE_POOL, true, false);
    const safeCardio = filterSafe(CARDIO_POOL, false, false);
    const safeRecovery = filterSafe(RECOVERY_POOL, true, true);

    // กำหนดจำนวนท่า/เซ็ต/ครั้ง ตามเป้าหมายและเวลาว่าง
    let exerciseCount = 3;
    let sets = 3;
    let reps = '12-15 ครั้ง';

    if (selectedTime === 15) {
      exerciseCount = 2;
      sets = 2;
    } else if (selectedTime === 30) {
      exerciseCount = 3;
      sets = 3;
    } else if (selectedTime === 45) {
      exerciseCount = 4;
      sets = 3;
    } else if (selectedTime === 60) {
      exerciseCount = 5;
      sets = 4;
    }

    if (goal === 'gain') {
      reps = '8-12 ครั้ง (เน้นเพิ่มมวลกล้ามเนื้อ)';
      sets += 1; // เพิ่มเซ็ตเพื่อให้กล้ามเนื้อกระตุ้นมากขึ้น
    } else if (goal === 'lose') {
      reps = '15-20 ครั้ง หรือ 40 วินาที (คาร์ดิโอเบิร์นไขมัน)';
    } else {
      reps = '12-15 ครั้ง (ฝึกความทนทาน)';
    }

    // ฟังก์ชันช่วยสุ่มเลือกท่าออกกำลังกายแบบไม่ซ้ำ
    const pickExercises = (pool: any[], count: number, startIdx: number = 0) => {
      if (pool.length === 0) {
        // Fallback หากกรองแล้วไม่เหลือท่าเลย
        return [{ id: 'fallback', name: 'ยืดเหยียดกล้ามเนื้อส่วนรวม', sets: 3, reps: '30 วินาที', description: 'บริหารร่างกายเบาๆ แบบปลอดภัยสูง' }];
      }
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map((ex, i) => ({
        id: `ex_${Date.now()}_${startIdx}_${i}`,
        name: ex.name,
        sets: sets,
        reps: reps,
        description: ex.description,
      }));
    };

    // กำหนดโครงสร้างแต่ละวัน (สัปดาห์ที่ 1)
    const week1Days: Record<string, any> = {
      'จันทร์': {
        day: 'จันทร์',
        workoutTitle: goal === 'lose' ? 'Cardio Burn' : 'Upper Body Focus',
        workoutFocus: goal === 'lose' ? 'คาร์ดิโอกระตุ้นชีพจรเผาผลาญไขมันส่วนเกิน' : 'สร้างกล้ามเนื้ออก บ่า แขน และแผ่นหลัง',
        exercises: pickExercises(goal === 'lose' ? safeCardio : safeUpper, exerciseCount, 1),
      },
      'อังคาร': {
        day: 'อังคาร',
        workoutTitle: 'Lower Body Strength',
        workoutFocus: 'ฝึกกำลังขาและสะโพกให้เฟิร์มกระชับ',
        exercises: pickExercises(safeLower, exerciseCount, 2),
      },
      'พุธ': {
        day: 'พุธ',
        workoutTitle: 'Active Recovery',
        workoutFocus: 'ยืดเหยียดฟื้นฟูกล้ามเนื้อจากการฝึกหนัก',
        exercises: pickExercises(safeRecovery, 3, 3),
      },
      'พฤหัสบดี': {
        day: 'พฤหัสบดี',
        workoutTitle: 'Core & Stability',
        workoutFocus: 'กระชับหน้าท้องส่วนลึกและรอบลำตัวเพื่อการทรงตัวที่ดี',
        exercises: pickExercises(safeCore, exerciseCount, 4),
      },
      'ศุกร์': {
        day: 'ศุกร์',
        workoutTitle: goal === 'gain' ? 'Upper Body Blast' : 'Full Body Circuit',
        workoutFocus: 'ฝึกประสานกล้ามเนื้อรวมเพื่อการเบิร์นหรือสร้างกล้ามแบบจัดเต็ม',
        exercises: pickExercises([...safeUpper, ...safeCore].slice(0, 6), exerciseCount, 5),
      },
      'เสาร์': {
        day: 'เสาร์',
        workoutTitle: 'Cardio & Flexibility',
        workoutFocus: 'วิ่งจ๊อกกิ้งเบาๆ หรือยืดเหยียดเพื่อระบายความเมื่อยล้า',
        exercises: pickExercises(goal === 'lose' ? safeCardio : safeRecovery, Math.min(3, exerciseCount), 6),
      },
      'อาทิตย์': {
        day: 'อาทิตย์',
        workoutTitle: 'Rest Day',
        workoutFocus: 'นอนพักผ่อนเต็มที่เพื่อให้ร่างกายฟื้นฟูเนื้อเยื่อกล้ามเนื้อ',
        exercises: [],
      },
    };

    // กำหนดโครงสร้างสัปดาห์ที่ 2 (ต่างจากสัปดาห์ที่ 1 เพื่อสร้างความก้าวหน้าและการเปลี่ยนแปลง)
    const week2Days: Record<string, any> = {
      'จันทร์': {
        day: 'จันทร์',
        workoutTitle: goal === 'lose' ? 'HIIT Dynamic' : 'Upper Body Hypertrophy',
        workoutFocus: goal === 'lose' ? 'คาร์ดิโอรูปแบบสลับความเข้มข้น เพิ่มการเผาผลาญ 2 เท่า' : 'เพิ่มความก้าวหน้ากล้ามเนื้อท่อนบนด้วยเซ็ตที่เข้มข้นขึ้น',
        exercises: pickExercises(goal === 'lose' ? safeCardio : safeUpper, exerciseCount, 11),
      },
      'อังคาร': {
        day: 'อังคาร',
        workoutTitle: 'Lower Body Endurance',
        workoutFocus: 'เน้นเกร็งขาและก้นเพื่อสร้างความทนทานของข้อต่อ',
        exercises: pickExercises(safeLower, exerciseCount, 12),
      },
      'พุธ': {
        day: 'พุธ',
        workoutTitle: 'Active Recovery',
        workoutFocus: 'ผ่อนคลายกล้ามเนื้อเพื่อเตรียมซ้อมในวันถัดไป',
        exercises: pickExercises(safeRecovery, 3, 13),
      },
      'พฤหัสบดี': {
        day: 'พฤหัสบดี',
        workoutTitle: 'Core Strength & Abs',
        workoutFocus: 'เน้นแกนกลางแกร่งเพื่อลดอาการปวดหลังและเพิ่มแรงยกลำตัว',
        exercises: pickExercises(safeCore, exerciseCount, 14),
      },
      'ศุกร์': {
        day: 'ศุกร์',
        workoutTitle: 'Total Body Progression',
        workoutFocus: 'ท้าทายทุกสัดส่วนของร่างกายด้วยการยกระดับความเร็วขึ้น',
        exercises: pickExercises([...safeUpper, ...safeLower, ...safeCore], exerciseCount, 15),
      },
      'เสาร์': {
        day: 'เสาร์',
        workoutTitle: 'Light Recovery Walk',
        workoutFocus: 'ขยับร่างกายเบาๆ สลายไขมันแบบไม่มีแรงกระแทก',
        exercises: pickExercises(safeRecovery, Math.min(3, exerciseCount), 16),
      },
      'อาทิตย์': {
        day: 'อาทิตย์',
        workoutTitle: 'Rest Day',
        workoutFocus: 'สลายกรดแลคติก ดื่มน้ำ พักผ่อน ชาร์จพลังเต็มที่เพื่อสัปดาห์ใหม่',
        exercises: [],
      },
    };

    return {
      week1: week1Days,
      week2: week2Days,
    };
  };

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setLoadingStep(0);
  };

  // บันทึกตารางฝึก 2 สัปดาห์ลงในเครื่อง
  const handleSavePlan = () => {
    if (!generatedPlan) return;
    try {
      localStorage.setItem('aura_two_week_workout_plan', JSON.stringify(generatedPlan));
      
      // ล้างข้อมูลเช็คลิสต์การออกกำลังกายที่เคยติ๊กไว้ เพื่อเริ่มตารางใหม่
      localStorage.removeItem('aura_completed_exercises_v2');
      
      alert('🎉 บันทึกตารางออกกำลังกาย 2 สัปดาห์ลงในเครื่องเรียบร้อยแล้ว!');
      router.replace('/');
    } catch (e) {
      alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // เซฟตารางออกกำลังกายเป็นรูปภาพ PNG
  const handleSaveWorkoutPlanAsImage = () => {
    if (Platform.OS !== 'web') {
      alert('ฟังก์ชันนี้รองรับการใช้งานบนเว็บบราวเซอร์เท่านั้นครับ');
      return;
    }

    try {
      const activePlan = generatedPlan[previewWeek];
      const canvas = document.createElement('canvas');
      const width = 1050;
      const padding = 40;
      const headerHeight = 130;
      const rowHeight = 180;
      const rowGap = 12;
      const footerHeight = 80;
      const daysList = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
      const height = padding * 2 + headerHeight + (rowHeight + rowGap) * 7 + footerHeight;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('ไม่สามารถสร้างรูปภาพได้ในบราวเซอร์ของคุณ');
        return;
      }

      // 1. วาดพื้นหลัง ไล่เฉดสีขาว-น้ำเงินฝึกซ้อมหรูหรา
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#EFF6FF');
      bg.addColorStop(0.5, '#FFFFFF');
      bg.addColorStop(1, '#EFF6FF');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // 2. วาดหัวข้อหลัก (Header)
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`AuraHealth — ตารางฝึกซ้อมออกกำลังกายรายสัปดาห์`, padding, padding + 40);

      ctx.fillStyle = '#475569';
      ctx.font = '600 17px Arial';
      ctx.fillText(`แผนออกกำลังกายสำหรับ: ${previewWeek === 'week1' ? 'สัปดาห์ที่ 1' : 'สัปดาห์ที่ 2'} | เป้าหมาย: ${goal === 'gain' ? 'เพิ่มกล้ามเนื้อ' : goal === 'lose' ? 'ลดน้ำหนัก' : 'รักษาสุขภาพ'} (เวลา ${selectedTime} นาทีต่อวัน)`, padding, padding + 75);

      // วาดเส้นแบ่งหัวข้อ
      ctx.strokeStyle = '#BFDBFE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 100);
      ctx.lineTo(width - padding, padding + 100);
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

        // วาดการ์ดพื้นหลังแถบวัน
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(30, 64, 175, 0.04)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.roundRect(padding, y, width - padding * 2, rowHeight, 14);
        ctx.fill();

        // กรอบการ์ดบางๆ
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(padding, y, width - padding * 2, rowHeight, 14);
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // ป้ายวัน (Left)
        const badgeX = padding + 20;
        const badgeY = y + 20;
        const badgeW = 100;
        const badgeH = 40;

        ctx.fillStyle = colors.label;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
        ctx.fill();

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dayName, badgeX + badgeW / 2, badgeY + badgeH / 2);

        // หัวข้อการฝึกและจุดเน้น (กลาง)
        const dayData = activePlan[dayName];
        const infoX = padding + 150;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        if (dayData) {
          ctx.fillStyle = '#1E3A8A';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(`💪 ${dayData.workoutTitle}`, infoX, y + 20);

          ctx.fillStyle = '#64748B';
          ctx.font = '500 13px Arial';
          ctx.fillText(`จุดเน้น: ${dayData.workoutFocus}`, infoX, y + 50);

          // รายการท่าฝึก (ขวา)
          const exercisesX = padding + 480;
          ctx.fillStyle = '#334155';
          ctx.font = '14px Arial';

          const exercises = dayData.exercises || [];
          if (exercises.length === 0) {
            ctx.fillStyle = '#94A3B8';
            ctx.font = 'italic 15px Arial';
            ctx.fillText('😴 วันพักผ่อนและฟื้นฟูร่างกายอย่างเต็มที่', exercisesX, y + 30);
          } else {
            exercises.forEach((ex: any, idx: number) => {
              if (idx < 4) {
                ctx.fillStyle = '#1E293B';
                ctx.font = 'bold 13px Arial';
                ctx.fillText(`• ${ex.name}`, exercisesX, y + 20 + idx * 36);

                ctx.fillStyle = '#64748B';
                ctx.font = '11px Arial';
                ctx.fillText(`(${ex.sets} เซ็ต x ${ex.reps}) - ${ex.description}`, exercisesX + 15, y + 38 + idx * 36);
              }
            });
          }
        }

        y += rowHeight + rowGap;
      });

      // 3. วาดส่วนท้าย (Footer)
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 13px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('จัดทำโดยแอปวางแผนสุขภาพ AuraHealth Planner', padding, height - padding / 2);

      ctx.textAlign = 'right';
      ctx.fillText(`บันทึกเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, width - padding, height - padding / 2);

      // ดาวน์โหลดรูป
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AuraHealth_WorkoutPlan_${previewWeek}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert('📸 บันทึกตารางออกกำลังกายเป็นรูปภาพสำเร็จแล้ว!');
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const DAYS_OF_WEEK = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

  // หากอยู่ในหน้าสร้างตาราง (Loading)
  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingTitle}>กำลังประมวลผลตารางฝึกของคุณ...</Text>
        <Text style={styles.loadingSubtitle}>{loadingMessages[loadingStep]}</Text>
      </View>
    );
  }

  // หากอยู่ในหน้าพรีวิวตาราง (Preview Plan)
  if (generatedPlan) {
    const activePlan = generatedPlan[previewWeek];
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎯 พรีวิวตารางการฝึก 14 วันของคุณ</Text>
          <Text style={styles.headerSubtitle}>
            เป้าหมาย: {goal === 'gain' ? 'เพิ่มน้ำหนัก' : goal === 'lose' ? 'ลดน้ำหนัก' : 'รักษาสุขภาพ'} | 
            รูปร่าง: {bodyType.toUpperCase()}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* แถบสลับสัปดาห์ */}
          <View style={styles.weekTabWrapper}>
            <Pressable
              style={[styles.weekTab, previewWeek === 'week1' && styles.weekTabActive]}
              onPress={() => setPreviewWeek('week1')}
            >
              <Text style={[styles.weekTabText, previewWeek === 'week1' && styles.weekTabTextActive]}>
                สัปดาห์ที่ 1 (วันจันทร์ - อาทิตย์)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.weekTab, previewWeek === 'week2' && styles.weekTabActive]}
              onPress={() => setPreviewWeek('week2')}
            >
              <Text style={[styles.weekTabText, previewWeek === 'week2' && styles.weekTabTextActive]}>
                สัปดาห์ที่ 2 (วันจันทร์ - อาทิตย์)
              </Text>
            </Pressable>
          </View>

          {/* รายชื่อตารางในสัปดาห์ที่เลือก */}
          <View style={styles.previewList}>
            {DAYS_OF_WEEK.map((dayName) => {
              const dayData = activePlan[dayName];
              if (!dayData) return null;
              const hasExercises = dayData.exercises && dayData.exercises.length > 0;
              
              return (
                <View key={dayName} style={[styles.previewDayCard, !hasExercises && styles.previewRestCard]}>
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayBadge}>{dayName}</Text>
                    <Text style={[styles.dayTitle, !hasExercises && styles.restDayTitle]}>
                      {dayData.workoutTitle}
                    </Text>
                  </View>
                  <Text style={styles.dayFocus}>จุดเน้น: {dayData.workoutFocus}</Text>

                  {hasExercises ? (
                    <View style={styles.dayExList}>
                      {dayData.exercises.map((ex: any, i: number) => (
                        <View key={ex.id || i} style={styles.previewExItem}>
                          <Text style={styles.exDot}>•</Text>
                          <View style={styles.exDetail}>
                            <Text style={styles.exTextName}>{ex.name}</Text>
                            <Text style={styles.exTextInfo}>
                              {ex.sets} เซ็ต x {ex.reps} | <Text style={styles.exTextDesc}>{ex.description}</Text>
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.restDayText}>😴 ไม่มีรายการฝึกในวันนี้ - ให้ร่างกายพักผ่อนอย่างเต็มที่</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* ปุ่มบันทึกหรือกลับไปแก้ไข */}
          <View style={styles.btnRow}>
            <Pressable style={styles.backBtn} onPress={() => setGeneratedPlan(null)}>
              <Text style={styles.backBtnText}>ย้อนกลับไปแก้ไข</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, styles.saveBtnBlue]} onPress={handleSaveWorkoutPlanAsImage}>
              <Text style={styles.saveBtnText}>📸 เซฟรูปภาพตารางสัปดาห์นี้</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSavePlan}>
              <Text style={styles.saveBtnText}>💾 บันทึกและใช้ตารางนี้</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // แสดงหน้ากรอกฟอร์มเริ่มต้น (Form Input Screen)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 ออกแบบตารางออกกำลังกายส่วนบุคคล 2 สัปดาห์</Text>
        <Text style={styles.headerSubtitle}>
          ระบุเงื่อนไขของคุณเพื่อสร้างตารางฝึก 14 วันที่ปรับเปลี่ยนท่าตามสรีระและข้อจำกัดโดยอัตโนมัติ
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          
          {/* ส่วนที่ 1: เวลาว่างในการฝึกต่อวัน */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>⏱️ เวลาที่คุณว่างสำหรับออกกำลังกายต่อวัน</Text>
            <View style={styles.optionsRow}>
              {[15, 30, 45, 60].map((time) => (
                <Pressable
                  key={time}
                  style={[styles.optionButton, selectedTime === time && styles.optionButtonActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.optionButtonText, selectedTime === time && styles.optionButtonTextActive]}>
                    {time} นาที
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ส่วนที่ 2: รูปร่าง/ประเภทหุ่น */}
          <View style={styles.formSection}>
            <View style={styles.labelWithInfo}>
              <Text style={styles.sectionLabel}>🧍 ประเภทรูปร่างของคุณ (Body Type)</Text>
              <Pressable
                style={styles.infoIconWrapper}
                onPress={() => setShowBodyTypeInfo(!showBodyTypeInfo)}
              >
                <Text style={styles.infoIconText}>ⓘ วิธีดู</Text>
              </Pressable>
            </View>

            {showBodyTypeInfo && (
              <View style={styles.infoPanel}>
                <Text style={styles.infoPanelTitle}>📏 วิธีตรวจประเภทหุ่นง่ายๆ ด้วยขนาดข้อมือ</Text>
                <Text style={styles.infoPanelItem}>
                  <Text style={styles.boldText}>🔹 Ectomorph (ผอมบาง):</Text> รอบข้อมือน้อยกว่า 6 นิ้ว (โครงกระดูกเล็ก เพิ่มกล้ามเนื้อยาก เผาผลาญเร็วมาก)
                </Text>
                <Text style={styles.infoPanelItem}>
                  <Text style={styles.boldText}>🔹 Mesomorph (หุ่นสมส่วน):</Text> รอบข้อมือ 6 - 7 นิ้ว (สร้างกล้ามเนื้อได้ง่าย รูปร่างสมดุลแบบนักกีฬา)
                </Text>
                <Text style={styles.infoPanelItem}>
                  <Text style={styles.boldText}>🔹 Endomorph (เจ้าเนื้อ):</Text> รอบข้อมือมากกว่า 7 นิ้ว (โครงใหญ่ อ้วนง่าย เพิ่มกล้ามและไขมันง่าย เผาผลาญช้า)
                </Text>
              </View>
            )}

            <View style={styles.gridOptions}>
              <Pressable
                style={[styles.gridCard, bodyType === 'ectomorph' && styles.gridCardActive]}
                onPress={() => setBodyType('ectomorph')}
              >
                <Text style={styles.cardEmoji}>🏃</Text>
                <Text style={styles.cardTitle}>Ectomorph</Text>
                <Text style={styles.cardDesc}>ผอมบาง / หุ่นเพรียว</Text>
              </Pressable>

              <Pressable
                style={[styles.gridCard, bodyType === 'mesomorph' && styles.gridCardActive]}
                onPress={() => setBodyType('mesomorph')}
              >
                <Text style={styles.cardEmoji}>🏋️</Text>
                <Text style={styles.cardTitle}>Mesomorph</Text>
                <Text style={styles.cardDesc}>สมส่วน / มีกล้ามเนื้อ</Text>
              </Pressable>

              <Pressable
                style={[styles.gridCard, bodyType === 'endomorph' && styles.gridCardActive]}
                onPress={() => setBodyType('endomorph')}
              >
                <Text style={styles.cardEmoji}>🚴</Text>
                <Text style={styles.cardTitle}>Endomorph</Text>
                <Text style={styles.cardDesc}>โครงใหญ่ / เจ้าเนื้อ</Text>
              </Pressable>
            </View>
          </View>

          {/* ส่วนที่ 3: เป้าหมายหลัก */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🏁 เป้าหมายที่คุณต้องการโฟกัส</Text>
            <View style={styles.optionsRow}>
              {[
                { id: 'gain', label: 'เพิ่มกล้ามเนื้อ/น้ำหนัก' },
                { id: 'maintain', label: 'ฟิตร่างกาย/รักษาสุขภาพ' },
                { id: 'lose', label: 'ลดไขมัน/ลดน้ำหนัก' },
              ].map((g) => (
                <Pressable
                  key={g.id}
                  style={[styles.optionButton, goal === g.id && styles.optionButtonActive]}
                  onPress={() => setGoal(g.id as any)}
                >
                  <Text style={[styles.optionButtonText, goal === g.id && styles.optionButtonTextActive]}>
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ส่วนที่ 4: โรคประจำตัว / จุดที่ต้องระวังเป็นพิเศษ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>⚠️ โรคประจำตัว หรือจุดที่บาดเจ็บ/ต้องระวังเป็นพิเศษ</Text>
            <Text style={styles.helperText}>
              *ระบบจะกรองท่าที่เป็นอันตรายออก เช่น พิมพ์ "เจ็บเข่า" เพื่อเลี่ยงท่าสควอท/กระโดด หรือ "เจ็บหลัง" เพื่อเลี่ยงท่าก้ม/รับน้ำหนักหนัก
            </Text>
            <TextInput
              style={styles.textInput}
              value={medicalCondition}
              onChangeText={setMedicalCondition}
              placeholder="ระบุ เช่น ปวดหลัง, ข้อเท้าเคล็ด, ปวดเข่า (หากไม่มีให้ว่างไว้)"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.quickTags}>
              <Pressable
                style={[styles.tagButton, medicalCondition.includes('ปวดเข่า') && styles.tagButtonActive]}
                onPress={() => setMedicalCondition('ปวดเข่าและข้อต่อขา')}
              >
                <Text style={styles.tagText}>🤕 เจ็บเข่า / ลุกนั่งโอย</Text>
              </Pressable>
              <Pressable
                style={[styles.tagButton, medicalCondition.includes('ปวดหลัง') && styles.tagButtonActive]}
                onPress={() => setMedicalCondition('ปวดหลังส่วนล่าง')}
              >
                <Text style={styles.tagText}>脊 ปวดหลัง / ร้าวบ่า</Text>
              </Pressable>
              <Pressable
                style={styles.tagButton}
                onPress={() => setMedicalCondition('')}
              >
                <Text style={styles.tagText}>✅ แข็งแรงดี ไม่มีข้อจำกัด</Text>
              </Pressable>
            </View>
          </View>

          {/* ปุ่มทำรายการ */}
          <Pressable style={styles.generateBtn} onPress={handleStartGeneration}>
            <Text style={styles.generateBtnText}>⚡ สร้างตารางการฝึก 2 สัปดาห์ส่วนตัว</Text>
          </Pressable>

          {/* ปุ่มกดย้อนกลับหน้าแรก */}
          <Pressable style={styles.cancelLink} onPress={() => router.replace('/')}>
            <Text style={styles.cancelLinkText}>ย้อนกลับสู่หน้าภาพรวมหลัก</Text>
          </Pressable>
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
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 600,
  },
  formContainer: {
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
    gap: 24,
  },
  formSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  optionButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  optionButtonTextActive: {
    color: '#2563EB',
  },
  labelWithInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIconWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  infoPanel: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  infoPanelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoPanelItem: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
  },
  gridOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  gridCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  gridCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  textInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 13,
    color: '#1E293B',
    outlineStyle: 'none',
  },
  quickTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  generateBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 16,
    padding: 40,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  // Preview Screen Styles
  weekTabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  weekTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weekTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  weekTabTextActive: {
    color: '#2563EB',
  },
  previewList: {
    gap: 16,
    marginBottom: 24,
  },
  previewDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  previewRestCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  restDayTitle: {
    color: '#64748B',
  },
  dayFocus: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  dayExList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 8,
  },
  previewExItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  exDot: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  exDetail: {
    flex: 1,
  },
  exTextName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  exTextInfo: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  exTextDesc: {
    color: '#64748B',
    fontWeight: '400',
  },
  restDayText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  backBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    minWidth: 200,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  saveBtnBlue: {
    backgroundColor: '#0EA5E9',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
