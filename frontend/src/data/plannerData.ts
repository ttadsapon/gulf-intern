export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  description: string;
  completed?: boolean;
}

export interface DayPlan {
  day: string;
  workoutTitle: string;
  workoutFocus: string;
  exercises: Exercise[];
}

export const DAYS_OF_WEEK = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

export const MOCK_MEALS: Meal[] = [
  // Breakfast
  { id: 'b1', name: 'อกไก่ย่างกับข้าวกล้อง', calories: 350, protein: 30, carbs: 45, fat: 5, category: 'breakfast' },
  { id: 'b2', name: 'ไข่ต้ม 2 ฟอง + ขนมปังโฮลวีต 2 แผ่น', calories: 280, protein: 18, carbs: 30, fat: 10, category: 'breakfast' },
  { id: 'b3', name: 'โอ๊ตมีลผลไม้รวมและกล้วยหอม', calories: 310, protein: 10, carbs: 55, fat: 6, category: 'breakfast' },
  { id: 'b4', name: 'กรีกโยเกิร์ตใส่น้ำผึ้งและกราโนล่า', calories: 250, protein: 15, carbs: 32, fat: 7, category: 'breakfast' },
  
  // Lunch
  { id: 'l1', name: 'ข้าวผัดอกไก่ใส่ผักรวม', calories: 420, protein: 32, carbs: 50, fat: 9, category: 'lunch' },
  { id: 'l2', name: 'สลัดทูน่าในน้ำแร่ไข่ต้ม', calories: 290, protein: 26, carbs: 12, fat: 15, category: 'lunch' },
  { id: 'l3', name: 'กะเพราอกไก่ราดข้าวกล้อง + ไข่ดาวน้ำ', calories: 450, protein: 35, carbs: 55, fat: 10, category: 'lunch' },
  { id: 'l4', name: 'แกงส้มกุ้งผักรวม + ข้าวสวย', calories: 310, protein: 20, carbs: 46, fat: 4, category: 'lunch' },
  
  // Dinner
  { id: 'd1', name: 'ปลาย่างเกลือกับบล็อคโคลี่ต้ม', calories: 280, protein: 28, carbs: 10, fat: 12, category: 'dinner' },
  { id: 'd2', name: 'สเต็กอกไก่พริกไทยดำ + ผักย่าง', calories: 360, protein: 35, carbs: 15, fat: 16, category: 'dinner' },
  { id: 'd3', name: 'แกงจืดเต้าหู้หมูสับใส่วุ้นเส้น', calories: 220, protein: 15, carbs: 18, fat: 9, category: 'dinner' },
  { id: 'd4', name: 'แซลมอนย่างซีอิ๊วญี่ปุ่น + ผักลวก', calories: 410, protein: 24, carbs: 18, fat: 26, category: 'dinner' },
  
  // Snacks
  { id: 's1', name: 'ถั่วอัลมอนด์อบ (1 กำมือ)', calories: 170, protein: 6, carbs: 6, fat: 15, category: 'snack' },
  { id: 's2', name: 'เวย์โปรตีน 1 สกู๊ป', calories: 120, protein: 24, carbs: 3, fat: 1, category: 'snack' },
  { id: 's3', name: 'แอปเปิ้ลเขียว 1 ลูก', calories: 80, protein: 0, carbs: 20, fat: 0, category: 'snack' }
];

export const DEFAULT_WEEKLY_MEALS: Record<string, Meal[]> = {
  'จันทร์': [
    MOCK_MEALS.find(m => m.id === 'b2')!,
    MOCK_MEALS.find(m => m.id === 'l1')!,
    MOCK_MEALS.find(m => m.id === 'd1')!,
    MOCK_MEALS.find(m => m.id === 's3')!
  ],
  'อังคาร': [
    MOCK_MEALS.find(m => m.id === 'b1')!,
    MOCK_MEALS.find(m => m.id === 'l3')!,
    MOCK_MEALS.find(m => m.id === 'd3')!,
    MOCK_MEALS.find(m => m.id === 's2')!
  ],
  'พุธ': [
    MOCK_MEALS.find(m => m.id === 'b3')!,
    MOCK_MEALS.find(m => m.id === 'l2')!,
    MOCK_MEALS.find(m => m.id === 'd2')!,
    MOCK_MEALS.find(m => m.id === 's1')!
  ],
  'พฤหัสบดี': [
    MOCK_MEALS.find(m => m.id === 'b4')!,
    MOCK_MEALS.find(m => m.id === 'l4')!,
    MOCK_MEALS.find(m => m.id === 'd4')!,
    MOCK_MEALS.find(m => m.id === 's3')!
  ],
  'ศุกร์': [
    MOCK_MEALS.find(m => m.id === 'b2')!,
    MOCK_MEALS.find(m => m.id === 'l1')!,
    MOCK_MEALS.find(m => m.id === 'd3')!,
    MOCK_MEALS.find(m => m.id === 's2')!
  ],
  'เสาร์': [
    MOCK_MEALS.find(m => m.id === 'b1')!,
    MOCK_MEALS.find(m => m.id === 'l3')!,
    MOCK_MEALS.find(m => m.id === 'd1')!,
    MOCK_MEALS.find(m => m.id === 's1')!
  ],
  'อาทิตย์': [
    MOCK_MEALS.find(m => m.id === 'b3')!,
    MOCK_MEALS.find(m => m.id === 'l2')!,
    MOCK_MEALS.find(m => m.id === 'd2')!,
    MOCK_MEALS.find(m => m.id === 's3')!
  ]
};

export const DEFAULT_WEEKLY_WORKOUTS: Record<string, DayPlan> = {
  'จันทร์': {
    day: 'จันทร์',
    workoutTitle: 'Full Body HIIT',
    workoutFocus: 'เน้นความแข็งแรงและการเผาผลาญพลังงานทั่วร่างกาย',
    exercises: [
      { id: 'ex1_1', name: 'Jumping Jacks (กระโดดตบ)', sets: 3, reps: '45 วินาที', description: 'บริหารกล้ามเนื้อหัวใจและข้อต่อทั่วร่างกาย' },
      { id: 'ex1_2', name: 'Bodyweight Squats (สควอท)', sets: 3, reps: '15 ครั้ง', description: 'สร้างกล้ามเนื้อต้นขา ก้น และสะโพก' },
      { id: 'ex1_3', name: 'Push-ups (วิดพื้น)', sets: 3, reps: '12 ครั้ง', description: 'ฝึกความแข็งแรงหน้าอก ไหล่ และแขน' },
      { id: 'ex1_4', name: 'Plank (แพลงก์)', sets: 3, reps: '45 วินาที', description: 'เกร็งกล้ามเนื้อแกนกลางลำตัวและหน้าท้อง' }
    ]
  },
  'อังคาร': {
    day: 'อังคาร',
    workoutTitle: 'Cardio & Abs',
    workoutFocus: 'คาร์ดิโอกระชับสัดส่วนและหน้าท้อง',
    exercises: [
      { id: 'ex2_1', name: 'Burpees (เบอร์พี)', sets: 3, reps: '10 ครั้ง', description: 'ฝึกกำลังขา สะโพก และความแข็งแรงของหัวใจ' },
      { id: 'ex2_2', name: 'Bicycle Crunches', sets: 3, reps: '20 ครั้ง', description: 'บิดเอวสลับศอกแตะเข่าตรงข้าม เสริมสร้างหน้าท้องส่วนข้าง' },
      { id: 'ex2_3', name: 'Russian Twists', sets: 3, reps: '20 ครั้ง', description: 'เอนตัวเกร็งหน้าท้อง บิดเอวไปซ้ายและขวา' },
      { id: 'ex2_4', name: 'Mountain Climbers', sets: 3, reps: '30 วินาที', description: 'ชันเข่าดึงสลับซ้ายขวาอย่างรวดเร็ว' }
    ]
  },
  'พุธ': {
    day: 'พุธ',
    workoutTitle: 'Active Recovery',
    workoutFocus: 'วันพักผ่อนและยืดเหยียดฟื้นฟูกล้ามเนื้อ',
    exercises: []
  },
  'พฤหัสบดี': {
    day: 'พฤหัสบดี',
    workoutTitle: 'Lower Body Blast',
    workoutFocus: 'สร้างความแข็งแรงและความกระชับส่วนขาและสะโพก',
    exercises: [
      { id: 'ex4_1', name: 'Lunges (ก้าวขาลดระดับ)', sets: 3, reps: '12 ครั้ง/ข้าง', description: 'ก้าวขาไปข้างหน้าย่อเข่าทำมุม 90 องศา สลับซ้ายขวา' },
      { id: 'ex4_2', name: 'Glute Bridges (ดันสะโพก)', sets: 3, reps: '15 ครั้ง', description: 'นอนราบชันเข่า ดันสะโพกขึ้นเกร็งก้นค้างไว้ 2 วินาที' },
      { id: 'ex4_3', name: 'Sumo Squats', sets: 3, reps: '15 ครั้ง', description: 'กางขาให้กว้างกว่าช่วงไหล่ ปลายเท้าชี้ออกเพื่อกระชับขาด้านใน' }
    ]
  },
  'ศุกร์': {
    day: 'ศุกร์',
    workoutTitle: 'Upper Body & Core',
    workoutFocus: 'กระชับแขน หัวไหล่ หน้าอก และแกนกลาง',
    exercises: [
      { id: 'ex5_1', name: 'Dips กับเก้าอี้ (Tricep Dips)', sets: 3, reps: '12 ครั้ง', description: 'เกาะขอบเก้าอี้ หย่อนก้นลงแล้วใช้แรงหลังแขนดันตัวขึ้น' },
      { id: 'ex5_2', name: 'Superman Hold', sets: 3, reps: '30 วินาที', description: 'นอนคว่ำเกร็งกล้ามเนื้อหลังล่าง ยกหน้าอกและขาขึ้นจากพื้น' },
      { id: 'ex5_3', name: 'Plank Jacks', sets: 3, reps: '30 วินาที', description: 'ตั้งท่าแพลงก์ แล้วกระโดดกางและหุบขาสลับกัน' }
    ]
  },
  'เสาร์': {
    day: 'เสาร์',
    workoutTitle: 'Weekend Jogging',
    workoutFocus: 'วิ่งจ๊อกกิ้งคาร์ดิโอคุมโซนหัวใจเผาผลาญไขมัน',
    exercises: [
      { id: 'ex6_1', name: 'Steady Jogging (วิ่งเร็วสม่ำเสมอ)', sets: 1, reps: '30 นาที', description: 'วิ่งจ๊อกกิ้งเบาๆ สบายๆ เพื่อกระตุ้นระบบเผาผลาญ' },
      { id: 'ex6_2', name: 'Static Stretching (ยืดเหยียดอยู่กับที่)', sets: 1, reps: '10 นาที', description: 'ยืดเหยียดหลังออกกำลังกายเพื่อลดความล้าของกล้ามเนื้อ' }
    ]
  },
  'อาทิตย์': {
    day: 'อาทิตย์',
    workoutTitle: 'Rest & Recover',
    workoutFocus: 'พักผ่อนเต็มรูปแบบเพื่อให้ร่างกายซ่อมแซมตัวเอง',
    exercises: []
  }
};
