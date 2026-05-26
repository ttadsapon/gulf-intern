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

// ฐานข้อมูลเมนูอาหารสำหรับระบบสุ่มและกรองอัจฉริยะ (Local Client-Side Database)
const MEALS_DATABASE = [
  // มื้อเช้า (Breakfast)
  { id: 'b1', name: 'ข้าวต้มอกไก่สับกระเทียมเจียว', calories: 280, protein: 22, carbs: 40, fat: 3, category: 'breakfast', price: 45, tags: ['rice', 'chicken'], allergyTags: ['chicken', 'gluten'] },
  { id: 'b2', name: 'ไข่ต้ม 2 ฟอง + ขนมปังโฮลวีต 2 แผ่น', calories: 290, protein: 18, carbs: 28, fat: 11, category: 'breakfast', price: 40, tags: ['bread', 'eggs'], allergyTags: ['eggs', 'gluten'] },
  { id: 'b3', name: 'โอ๊ตมีลผลไม้รวมและกล้วยหอมทอง', calories: 320, protein: 9, carbs: 58, fat: 5, category: 'breakfast', price: 60, tags: ['bread'], allergyTags: ['gluten'] },
  { id: 'b4', name: 'แซนวิชอกไก่ฉีกไข่ดาวน้ำ', calories: 340, protein: 26, carbs: 32, fat: 8, category: 'breakfast', price: 55, tags: ['bread', 'chicken', 'eggs'], allergyTags: ['chicken', 'eggs', 'gluten'] },
  { id: 'b5', name: 'กรีกโยเกิร์ตผลไม้รวมกราโนล่า', calories: 240, protein: 12, carbs: 36, fat: 6, category: 'breakfast', price: 50, tags: ['salad'], allergyTags: ['dairy'] },
  { id: 'b6', name: 'ต้มเลือดหมูไม่ใส่เครื่องใน + ข้าวกล้อง', calories: 310, protein: 24, carbs: 38, fat: 6, category: 'breakfast', price: 65, tags: ['rice', 'pork'], allergyTags: ['pork'] },
  { id: 'b7', name: 'สลัดไข่ต้มผลไม้และอะโวคาโด', calories: 270, protein: 14, carbs: 12, fat: 18, category: 'breakfast', price: 70, tags: ['salad', 'eggs'], allergyTags: ['eggs'] },

  // มื้อกลางวัน (Lunch)
  { id: 'l1', name: 'ข้าวผัดอกไก่ใส่ผักรวมแปดสี', calories: 420, protein: 32, carbs: 52, fat: 8, category: 'lunch', price: 55, tags: ['rice', 'chicken'], allergyTags: ['chicken'] },
  { id: 'l2', name: 'ก๋วยเตี๋ยวเส้นหมี่น้ำใสอกไก่ฉีกไร้กระเทียม', calories: 320, protein: 25, carbs: 45, fat: 4, category: 'lunch', price: 50, tags: ['noodles', 'chicken'], allergyTags: ['chicken', 'gluten'] },
  { id: 'l3', name: 'กะเพราอกไก่ราดข้าวกล้อง + ไข่ดาวน้ำ', calories: 460, protein: 36, carbs: 55, fat: 10, category: 'lunch', price: 65, tags: ['rice', 'chicken', 'eggs'], allergyTags: ['chicken', 'eggs'] },
  { id: 'l4', name: 'ข้าวกล้องราดแกงส้มกุ้งผักรวม', calories: 340, protein: 22, carbs: 50, fat: 4, category: 'lunch', price: 80, tags: ['rice', 'seafood'], allergyTags: ['seafood'] },
  { id: 'l5', name: 'สเต็กปลาดอลลี่ย่างสมุนไพรโรสแมรี่', calories: 280, protein: 24, carbs: 15, fat: 12, category: 'lunch', price: 90, tags: ['steak', 'salad'], allergyTags: ['seafood'] },
  { id: 'l6', name: 'บะหมี่โฮลวีตแห้งหมูแดงต้มไร้มัน', calories: 380, protein: 28, carbs: 48, fat: 7, category: 'lunch', price: 65, tags: ['noodles', 'pork'], allergyTags: ['pork', 'gluten'] },
  { id: 'l7', name: 'ข้าวกล้องราดเนื้อย่างซีอิ๊วญี่ปุ่น', calories: 490, protein: 30, carbs: 55, fat: 14, category: 'lunch', price: 95, tags: ['rice', 'beef'], allergyTags: ['beef', 'soy'] },
  { id: 'l8', name: 'สลัดทูน่าในน้ำแร่น้ำสลัดใสพริกไทยดำ', calories: 260, protein: 24, carbs: 12, fat: 12, category: 'lunch', price: 75, tags: ['salad'], allergyTags: ['seafood'] },

  // มื้อเย็น (Dinner)
  { id: 'd1', name: 'ปลาย่างเกลือและบล็อคโคลี่ต้ม', calories: 270, protein: 26, carbs: 10, fat: 12, category: 'dinner', price: 85, tags: ['steak'], allergyTags: ['seafood'] },
  { id: 'd2', name: 'สเต็กอกไก่พริกไทยดำและผักย่างเตา', calories: 340, protein: 34, carbs: 14, fat: 14, category: 'dinner', price: 79, tags: ['steak', 'chicken'], allergyTags: ['chicken', 'gluten'] },
  { id: 'd3', name: 'แกงจืดเต้าหู้หมูสับวุ้นเส้นผักกาดขาว', calories: 210, protein: 16, carbs: 16, fat: 9, category: 'dinner', price: 50, tags: ['pork'], allergyTags: ['pork', 'soy'] },
  { id: 'd4', name: 'แซลมอนนอร์เวย์ย่างเกลือและหน่อไม้ฝรั่งลวก', calories: 430, protein: 28, carbs: 16, fat: 25, category: 'dinner', price: 150, tags: ['steak', 'seafood'], allergyTags: ['seafood', 'soy'] },
  { id: 'd5', name: 'ยำวุ้นเส้นอกไก่สับและกุ้งเด้งสด', calories: 290, protein: 25, carbs: 32, fat: 6, category: 'dinner', price: 85, tags: ['noodles', 'chicken', 'seafood'], allergyTags: ['chicken', 'seafood'] },
  { id: 'd6', name: 'ลาบเต้าหู้ขาวคั่วแห้งและไข่ต้มสไลด์', calories: 250, protein: 18, carbs: 14, fat: 12, category: 'dinner', price: 55, tags: ['salad', 'eggs'], allergyTags: ['eggs', 'soy'] },
  { id: 'd7', name: 'ซุปเต้าเจี้ยวญี่ปุ่นใส่เต้าหู้และสาหร่ายวากาเมะ', calories: 150, protein: 10, carbs: 18, fat: 4, category: 'dinner', price: 45, tags: ['soup'], allergyTags: ['soy'] },

  // อาหารว่าง (Snack)
  { id: 's1', name: 'อัลมอนด์อบเกลือธรรมชาติ (1 กำมือ)', calories: 160, protein: 6, carbs: 6, fat: 14, category: 'snack', price: 30, tags: ['salad'], allergyTags: ['nuts'] },
  { id: 's2', name: 'เวย์โปรตีนไอโซเลทเข้มข้น 1 สกู๊ป', calories: 120, protein: 25, carbs: 2, fat: 1, category: 'snack', price: 45, tags: ['soup'], allergyTags: ['dairy'] },
  { id: 's3', name: 'แอปเปิ้ลเขียวสด 1 ลูกใหญ่', calories: 80, protein: 0, carbs: 20, fat: 0, category: 'snack', price: 15, tags: ['salad'], allergyTags: [] },
  { id: 's4', name: 'กล้วยหอมทองผลสุก 1 ผล', calories: 100, protein: 1, carbs: 25, fat: 0, category: 'snack', price: 10, tags: ['salad'], allergyTags: [] },
  { id: 's5', name: 'น้ำนมถั่วเหลืองออร์แกนิกสูตรไร้น้ำตาล', calories: 110, protein: 8, carbs: 10, fat: 4, category: 'snack', price: 15, tags: ['soup'], allergyTags: ['soy'] },
];

const MEAL_TYPES = [
  { id: 'rice', label: 'ข้าว / ธัญพืช', icon: '🍚' },
  { id: 'noodles', label: 'เส้น / ก๋วยเตี๋ยว', icon: '🍜' },
  { id: 'steak', label: 'สเต็ก / เนื้อย่าง', icon: '🥩' },
  { id: 'soup', label: 'ซุป / ต้มร้อนๆ', icon: '🍲' },
  { id: 'bread', label: 'ขนมปัง / แป้งสาลี', icon: '🍞' },
  { id: 'salad', label: 'สลัด / เน้นผักสด', icon: '🥗' },
];

const PROTEIN_ALLERGIES = [
  { id: 'pork', label: 'เนื้อหมู', icon: '🐷' },
  { id: 'beef', label: 'เนื้อวัว', icon: '🐄' },
  { id: 'chicken', label: 'เนื้อไก่', icon: '🐔' },
  { id: 'seafood', label: 'อาหารทะเล (ปลา/กุ้ง)', icon: '🦐' },
];

const OTHER_ALLERGIES = [
  { id: 'dairy', label: 'นม / เนย / ชีส', icon: '🥛' },
  { id: 'eggs', label: 'ไข่ไก่', icon: '🥚' },
  { id: 'nuts', label: 'ถั่วเปลือกแข็ง', icon: '🌰' },
  { id: 'peanuts', label: 'ถั่วลิสง', icon: '🥜' },
  { id: 'gluten', label: 'กลูเตน (แป้งสาลี)', icon: '🌾' },
  { id: 'soy', label: 'ถั่วเหลือง / เต้าหู้', icon: '🌱' },
];

export default function MealPlannerScreen() {
  const router = useRouter();

  // ฟอร์มข้อมูลการเลือก
  const [likedMeals, setLikedMeals] = useState<string[]>([]);
  const [allergicFoods, setAllergicFoods] = useState<string[]>([]);
  const [otherAllergyText, setOtherAllergyText] = useState<string>('');
  const [budget, setBudget] = useState<string>('100');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  // สถานะทำงาน
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [previewWeek, setPreviewWeek] = useState<'week1' | 'week2'>('week1');

  const loadingMessages = [
    '🤖 กำลังวิเคราะห์สัดส่วนสารอาหารเป้าหมายตามงบประมาณของคุณ...',
    '🛡️ ตรวจสอบรายการแพ้อาหารและกำจัดสิ่งที่มีส่วนผสมที่เป็นอันตรายออก...',
    '🥬 คัดกรองและสุ่มมื้ออาหารหลัก เช้า กลางวัน เย็น และของว่าง...',
    '📅 จัดตารางโภชนาการสำหรับสัปดาห์ที่ 1 และสัปดาห์ที่ 2 ให้สมบูรณ์แบบ...',
    '✨ แผนโภชนาการ 14 วันของคุณพร้อมจัดตารางแล้ว!'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= loadingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              const plan = generateMealPlanLogic();
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

  // ระบบคัดแยกและจัดตารางอาหารอัจฉริยะแบบ 14 วัน
  const generateMealPlanLogic = () => {
    const parsedBudget = parseFloat(budget) || 100;
    
    // คำค้นหาการแพ้อื่นๆ เพิ่มเติม
    const otherAllergiesRegex = otherAllergyText ? new RegExp(otherAllergyText.toLowerCase().replace(/,/g, '|'), 'i') : null;

    // กรองเมนูอาหารตามเกณฑ์
    const getSafeMeals = (category: string) => {
      let filtered = MEALS_DATABASE.filter(m => m.category === category);

      // 1. กรองงบประมาณ (ยกเว้น อาหารว่าง ที่มักจะถูกกว่าอยู่แล้ว และมื้อเย็นในวันงบจำกัด)
      if (category !== 'snack') {
        filtered = filtered.filter(m => m.price <= parsedBudget);
      }

      // 2. กรองอาหารที่ติ๊กเลือกแพ้
      if (allergicFoods.length > 0) {
        filtered = filtered.filter(m => {
          return !m.allergyTags.some(tag => allergicFoods.includes(tag));
        });
      }

      // 3. กรองคำระบุเพิ่มในข้อความแพ้อาหาร
      if (otherAllergiesRegex) {
        filtered = filtered.filter(m => {
          return !otherAllergiesRegex.test(m.name.toLowerCase());
        });
      }

      // 4. กรองประเภทอาหารที่ชอบ (ถ้าหาไม่ได้เลย ค่อยใช้เมนูทั่วไป)
      if (likedMeals.length > 0) {
        const liked = filtered.filter(m => m.tags.some(tag => likedMeals.includes(tag)));
        if (liked.length > 0) {
          filtered = liked;
        }
      }

      // Fallback ถ้ากรองหมดจนไม่เหลือเมนูเลย ให้ดึงเมนูที่ถูกและแพ้น้อยสุดเป็นฐาน
      if (filtered.length === 0) {
        filtered = MEALS_DATABASE.filter(m => m.category === category);
      }

      return filtered;
    };

    const bMeals = getSafeMeals('breakfast');
    const lMeals = getSafeMeals('lunch');
    const dMeals = getSafeMeals('dinner');
    const sMeals = getSafeMeals('snack');

    // สุ่มมื้ออาหารรายสัปดาห์
    const pickDailyMeals = (dayIdx: number) => {
      // สุ่มอาหารเช้า
      const b = bMeals[Math.floor(Math.random() * bMeals.length)] || MEALS_DATABASE[0];
      // สุ่มอาหารกลางวัน (เลี่ยงการซ้ำกับมื้อเช้าถ้าทำได้)
      let l = lMeals[Math.floor(Math.random() * lMeals.length)] || MEALS_DATABASE[7];
      if (l.name === b.name && lMeals.length > 1) {
        l = lMeals.filter(m => m.name !== b.name)[0];
      }
      // สุ่มอาหารเย็น (เลี่ยงการซ้ำกับกลางวัน/เช้า)
      let d = dMeals[Math.floor(Math.random() * dMeals.length)] || MEALS_DATABASE[14];
      if ((d.name === l.name || d.name === b.name) && dMeals.length > 1) {
        d = dMeals.filter(m => m.name !== l.name && m.name !== b.name)[0] || d;
      }
      // สุ่มอาหารว่าง
      const s = sMeals[Math.floor(Math.random() * sMeals.length)] || MEALS_DATABASE[21];

      // อัปเดตข้อมูลอาหารประเภทโปรตีนและพลังงานตามเป้าหมาย (Goal Modification)
      const modifyMealByGoal = (original: any) => {
        let mod = { ...original };
        if (goal === 'gain') {
          // เป้าหมายเพิ่มกล้ามเนื้อ: เพิ่มโปรตีนและแคลอรีขึ้นเล็กน้อย (+20%)
          mod.name = `${mod.name} (เพิ่มโปรตีนพิเศษ)`;
          mod.protein = Math.round(mod.protein * 1.25);
          mod.calories = Math.round(mod.calories * 1.15);
        } else if (goal === 'lose') {
          // เป้าหมายลดไขมัน: ปรับสัดส่วนพลังงานให้เบาลง คุมแคลอรีต่ำลง (-10%)
          mod.name = `${mod.name} (ลดปริมาณน้ำมัน/แป้ง)`;
          mod.calories = Math.round(mod.calories * 0.88);
          mod.fat = Math.max(1, Math.round(mod.fat * 0.8));
        }
        return mod;
      };

      return [
        modifyMealByGoal(b),
        modifyMealByGoal(l),
        modifyMealByGoal(d),
        modifyMealByGoal(s)
      ];
    };

    const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

    const week1: Record<string, any> = {};
    const week2: Record<string, any> = {};

    DAYS.forEach((day, idx) => {
      week1[day] = pickDailyMeals(idx);
      // สัปดาห์ที่ 2 ให้ทำแบบเดียวกันแต่ใส่ Seed สุ่มใหม่เพื่อให้เมนูอาหารไม่ซ้ำซากจำเจ
      week2[day] = pickDailyMeals(idx + 10);
    });

    return { week1, week2 };
  };

  const handleStartGeneration = () => {
    if (likedMeals.length === 0) {
      alert('กรุณาเลือกประเภทอาหารที่ชื่นชอบอย่างน้อย 1 อย่างครับ');
      return;
    }
    const num = parseFloat(budget);
    if (!num || isNaN(num) || num <= 0) {
      alert('กรุณากรอกงบประมาณต่อมื้อที่ถูกต้องด้วยครับ');
      return;
    }
    setIsGenerating(true);
    setLoadingStep(0);
  };

  // บันทึกตารางลง LocalStorage
  const handleSavePlan = () => {
    if (!generatedPlan) return;
    try {
      localStorage.setItem('aura_two_week_meal_plan', JSON.stringify(generatedPlan));
      alert('🥗 บันทึกตารางอาหาร 2 สัปดาห์ลงในเครื่องเรียบร้อยแล้ว!');
      router.replace('/');
    } catch (e) {
      alert('ไม่สามารถบันทึกข้อมูลตารางอาหารได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // เซฟตารางโภชนาการอาหารเป็นรูปภาพ PNG
  const handleSaveMealPlanAsImage = () => {
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
      const rowHeight = 160;
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

      // 1. วาดพื้นหลัง ไล่เฉดสีขาว-เขียวโภชนาการหรูหรา
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#ECFDF5');
      bg.addColorStop(0.5, '#FFFFFF');
      bg.addColorStop(1, '#ECFDF5');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // 2. วาดหัวข้อหลัก (Header)
      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`AuraHealth — ตารางโภชนาการอาหารรายสัปดาห์`, padding, padding + 40);

      ctx.fillStyle = '#475569';
      ctx.font = '600 17px Arial';
      ctx.fillText(`แผนอาหารสำหรับ: ${previewWeek === 'week1' ? 'สัปดาห์ที่ 1' : 'สัปดาห์ที่ 2'} | เป้าหมาย: ${goal === 'gain' ? 'เพิ่มกล้ามเนื้อ' : goal === 'lose' ? 'ลดน้ำหนัก' : 'รักษาสุขภาพ'} (งบมื้อละ ฿${budget})`, padding, padding + 75);

      // วาดเส้นแบ่งหัวข้อ
      ctx.strokeStyle = '#A7F3D0';
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
        const colors = dayColorMap[dayName] || { label: '#10B981', text: '#FFFFFF', bg: '#F8FAFC' };

        // วาดการ์ดพื้นหลังแถบวัน
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.04)';
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

        // แสดงแคลและราคารวมรายวันด้านซ้าย
        const dayMeals = activePlan[dayName] || [];
        const dayCalories = dayMeals.reduce((sum: number, m: any) => sum + (m ? m.calories : 0), 0);
        const dayTotalCost = dayMeals.reduce((sum: number, m: any) => sum + (m ? m.price : 0), 0);

        ctx.fillStyle = '#065F46';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`รวม: ${dayCalories} kcal`, badgeX, y + 80);
        ctx.fillStyle = '#B45309';
        ctx.fillText(`งบรวม: ฿${dayTotalCost}`, badgeX, y + 105);

        // วาดรายการเมนูอาหาร 4 มื้อ (ขวา)
        const mealsX = padding + 150;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const mealLabels = ['เช้า', 'กลางวัน', 'เย็น', 'ว่าง'];
        mealLabels.forEach((label, idx) => {
          const meal = dayMeals[idx];
          const textY = y + 20 + idx * 30;

          ctx.fillStyle = '#047857';
          ctx.font = 'bold 13px Arial';
          ctx.fillText(`[มื้อ${label}]`, mealsX, textY);

          ctx.fillStyle = '#1E293B';
          ctx.font = '13px Arial';
          if (meal) {
            ctx.fillText(`${meal.name}`, mealsX + 70, textY);
            ctx.fillStyle = '#64748B';
            ctx.font = '11px Arial';
            ctx.fillText(`(${meal.calories} kcal | ฿${meal.price})`, mealsX + 500, textY);
          } else {
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`ยังไม่เลือกรายการอาหาร`, mealsX + 70, textY);
          }
        });

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
      a.download = `AuraHealth_MealPlan_${previewWeek}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert('📸 บันทึกตารางอาหารเป็นรูปภาพสำเร็จแล้ว!');
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const toggleMealType = (id: string) => {
    setLikedMeals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllergicFood = (id: string) => {
    setAllergicFoods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const DAYS_OF_WEEK = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
  const CATEGORIES = [
    { label: '🌅 เช้า', index: 0 },
    { label: '☀️ กลางวัน', index: 1 },
    { label: '🌌 เย็น', index: 2 },
    { label: '🍌 อาหารว่าง', index: 3 },
  ];

  // หน้าจอประมวลผล (Loading)
  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingTitle}>กำลังจัดวางตารางอาหารส่วนบุคคล...</Text>
        <Text style={styles.loadingSubtitle}>{loadingMessages[loadingStep]}</Text>
      </View>
    );
  }

  // หน้าจอพรีวิวตารางอาหารก่อนบันทึก
  if (generatedPlan) {
    const activePlan = generatedPlan[previewWeek];
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, styles.headerGreen]}>
          <Text style={styles.headerTitleGreen}>🥗 พรีวิวตารางโภชนาการอาหาร 2 สัปดาห์</Text>
          <Text style={styles.headerSubtitle}>
            เป้าหมาย: {goal === 'gain' ? 'เพิ่มกล้ามเนื้อ' : goal === 'lose' ? 'ลดน้ำหนัก' : 'รักษาสุขภาพ'} | 
            งบประมาณ: มื้อละ ฿{budget}
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* แถบสลับสัปดาห์ */}
          <View style={styles.weekTabWrapper}>
            <Pressable
              style={[styles.weekTab, previewWeek === 'week1' && styles.weekTabActiveGreen]}
              onPress={() => setPreviewWeek('week1')}
            >
              <Text style={[styles.weekTabText, previewWeek === 'week1' && styles.weekTabTextActiveGreen]}>
                สัปดาห์ที่ 1 (จันทร์ - อาทิตย์)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.weekTab, previewWeek === 'week2' && styles.weekTabActiveGreen]}
              onPress={() => setPreviewWeek('week2')}
            >
              <Text style={[styles.weekTabText, previewWeek === 'week2' && styles.weekTabTextActiveGreen]}>
                สัปดาห์ที่ 2 (จันทร์ - อาทิตย์)
              </Text>
            </Pressable>
          </View>

          {/* ตารางเมนูอาหารแต่ละวัน */}
          <View style={styles.previewList}>
            {DAYS_OF_WEEK.map((dayName) => {
              const dayMeals = activePlan[dayName] || [];
              const dayTotalCal = dayMeals.reduce((sum: number, m: any) => sum + (m ? m.calories : 0), 0);
              const dayTotalCost = dayMeals.reduce((sum: number, m: any) => sum + (m ? m.price : 0), 0);
              
              return (
                <View key={dayName} style={styles.previewDayCard}>
                  <View style={styles.dayCardHeader}>
                    <Text style={[styles.dayBadge, styles.dayBadgeGreen]}>{dayName}</Text>
                    <View style={styles.headerStatsRow}>
                      <Text style={styles.headerStatsText}>รวมแคล: {dayTotalCal} kcal</Text>
                      <Text style={[styles.headerStatsText, styles.highlightText]}>฿{dayTotalCost}</Text>
                    </View>
                  </View>

                  <View style={styles.mealsGrid}>
                    {CATEGORIES.map((cat) => {
                      const meal = dayMeals[cat.index];
                      if (!meal) return null;
                      return (
                        <View key={cat.label} style={styles.previewMealRow}>
                          <Text style={styles.mealCatBadge}>{cat.label}</Text>
                          <View style={styles.mealRowDetail}>
                            <Text style={styles.mealNameText}>{meal.name}</Text>
                            <Text style={styles.mealMacroText}>
                              {meal.calories} kcal | คาร์บ {meal.carbs}g | โปรตีน {meal.protein}g | ไขมัน {meal.fat}g | <Text style={styles.priceHighlight}>฿{meal.price}</Text>
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ปุ่มทำรายการ */}
          <View style={styles.btnRow}>
            <Pressable style={styles.backBtn} onPress={() => setGeneratedPlan(null)}>
              <Text style={styles.backBtnText}>ย้อนกลับไปแก้ไข</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, styles.saveBtnBlue]} onPress={handleSaveMealPlanAsImage}>
              <Text style={styles.saveBtnText}>📸 เซฟรูปภาพตารางสัปดาห์นี้</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, styles.saveBtnGreen]} onPress={handleSavePlan}>
              <Text style={styles.saveBtnText}>💾 บันทึกและสวมตารางอาหาร</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // หน้าจอกรอกข้อมูลPreferences (Form Screen)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, styles.headerGreen]}>
        <Text style={styles.headerTitleGreen}>🥗 ออกแบบตารางการกิน/โภชนาการ 2 สัปดาห์</Text>
        <Text style={styles.headerSubtitle}>
          ระบุความชอบด้านอาหาร งบประมาณ และอาการแพ้เพื่อออกแบบแผนเมนูสุขภาพ 14 วันที่ปลอดภัยและเหมาะสม
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          
          {/* 1. ประเภทอาหารที่ชอบ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🍚 อาหารประเภทที่คุณชอบกิน (เลือกได้หลายอย่าง)</Text>
            <View style={styles.optionsGrid}>
              {MEAL_TYPES.map((type) => {
                const isActive = likedMeals.includes(type.id);
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.checkboxCard, isActive && styles.checkboxCardActive]}
                    onPress={() => toggleMealType(type.id)}
                  >
                    <Text style={styles.checkboxEmoji}>{type.icon}</Text>
                    <Text style={[styles.checkboxText, isActive && styles.checkboxTextActive]}>{type.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. อาหารที่แพ้ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🥩 เนื้อสัตว์ที่ต้องการหลีกเลี่ยง / แพ้</Text>
            <View style={styles.optionsGrid}>
              {PROTEIN_ALLERGIES.map((type) => {
                const isActive = allergicFoods.includes(type.id);
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.checkboxCard, styles.allergyCard, isActive && styles.allergyCardActive]}
                    onPress={() => toggleAllergicFood(type.id)}
                  >
                    <Text style={styles.checkboxEmoji}>{type.icon}</Text>
                    <Text style={[styles.checkboxText, isActive && styles.allergyTextActive]}>{type.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. วัตถุดิบอื่นที่แพ้ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🌾 ส่วนผสมและวัตถุดิบอื่นที่แพ้ (เลือกได้หลายอย่าง)</Text>
            <View style={styles.optionsGrid}>
              {OTHER_ALLERGIES.map((type) => {
                const isActive = allergicFoods.includes(type.id);
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.checkboxCard, styles.allergyCard, isActive && styles.allergyCardActive]}
                    onPress={() => toggleAllergicFood(type.id)}
                  >
                    <Text style={styles.checkboxEmoji}>{type.icon}</Text>
                    <Text style={[styles.checkboxText, isActive && styles.allergyTextActive]}>{type.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4. เพิ่มเติมข้อมูลแพ้อาหารป้อนข้อความ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🥛 วัตถุดิบหรือคำระบุอื่นๆ เพิ่มเติม (เช่น ไม่ใส่ชูรส, เกลือต่ำ)</Text>
            <TextInput
              style={styles.textInput}
              value={otherAllergyText}
              onChangeText={setOtherAllergyText}
              placeholder="เช่น ไม่กินกระเทียม, งดหวานเข้มข้น, แพ้ปลาดุก (หากไม่มีปล่อยว่าง)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* 5. เป้าหมายในการกิน */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>🎯 เป้าหมายหลักในการกินอาหารครั้งนี้</Text>
            <View style={styles.optionsRow}>
              {[
                { id: 'lose', label: 'ลดไขมัน / ลดน้ำหนัก' },
                { id: 'maintain', label: 'ควบคุมสารอาหาร / สุขภาพ' },
                { id: 'gain', label: 'สร้างมวลกล้ามเนื้อ / เพิ่มน้ำหนัก' },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.optionButton, goal === item.id && styles.optionButtonActiveGreen]}
                  onPress={() => setGoal(item.id as any)}
                >
                  <Text style={[styles.optionButtonText, goal === item.id && styles.optionButtonTextActiveGreen]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 6. งบประมาณต่อมื้อ */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>฿ งบประมาณเฉลี่ยต่อมื้ออาหารหลัก (บาท)</Text>
            <View style={styles.budgetInputContainer}>
              <Text style={styles.bahtSign}>฿</Text>
              <TextInput
                style={styles.budgetInput}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholder="เช่น 100"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <Text style={styles.helperText}>*ระบบจะคัดแยกอาหารที่งบเฉลี่ยเกินออกตามความประหยัด</Text>
          </View>

          {/* ปุ่มส่งงาน */}
          <Pressable style={styles.generateBtn} onPress={handleStartGeneration}>
            <Text style={styles.generateBtnText}>⚡ สร้างตารางโภชนาการอาหาร 2 สัปดาห์</Text>
          </Pressable>

          {/* ยกเลิก */}
          <Pressable style={styles.cancelLink} onPress={() => router.replace('/')}>
            <Text style={styles.cancelLinkText}>ย้อนกลับสู่แดชบอร์ดหลัก</Text>
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
  },
  headerGreen: {
    borderBottomColor: '#A7F3D0',
  },
  headerTitleGreen: {
    fontSize: 20,
    fontWeight: '800',
    color: '#047857',
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
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkboxCard: {
    flexGrow: 1,
    width: '30%',
    minWidth: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 6,
  },
  checkboxCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  allergyCard: {
    backgroundColor: '#FFF8F8',
  },
  allergyCardActive: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  checkboxEmoji: {
    fontSize: 24,
  },
  checkboxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  checkboxTextActive: {
    color: '#047857',
  },
  allergyTextActive: {
    color: '#B91C1C',
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  optionButtonActiveGreen: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  optionButtonTextActiveGreen: {
    color: '#047857',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  bahtSign: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    outlineStyle: 'none',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  generateBtn: {
    backgroundColor: '#10B981',
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
  // Preview Plan Styles
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
  weekTabActiveGreen: {
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
  weekTabTextActiveGreen: {
    color: '#047857',
  },
  previewList: {
    gap: 18,
    marginBottom: 24,
  },
  previewDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
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
  dayBadgeGreen: {
    backgroundColor: '#10B981',
  },
  headerStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  headerStatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  highlightText: {
    color: '#047857',
  },
  mealsGrid: {
    gap: 12,
  },
  previewMealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  mealCatBadge: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: 60,
    textAlign: 'center',
  },
  mealRowDetail: {
    flex: 1,
    gap: 2,
  },
  mealNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  mealMacroText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  priceHighlight: {
    color: '#047857',
    fontWeight: '700',
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
  saveBtnGreen: {
    backgroundColor: '#10B981',
  },
  saveBtnBlue: {
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
