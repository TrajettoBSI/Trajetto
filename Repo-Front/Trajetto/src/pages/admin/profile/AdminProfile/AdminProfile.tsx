import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import LanguagePickerModal from '@/src/components/LanguageSwitcher/LanguagePickerModal';
import ProfileHero from '@/src/components/ProfileHero/ProfileHero';
import MenuItem from '@/src/components/MenuItem/MenuItem';
import { useAdminProfile } from './hooks/useAdminProfile';
import { styles } from './styles/styles';

export default function AdminProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const { t, user, router, menuSections, languagePicker } = useAdminProfile();

  return (
    <View style={s.safe}>
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('profile.headerTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
          email={user?.email}
        />

        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={s.section}>
            {section.title && <Text style={s.sectionTitle}>{section.title}</Text>}
            <View style={s.menuCard}>
              {section.items.map((item, iIdx) => (
                <React.Fragment key={item.label}>
                  <MenuItem {...item} />
                  {iIdx < section.items.length - 1 && <View style={s.separator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <LanguagePickerModal
        visible={languagePicker.open}
        onClose={() => languagePicker.setOpen(false)}
        current={languagePicker.current}
        onSelect={languagePicker.select}
      />
    </View>
  );
}
