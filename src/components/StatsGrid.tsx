import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';

interface StatsGridProps {
  totalCalories: number;
  targetCalories: number;
  waterIntake: number;
  onAddWater: (amount: number) => void;
  onResetWater: () => void;
  workoutProgressPercent: number;
}

export default function StatsGrid({
  totalCalories,
  targetCalories,
  waterIntake,
  onAddWater,
  onResetWater,
  workoutProgressPercent,
}: StatsGridProps) {
  const calProgress = Math.min(totalCalories / targetCalories, 1);
  const waterProgress = Math.min(waterIntake / 2000, 1);

  return (
    <View style={styles.container}>
      {/* การ์ดแคลอรี */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🥗</Text>
          <Text style={styles.cardTitle}>พลังงานวันนี้</Text>
        </View>
        <Text style={styles.mainValue}>
          {totalCalories} <Text style={styles.unit}>/ {targetCalories} kcal</Text>
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${calProgress * 100}%`, backgroundColor: '#3B82F6' }]} />
        </View>
        <Text style={styles.cardSubtitle}>
          ได้รับ {Math.round(calProgress * 100)}% ของเป้าหมายประจำวัน
        </Text>
      </View>

      {/* การ์ดดื่มน้ำ */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>💧</Text>
          <Text style={styles.cardTitle}>ดื่มน้ำประจำวัน</Text>
        </View>
        <Text style={styles.mainValue}>
          {waterIntake} <Text style={styles.unit}>/ 2000 ml</Text>
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${waterProgress * 100}%`, backgroundColor: '#06B6D4' }]} />
        </View>
        
        <View style={styles.buttonRow}>
          <Pressable style={styles.btnSmall} onPress={() => onAddWater(250)}>
            <Text style={styles.btnSmallText}>+ 250ml</Text>
          </Pressable>
          <Pressable style={styles.btnSmall} onPress={() => onAddWater(500)}>
            <Text style={styles.btnSmallText}>+ 500ml</Text>
          </Pressable>
          <Pressable style={styles.btnOutline} onPress={onResetWater}>
            <Text style={styles.btnOutlineText}>รีเซ็ต</Text>
          </Pressable>
        </View>
      </View>

      {/* การ์ดออกกำลังกาย */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⚡</Text>
          <Text style={styles.cardTitle}>ความคืบหน้าออกกำลังกาย</Text>
        </View>
        <Text style={styles.mainValue}>
          {workoutProgressPercent}% <Text style={styles.unit}>สำเร็จ</Text>
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${workoutProgressPercent}%`, backgroundColor: '#10B981' }]} />
        </View>
        <Text style={styles.cardSubtitle}>
          {workoutProgressPercent === 100 ? 'ยอดเยี่ยม! สำเร็จเป้าหมายแล้ว' : 'หมั่นฝึกฝนให้ครบตามตารางกันครับ!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flex: 1,
    minWidth: Platform.OS === 'web' ? 250 : '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  mainValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94A3B8',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  btnSmall: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  btnOutlineText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
