import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isRankingPage = pathname === '/ranking';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoSection}>
        <Text style={styles.title} onPress={() => router.replace('/')}>
          Aura<Text style={styles.highlight}>Health</Text>
        </Text>
        <Text style={styles.subtitle}>ตารางโภชนาการ & ออกกำลังกายอัจฉริยะ</Text>
      </View>
      
      {!isRankingPage && (
        <Pressable
          style={styles.rankingNavBtn}
          onPress={() => router.push('/ranking')}
        >
          <Text style={styles.rankingNavBtnText}>🏆 ตารางคะแนนทีม</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoSection: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    cursor: 'pointer' as any,
  },
  highlight: {
    color: '#2563EB',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  rankingNavBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  rankingNavBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
