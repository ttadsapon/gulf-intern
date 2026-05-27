import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

// Helper: ดึง User ID จาก Token (ในระบบจริงจะใช้ jwt verification)
const getUserIdFromToken = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  if (isSupabaseConfigured) {
    // ในระบบจริง จะใช้วิธีส่ง token ไปตรวจกับ supabase auth
    // สำหรับเดโมนี้หรือการทดสอบ เราจะดึงข้อมูล user ที่ล็อกอินอยู่ หรือคืนค่า token เป็น userId โดยตรง
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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profile,
        });

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
      return res.status(200).json(data);
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
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
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
// 🚀 เริ่มต้นรันเซิร์ฟเวอร์
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 AuraHealth Backend API running on http://localhost:${PORT}`);
});
