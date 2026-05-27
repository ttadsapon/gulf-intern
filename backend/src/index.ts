import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ตรวจสอบค่าการตั้งค่า Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseKey !== 'your-supabase-anon-or-service-role-key';

let supabase: any = null;

if (isSupabaseConfigured) {
  console.log('🔌 Connecting to Supabase at:', supabaseUrl);
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('⚠️ Supabase credentials not configured. Using in-memory mock database fallback...');
}

// ----------------------------------------------------
// 💾 ระบบฐานข้อมูลจำลองในหน่วยความจำ (In-Memory Database Fallback)
// ----------------------------------------------------
const mockUsers: any[] = [];
const mockProfiles: Record<string, any> = {};
const mockWeightLogs: Record<string, any[]> = {};
const mockMealPlans: Record<string, any> = {};
const mockWorkoutPlans: Record<string, any> = {};

const mapProfileToDb = (profile: any) => {
  if (!profile) return {};
  return {
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    age: profile.age,
    activity: profile.activity,
    goal: profile.goal,
    target_calories: profile.targetCalories !== undefined ? profile.targetCalories : profile.target_calories,
    bmi: profile.bmi,
    bmr: profile.bmr,
    tdee: profile.tdee,
    protein: profile.protein,
    carbs: profile.carbs,
    fat: profile.fat,
    name: profile.name
  };
};

const mapDbToProfile = (dbProfile: any) => {
  if (!dbProfile) return null;
  return {
    name: dbProfile.name,
    gender: dbProfile.gender,
    weight: dbProfile.weight,
    height: dbProfile.height,
    age: dbProfile.age,
    activity: dbProfile.activity,
    goal: dbProfile.goal,
    targetCalories: dbProfile.target_calories !== undefined ? dbProfile.target_calories : dbProfile.targetCalories,
    bmi: dbProfile.bmi,
    bmr: dbProfile.bmr,
    tdee: dbProfile.tdee,
    protein: dbProfile.protein,
    carbs: dbProfile.carbs,
    fat: dbProfile.fat
  };
};

// Helper: ดึง User ID จาก Token (ในระบบจริงจะใช้ jwt verification)
const getUserIdFromToken = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  if (isSupabaseConfigured) {
    // ตรวจสอบว่าเป็น UUID รูปแบบที่ถูกต้องหรือไม่ เพื่อป้องกันข้อผิดพลาดจาก mock tokens ที่ค้างอยู่
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return null;
    }
    return token;
  } else {
    // ระบบจำลอง: โทเค็นก็คือ userId ที่เราส่งกลับตอนล็อกอิน
    return token;
  }
};

// ----------------------------------------------------
// 🔐 ระบบยืนยันตัวตน (Authentication)
// ----------------------------------------------------

// 1. ลงทะเบียน (Sign Up)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, profile } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    if (isSupabaseConfigured) {
      // ลงทะเบียนผ่าน Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('ไม่พบข้อมูลผู้ใช้');

      const userId = data.user.id;

      // บันทึกโปรไฟล์ลงในตาราง profiles
      let profileError = null;
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...mapProfileToDb(profile),
          });
        profileError = error;
      } catch (upsertErr: any) {
        profileError = upsertErr;
      }

      // หากตาราง profiles ยังไม่มีคอลัมน์ name หรือ bmi (เช่น ติดคัดกรอง หรือยังไม่ได้ Run SQL) ให้กรองฟิลด์เจ้าปัญหาก่อนอัปเดตใหม่
      if (profileError && (profileError.code === '42703' || String(profileError.message || '').includes('name') || String(profileError.message || '').includes('bmi'))) {
        console.warn('⚠️ profiles table does not match schema exactly. Retrying profile upsert without columns name/bmi...');
        const { name: _, bmi: __, ...restProfile } = profile;
        const { error: retryError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...mapProfileToDb(restProfile),
          });
        profileError = retryError;
      }

      if (profileError) throw profileError;

      return res.status(200).json({
        success: true,
        token: userId,
        user: { id: userId, email },
        message: 'สมัครสมาชิกและสร้างโปรไฟล์สำเร็จ',
      });
    } else {
      // ระบบจำลอง
      const exists = mockUsers.find(u => u.email === email);
      if (exists) {
        return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานไปแล้ว' });
      }

      const userId = 'mock_user_' + Math.random().toString(36).substr(2, 9);
      mockUsers.push({ id: userId, email, password });
      mockProfiles[userId] = profile || {
        name: 'ตัวคุณเอง',
        gender: 'male',
        weight: 70,
        height: 170,
        age: 25,
        activity: '1.375',
        goal: 'maintenance',
        targetCalories: 2000,
        bmi: 24.2,
        bmr: 1600,
        tdee: 2200,
        protein: 100,
        carbs: 250,
        fat: 60
      };
      
      // ข้อมูลเริ่มต้นสำหรับกราฟน้ำหนักจำลอง
      mockWeightLogs[userId] = [
        { date: '21/5', weight: profile?.weight || 70 },
        { date: '22/5', weight: profile?.weight || 70 }
      ];

      return res.status(200).json({
        success: true,
        token: userId,
        user: { id: userId, email },
        message: 'สมัครสมาชิกสำเร็จ (ระบบจำลอง)',
      });
    }
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// 2. เข้าสู่ระบบ (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    if (isSupabaseConfigured) {
      // ล็อกอินผ่าน Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('ไม่พบข้อมูลผู้ใช้');

      const userId = data.user.id;

      return res.status(200).json({
        success: true,
        token: userId, // ส่ง User ID กลับไปเป็น Session Token เบื้องต้น
        user: { id: userId, email },
        message: 'เข้าสู่ระบบสำเร็จ',
      });
    } else {
      // ระบบจำลอง
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }

      return res.status(200).json({
        success: true,
        token: user.id,
        user: { id: user.id, email },
        message: 'เข้าสู่ระบบสำเร็จ (ระบบจำลอง)',
      });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// ----------------------------------------------------
// 👤 ข้อมูลผู้ใช้ & สถิติสุขภาพ (User Profile & Stats)
// ----------------------------------------------------

// ดึงโปรไฟล์สุขภาพ
app.get('/api/user/profile', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'ไม่มีสิทธิ์เข้าถึง กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return res.status(200).json(mapDbToProfile(data));
    } else {
      const profile = mockProfiles[userId];
      if (!profile) {
        return res.status(404).json({ error: 'ไม่พบข้อมูลโปรไฟล์ผู้ใช้นี้' });
      }
      return res.status(200).json(profile);
    }
  } catch (err: any) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// อัปเดตโปรไฟล์สุขภาพ
app.post('/api/user/profile', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const profileData = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'ไม่มีสิทธิ์เข้าถึง กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      let data = null;
      let profileError = null;
      try {
        const { data: upsertData, error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...mapProfileToDb(profileData),
            updated_at: new Date()
          })
          .select()
          .single();
        data = upsertData;
        profileError = error;
      } catch (upsertErr: any) {
        profileError = upsertErr;
      }

      // หากตาราง profiles ยังไม่มีคอลัมน์ name หรือ bmi (เช่น ติดคัดกรอง หรือยังไม่ได้ Run SQL) ให้กรองฟิลด์เจ้าปัญหาก่อนอัปเดตใหม่
      if (profileError && (profileError.code === '42703' || String(profileError.message || '').includes('name') || String(profileError.message || '').includes('bmi'))) {
        console.warn('⚠️ profiles table does not match schema exactly. Retrying profile update upsert without columns name/bmi...');
        const { name: _, bmi: __, ...restProfile } = profileData;
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...mapProfileToDb(restProfile),
            updated_at: new Date()
          })
          .select()
          .single();
        data = retryData;
        profileError = retryError;
      }

      if (profileError) throw profileError;
      return res.status(200).json(mapDbToProfile(data));
    } else {
      mockProfiles[userId] = {
        ...mockProfiles[userId],
        ...profileData,
      };
      return res.status(200).json(mockProfiles[userId]);
    }
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลโปรไฟล์' });
  }
});

// ----------------------------------------------------
// 🍲 ตารางแผนอาหาร (Meal Plans)
// ----------------------------------------------------

// ดึงแผนตารางอาหาร
app.get('/api/user/meals', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return res.status(200).json(data ? { week1: data.week1_plan, week2: data.week2_plan } : null);
    } else {
      const plans = mockMealPlans[userId] || null;
      return res.status(200).json(plans);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงตารางอาหาร' });
  }
});

// บันทึก/อัปเดตแผนตารางอาหาร
app.post('/api/user/meals', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { week1, week2 } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('meal_plans')
        .upsert({
          user_id: userId,
          week1_plan: week1,
          week2_plan: week2,
          updated_at: new Date()
        });

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'บันทึกตารางอาหารเรียบร้อยแล้ว' });
    } else {
      mockMealPlans[userId] = { week1, week2 };
      return res.status(200).json({ success: true, message: 'บันทึกตารางอาหารเรียบร้อยแล้ว (จำลอง)' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการบันทึกตารางอาหาร' });
  }
});

// ----------------------------------------------------
// 🏋️ ตารางแผนออกกำลังกาย (Workout Plans)
// ----------------------------------------------------

// ดึงแผนออกกำลังกาย
app.get('/api/user/workouts', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return res.status(200).json(data ? { week1: data.week1_plan, week2: data.week2_plan } : null);
    } else {
      const plans = mockWorkoutPlans[userId] || null;
      return res.status(200).json(plans);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงตารางออกกำลังกาย' });
  }
});

// บันทึก/อัปเดตแผนออกกำลังกาย
app.post('/api/user/workouts', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { week1, week2 } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('workout_plans')
        .upsert({
          user_id: userId,
          week1_plan: week1,
          week2_plan: week2,
          updated_at: new Date()
        });

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'บันทึกตารางออกกำลังกายเรียบร้อยแล้ว' });
    } else {
      mockWorkoutPlans[userId] = { week1, week2 };
      return res.status(200).json({ success: true, message: 'บันทึกตารางออกกำลังกายเรียบร้อยแล้ว (จำลอง)' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการบันทึกตารางออกกำลังกาย' });
  }
});

// ----------------------------------------------------
// 📊 ประวัติน้ำหนัก (Weight logs)
// ----------------------------------------------------

// ดึงประวัติน้ำหนัก
app.get('/api/user/weight', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('date, weight')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(7);

      if (error) throw error;
      return res.status(200).json(data);
    } else {
      const logs = mockWeightLogs[userId] || [];
      return res.status(200).json(logs);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการดึงประวัติน้ำหนัก' });
  }
});

// บันทึกน้ำหนักใหม่
app.post('/api/user/weight', async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { date, weight } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'กรุณาล็อกอินก่อน' });
  }

  if (!weight || !date) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลน้ำหนักและวันที่' });
  }

  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          date,
          weight
        });

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'บันทึกน้ำหนักสำเร็จ' });
    } else {
      if (!mockWeightLogs[userId]) {
        mockWeightLogs[userId] = [];
      }
      
      // กรองเพื่อป้องกันการซ้ำในวันเดียวกันในข้อมูลจำลอง
      mockWeightLogs[userId] = mockWeightLogs[userId].filter(h => h.date !== date);
      mockWeightLogs[userId].push({ date, weight });
      mockWeightLogs[userId] = mockWeightLogs[userId].slice(-7); // เก็บสูงสุด 7 วัน

      return res.status(200).json({ success: true, message: 'บันทึกน้ำหนักสำเร็จ (จำลอง)' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการบันทึกน้ำหนัก' });
  }
});

// ----------------------------------------------------
// 📧 ระบบแชร์ตารางผ่านอีเมล (Email Sharing Service)
// ----------------------------------------------------

// SMTP Configuration
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

// ดึงตัวจัดการการส่งเมล (หากไม่มี SMTP จริงจะสร้าง Ethereal account อัตโนมัติสำหรับ sandbox)
const getMailTransporter = async () => {
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    console.log('📬 SMTP credentials not configured. Creating Ethereal Test Mailer account...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// ฟังก์ชันสร้างหน้าเนื้อหาอีเมล HTML ของแผน 14 วัน
const generatePlanHtml = (planType: 'meal' | 'workout', planData: any, userName: string): string => {
  const isMeal = planType === 'meal';
  const title = isMeal ? 'ตารางโภชนาการอาหารอัจฉริยะ (14 วัน)' : 'ตารางฝึกซ้อมออกกำลังกายอัจฉริยะ (14 วัน)';
  const themeColor = isMeal ? '#10B981' : '#2563EB';
  const themeGradient = isMeal 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';

  let contentHtml = '';

  const renderDays = (weekData: any, weekTitle: string) => {
    if (!weekData) return '';
    let weekHtml = `<h2 style="color: ${themeColor}; border-bottom: 2px solid ${themeColor}; padding-bottom: 8px; margin-top: 30px;">${weekTitle}</h2>`;
    
    for (const day of ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']) {
      const dayPlan = weekData[day];
      if (!dayPlan) continue;

      weekHtml += `
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 16px; font-family: sans-serif;">
          <h3 style="margin-top: 0; color: #1E293B; font-size: 16px; font-weight: bold; border-left: 4px solid ${themeColor}; padding-left: 8px;">
            วัน${day}
          </h3>
      `;

      if (isMeal) {
        weekHtml += `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #EDF2F7; text-align: left;">
                <th style="padding: 8px; font-size: 12px; color: #4A5568;">มื้ออาหาร</th>
                <th style="padding: 8px; font-size: 12px; color: #4A5568;">รายการอาหาร</th>
                <th style="padding: 8px; font-size: 12px; color: #4A5568; text-align: right;">พลังงาน</th>
                <th style="padding: 8px; font-size: 12px; color: #4A5568; text-align: right;">โปรตีน/คาร์บ/ไขมัน</th>
              </tr>
            </thead>
            <tbody>
        `;

        const categoriesMap: Record<string, string> = {
          breakfast: '🌅 เช้า',
          lunch: '☀️ กลางวัน',
          dinner: '🌆 เย็น',
          snack: '🍎 ว่าง'
        };

        dayPlan.forEach((meal: any) => {
          if (!meal) return;
          const categoryName = categoriesMap[meal.category] || meal.category;
          weekHtml += `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 8px; font-size: 13px; font-weight: bold; color: #4A5568; width: 20%;">${categoryName}</td>
              <td style="padding: 10px 8px; font-size: 13px; color: #2D3748;">${meal.name}</td>
              <td style="padding: 10px 8px; font-size: 13px; color: #2D3748; text-align: right; font-weight: bold;">${meal.calories} kcal</td>
              <td style="padding: 10px 8px; font-size: 12px; color: #718096; text-align: right;">
                P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g
              </td>
            </tr>
          `;
        });

        weekHtml += `
            </tbody>
          </table>
        `;
      } else {
        const titleText = dayPlan.workoutTitle || 'พักผ่อน (Rest Day)';
        const focusText = dayPlan.workoutFocus ? `(โฟกัส: ${dayPlan.workoutFocus})` : '';
        const exercises = dayPlan.exercises || [];

        weekHtml += `
          <div style="margin-bottom: 10px;">
            <strong style="color: #2D3748; font-size: 14px;">🏃‍♂️ โปรแกรม: ${titleText}</strong> 
            <span style="color: #718096; font-size: 13px; margin-left: 5px;">${focusText}</span>
          </div>
        `;

        if (exercises.length > 0) {
          weekHtml += `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #EDF2F7; text-align: left;">
                  <th style="padding: 8px; font-size: 12px; color: #4A5568;">ท่าออกกำลังกาย</th>
                  <th style="padding: 8px; font-size: 12px; color: #4A5568; text-align: center;">จำนวนเซต / ครั้ง</th>
                  <th style="padding: 8px; font-size: 12px; color: #4A5568;">คำอธิบาย</th>
                </tr>
              </thead>
              <tbody>
          `;

          exercises.forEach((ex: any) => {
            weekHtml += `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 10px 8px; font-size: 13px; font-weight: bold; color: #2D3748; width: 30%;">${ex.name}</td>
                <td style="padding: 10px 8px; font-size: 13px; color: #2563EB; text-align: center; font-weight: bold; width: 25%;">${ex.sets} เซต x ${ex.reps}</td>
                <td style="padding: 10px 8px; font-size: 12px; color: #4A5568;">${ex.description}</td>
              </tr>
            `;
          });

          weekHtml += `
              </tbody>
            </table>
          `;
        } else {
          weekHtml += `
            <div style="padding: 12px; font-size: 13px; color: #718096; background-color: #EDF2F7; border-radius: 6px; text-align: center; margin-top: 8px;">
              😴 วันพักผ่อนเพื่อฟื้นฟูร่างกายและกล้ามเนื้อเต็มประสิทธิภาพ
            </div>
          `;
        }
      }

      weekHtml += `</div>`;
    }

    return weekHtml;
  };

  contentHtml += renderDays(planData.week1, '📅 สัปดาห์ที่ 1');
  contentHtml += renderDays(planData.week2, '📅 สัปดาห์ที่ 2 (เพิ่มความท้าทาย)');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 20px; color: #334155;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
        <!-- Header Banner -->
        <div style="background: ${themeGradient}; padding: 30px 24px; text-align: center; color: #FFFFFF;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🌱 AuraHealth</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px;">${title}</p>
        </div>
        
        <!-- Welcome Section -->
        <div style="padding: 24px 24px 0 24px;">
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #334155;">
            สวัสดีครับ สมาชิกทีม <strong>AuraHealth</strong>, คุณ <strong>${userName}</strong> ได้ทำการเจเนอเรตแผนงานสุขภาพ 14 วัน และส่งตารางด้านล่างนี้มาให้คุณเพื่อนำไปปฏิบัติตามแผนเพื่อหุ่นและสุขภาพที่ดีขึ้นครับ!
          </p>
        </div>

        <!-- Plan Contents -->
        <div style="padding: 0 24px 24px 24px;">
          ${contentHtml}
        </div>

        <!-- Footer -->
        <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px; text-align: center; font-size: 11px; color: #64748B;">
          <p style="margin: 0 0 5px 0;">อีเมลนี้จัดทำขึ้นโดยแอปพลิเคชัน AuraHealth ระบบโภชนาการและออกกำลังกายอัจฉริยะ</p>
          <p style="margin: 0;">&copy; 2026 AuraHealth Team. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Route: ส่งอีเมลตารางงาน
app.post('/api/user/share-plan', async (req, res) => {
  const { email, planType, planData, userName } = req.body;

  if (!email || !planType || !planData) {
    return res.status(400).json({ error: 'ข้อมูลสำหรับแชร์ตารางไม่ครบถ้วน' });
  }

  try {
    const transporter = await getMailTransporter();
    
    // สร้างเนื้อหาจดหมาย HTML
    const htmlContent = generatePlanHtml(planType, planData, userName || 'สมาชิก AuraHealth');
    
    const subject = planType === 'meal' 
      ? `🥗 ตารางอาหารเพื่อสุขภาพ 14 วันของคุณ (จาก: ${userName || 'เพื่อนร่วมงาน'})`
      : `🏋️ ตารางฝึกออกกำลังกาย 14 วันของคุณ (จาก: ${userName || 'เพื่อนร่วมงาน'})`;

    const mailOptions = {
      from: smtpUser ? `"AuraHealth App" <${smtpUser}>` : '"AuraHealth Sandbox" <no-reply@ethereal.email>',
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log('✉️ Email sent successfully:', info.messageId);
    if (previewUrl) {
      console.log('📬 Ethereal Mail Preview URL:', previewUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'ส่งข้อมูลตารางเข้าอีเมลเรียบร้อยแล้ว',
      messageId: info.messageId,
      previewUrl: previewUrl || null
    });
  } catch (err: any) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message || 'ไม่สามารถส่งอีเมลได้ในขณะนี้' });
  }
});

// ----------------------------------------------------
// 🚀 เริ่มต้นรันเซิร์ฟเวอร์
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 AuraHealth Backend API running on http://localhost:${PORT}`);
});
