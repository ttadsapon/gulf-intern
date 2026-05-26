import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
}

interface ChecklistCardProps {
  dailyChecklist: Record<string, boolean>;
  onToggleChecklist: (id: string) => void;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'sleep', title: '😴 นอนหลับพักผ่อน 7-8 ชม.', desc: 'นอนหลับเต็มอิ่มเพื่อฟื้นฟูกล้ามเนื้อและซ่อมแซมส่วนที่สึกหรอ' },
  { id: 'water', title: '💧 ดื่มน้ำครบเป้าหมาย', desc: 'รักษาสมดุลระดับน้ำในร่างกายให้อยู่ในเกณฑ์ที่ดีตลอดวัน' },
  { id: 'walk', title: '🚶 เดินครบ 8,000 ก้าว', desc: 'กระตุ้นกิจกรรมทางกายและการทำงานของกล้ามเนื้อ' },
  { id: 'stretch', title: '🧘 ยืดเหยียดร่างกาย 10 นาที', desc: 'บรรเทาความเมื่อยล้าสะสมของร่างกายและเพิ่มความยืดหยุ่น' }
];

export default function ChecklistCard({
  dailyChecklist,
  onToggleChecklist,
}: ChecklistCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>ภารกิจสุขภาพรายวัน</Text>
      </View>
      <Text style={styles.desc}>
        กิจกรรมดูแลตัวเองประจำวันที่ช่วยส่งเสริมวินัยและการรักษาสุขภาพอย่างยั่งยืน
      </Text>

      <View style={styles.listContainer}>
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = dailyChecklist[item.id] || false;

          return (
            <Pressable
              key={item.id}
              style={[styles.itemCard, isChecked && styles.itemCardChecked]}
              onPress={() => onToggleChecklist(item.id)}
            >
              {/* ปุ่มวงกลม */}
              <View style={[styles.circle, isChecked && styles.circleChecked]}>
                {isChecked && <Text style={styles.checkMark}>✓</Text>}
              </View>

              {/* ข้อความข้อมูลภารกิจ */}
              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isChecked && styles.itemTitleChecked]}>
                  {item.title}
                </Text>
                <Text style={[styles.itemDesc, isChecked && styles.itemDescChecked]}>
                  {item.desc}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  desc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  listContainer: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  itemCardChecked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  circleChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemTitleChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itemDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  itemDescChecked: {
    color: '#94A3B8',
  },
});
