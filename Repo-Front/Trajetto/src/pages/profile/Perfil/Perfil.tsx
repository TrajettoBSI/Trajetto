import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import LanguagePickerModal from '@/src/components/LanguageSwitcher/LanguagePickerModal';
import { usePerfil } from './hooks/usePerfil';
import MenuItem from './components/MenuItem/MenuItem';
import ProfileHero from '@/src/components/ProfileHero/ProfileHero';
import { styles } from './styles/styles';

export default function Perfil() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const { t, user, router, menuSections, languagePicker } = usePerfil();

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>{t('menu.headerTitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
          email={user?.email}
          travelerProfile={user?.travelerProfile && user.travelerProfile !== 'SKIPPED' ? user.travelerProfile : undefined}
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

        <Text style={s.version}>{t('menu.version', { version: '1.0' })}</Text>
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
