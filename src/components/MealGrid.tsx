import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform } from 'react-native';
import { Meal, MOCK_MEALS } from '../data/plannerData';

interface MealGridProps {
  currentMeals: (Meal | null)[];
  onUpdateMeal: (index: number, meal: Meal) => void;
}

const CATEGORIES = [
  { id: 'breakfast', label: '🌅 มื้อเช้า', index: 0 },
  { id: 'lunch', label: '☀️ มื้อกลางวัน', index: 1 },
  { id: 'dinner', label: '🌌 มื้อเย็น', index: 2 },
  { id: 'snack', label: '🍌 อาหารว่าง', index: 3 },
];

export default function MealGrid({ currentMeals, onUpdateMeal }: MealGridProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openMealSelector = (category: 'breakfast' | 'lunch' | 'dinner' | 'snack', index: number) => {
    setSelectedCategory(category);
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const selectMeal = (meal: Meal) => {
    if (selectedIndex !== null) {
      onUpdateMeal(selectedIndex, meal);
    }
    setModalVisible(false);
    setSelectedCategory(null);
    setSelectedIndex(null);
  };

  const filteredOptions = selectedCategory
    ? MOCK_MEALS.filter(m => m.category === selectedCategory)
    : [];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>📅 ตารางโภชนาการรายวัน</Text>
      
      <View style={styles.gridContainer}>
        {CATEGORIES.map((cat) => {
          const meal = currentMeals[cat.index];
          return (
            <View key={cat.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => openMealSelector(cat.id as any, cat.index)}
                >
                  <Text style={styles.actionBtnText}>{meal ? 'เปลี่ยน' : '+ เลือก'}</Text>
                </Pressable>
              </View>

              {meal ? (
                <View style={styles.mealContent}>
                  <Text style={styles.mealName} numberOfLines={2}>{meal.name}</Text>
                  
                  <View style={styles.macroPills}>
                    <View style={[styles.pill, styles.pillCarb]}><Text style={styles.pillText}>C: {meal.carbs}g</Text></View>
                    <View style={[styles.pill, styles.pillProtein]}><Text style={styles.pillText}>P: {meal.protein}g</Text></View>
                    <View style={[styles.pill, styles.pillFat]}><Text style={styles.pillText}>F: {meal.fat}g</Text></View>
                  </View>

                  <View style={styles.calBadge}>
                    <Text style={styles.calValue}>{meal.calories}</Text>
                    <Text style={styles.calUnit}>kcal</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>ยังไม่ได้เลือกเมนูอาหาร</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* โมดอลเลือกอาหาร */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                เลือกอาหารสำหรับ {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </Text>
              <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>ปิด</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {filteredOptions.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => selectMeal(item)}
                >
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemMacros}>
                      คาร์บ: {item.carbs}g | โปรตีน: {item.protein}g | ไขมัน: {item.fat}g
                    </Text>
                  </View>
                  <View style={styles.modalItemCal}>
                    <Text style={styles.modalItemCalVal}>{item.calories}</Text>
                    <Text style={styles.modalItemCalUnit}>kcal</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flex: 1,
    minWidth: Platform.OS === 'web' ? 240 : '100%',
    maxWidth: Platform.OS === 'web' ? '48%' : '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  mealContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 10,
  },
  macroPills: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  pillCarb: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  pillProtein: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pillFat: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  calBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  calValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  calUnit: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    height: '65%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    borderRadius: 10,
    marginVertical: 2,
  },
  modalItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalItemMacros: {
    fontSize: 11,
    color: '#64748B',
  },
  modalItemCal: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    minWidth: 54,
  },
  modalItemCalVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  modalItemCalUnit: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '500',
  },
});
