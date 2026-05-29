import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const pathname = usePathname();

  // ซ่อนแถบเมนูในหน้าย่อย (sub-pages) เพื่อไม่ให้แสดงซ้อนและบังปุ่มกดย้อนกลับ
  const isSubPage = ['/meal-planner', '/workout-planner', '/ranking', '/login', '/register'].includes(pathname);

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild style={isSubPage ? { display: 'none' } : undefined}>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>ภาพรวม</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>คู่มือระบบ</TabButton>
          </TabTrigger>
          {/* ซ่อนหน้าเมนูอื่นๆ ไว้ใน Tab Navigator เพื่อให้ระบบ Router รู้จักเส้นทางและเปลี่ยนหน้าด้วย router.push ได้ */}
          <TabTrigger name="meal-planner" href="/meal-planner" style={{ display: 'none' }} asChild>
            <View />
          </TabTrigger>
          <TabTrigger name="workout-planner" href="/workout-planner" style={{ display: 'none' }} asChild>
            <View />
          </TabTrigger>
          <TabTrigger name="ranking" href="/ranking" style={{ display: 'none' }} asChild>
            <View />
          </TabTrigger>
          <TabTrigger name="login" href="/login" style={{ display: 'none' }} asChild>
            <View />
          </TabTrigger>
          <TabTrigger name="register" href="/register" style={{ display: 'none' }} asChild>
            <View />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} pointerEvents="box-none" style={[styles.tabListContainer, props.style]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          AuraHealth
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
