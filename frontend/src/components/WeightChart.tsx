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
  weight: string;
  bodyFat: string;
  muscle: string;
  onChangeWeight: (val: string) => void;
  onChangeBodyFat: (val: string) => void;
  onChangeMuscle: (val: string) => void;
  onUpdateStats: () => void;
}

export default function WeightChart({
  weightHistory,
  weight,
  bodyFat,
  muscle,
  onChangeWeight,
  onChangeBodyFat,
  onChangeMuscle,
  onUpdateStats,
}: WeightChartProps) {

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
        <Text style={styles.title}>แนวโน้มน้ำหนักและมวลร่างกาย</Text>
      </View>

      <View style={styles.chartWrapper}>
        {renderChart()}
      </View>

      <View style={styles.statsInputRow}>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>น้ำหนัก (kg)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="เช่น 70"
            value={weight || ''}
            onChangeText={onChangeWeight}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>ไขมัน (%)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="เช่น 20"
            value={bodyFat || ''}
            onChangeText={onChangeBodyFat}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={styles.inputLabel}>กล้ามเนื้อ (kg)</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            placeholder="เช่น 30"
            value={muscle || ''}
            onChangeText={onChangeMuscle}
          />
        </View>
      </View>

      <Pressable style={styles.saveBtn} onPress={onUpdateStats}>
        <Text style={styles.saveBtnText}>💾 อัปเดตและคำนวณจัดอันดับ</Text>
      </Pressable>
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
  statsInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  textInput: {
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
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
