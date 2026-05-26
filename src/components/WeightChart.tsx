import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightChartProps {
  weightHistory: WeightEntry[];
  onAddWeight: (weight: number) => void;
}

export default function WeightChart({ weightHistory, onAddWeight }: WeightChartProps) {
  const [newWeight, setNewWeight] = useState('');

  const handleWeightSubmit = () => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) {
      alert('กรุณากรอกน้ำหนักตัวที่ถูกต้องด้วยครับ');
      return;
    }
    onAddWeight(w);
    setNewWeight('');
  };

  const renderChart = () => {
    if (!weightHistory || weightHistory.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>ยังไม่มีบันทึกข้อมูลน้ำหนักตัว</Text>
        </View>
      );
    }

    const weights = weightHistory.map(h => h.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = maxW - minW === 0 ? 1 : maxW - minW;

    // เลือกแสดงเฉพาะ 5 ค่าล่าสุด
    const displayHistory = weightHistory.slice(-5);

    return (
      <View style={styles.chartContainer}>
        {displayHistory.map((item, index) => {
          // คำนวณความสูงของแท่งกราฟแบบสัมพันธ์กัน (15% - 70% ของพื้นที่การ์ด)
          const heightPercent = ((item.weight - minW) / range) * 50 + 20;

          return (
            <View key={index} style={styles.chartColumn}>
              <Text style={styles.chartBarValue}>{item.weight}</Text>
              <View
                style={[
                  styles.chartBar,
                  { height: `${heightPercent}%` }
                ]}
              />
              <Text style={styles.chartBarLabel}>{item.date}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>⚖️</Text>
        <Text style={styles.title}>แนวโน้มน้ำหนักตัว</Text>
      </View>

      <View style={styles.chartWrapper}>
        {renderChart()}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="กก."
          value={newWeight}
          onChangeText={setNewWeight}
        />
        <Pressable style={styles.saveBtn} onPress={handleWeightSubmit}>
          <Text style={styles.saveBtnText}>บันทึก</Text>
        </Pressable>
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
    marginBottom: 14,
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
  chartWrapper: {
    marginBottom: 16,
  },
  emptyChart: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  chartContainer: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  chartColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 4,
  },
  chartBar: {
    width: 14,
    backgroundColor: '#2563EB',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartBarLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1E293B',
    outlineStyle: 'none',
  } as any,
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
