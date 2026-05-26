import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { DayPlan } from '../data/plannerData';

interface WorkoutGridProps {
  currentWorkoutPlan: DayPlan;
  completedExercises: string[];
  onToggleExercise: (exerciseName: string) => void;
}

export default function WorkoutGrid({
  currentWorkoutPlan,
  completedExercises,
  onToggleExercise,
}: WorkoutGridProps) {
  const exercises = currentWorkoutPlan.exercises || [];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>💪 ตารางออกกำลังกายประจำวัน</Text>

      {exercises.length > 0 ? (
        <View style={styles.workoutContainer}>
          {/* แบนเนอร์หัวข้อการฝึกประจำวัน */}
          <View style={styles.workoutBanner}>
            <Text style={styles.workoutTitle}>{currentWorkoutPlan.workoutTitle}</Text>
            <Text style={styles.workoutFocus}>จุดเน้น: {currentWorkoutPlan.workoutFocus}</Text>
          </View>

          {/* รายชื่อท่าฝึก */}
          <View style={styles.exercisesList}>
            {exercises.map((ex) => {
              const isCompleted = completedExercises.includes(ex.name);

              return (
                <Pressable
                  key={ex.id}
                  style={[styles.exCard, isCompleted && styles.exCardCompleted]}
                  onPress={() => onToggleExercise(ex.name)}
                >
                  {/* เช็คบ็อกซ์วงกลม */}
                  <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                    {isCompleted && <Text style={styles.checkMark}>✓</Text>}
                  </View>

                  {/* ข้อมูลท่าออกกำลังกาย */}
                  <View style={styles.exInfo}>
                    <Text style={[styles.exName, isCompleted && styles.exNameCompleted]}>
                      {ex.name}
                    </Text>
                    <Text style={[styles.exDesc, isCompleted && styles.exDescCompleted]}>
                      {ex.description}
                    </Text>
                    
                    {/* แบดจ์ระบุเป้าหมาย (เซ็ต/ครั้ง) */}
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{ex.sets} เซ็ต</Text>
                      </View>
                      <View style={[styles.badge, styles.badgeHighlight]}>
                        <Text style={[styles.badgeText, styles.badgeTextHighlight]}>{ex.reps}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        /* หน้าจอวันพักผ่อน (Rest Day) */
        <View style={styles.restCard}>
          <Text style={styles.restIcon}>😴</Text>
          <Text style={styles.restTitle}>วันพักผ่อน (Rest Day)</Text>
          <Text style={styles.restDesc}>
            วันนี้ไม่มีโปรแกรมการออกกำลังกาย ปล่อยให้ร่างกายและกล้ามเนื้อได้ซ่อมแซมตัวเอง 
            แนะนำให้นอนหลับพักผ่อนให้เพียงพอและดื่มน้ำเปล่ามากๆ เพื่อสุขภาพที่ดีครับ!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  workoutContainer: {
    width: '100%',
    gap: 12,
  },
  workoutBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  workoutFocus: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  exercisesList: {
    gap: 12,
  },
  exCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  exCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  exNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  exDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  exDescCompleted: {
    color: '#94A3B8',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeHighlight: {
    backgroundColor: '#ECFDF5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  badgeTextHighlight: {
    color: '#059669',
  },
  restCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  restIcon: {
    fontSize: 42,
    marginBottom: 14,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  restDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
});
