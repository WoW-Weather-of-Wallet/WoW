import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface ProfileEditHeaderProps {
  name: string;
  onEditPress?: () => void;
}

/**
 * 프로젝트의 디자인 톤앤매너를 유지한 프로필 수정 헤더 컴포넌트입니다.
 * 원형 아바타 하단에 편집 버튼을 배치하여 직관적인 UX를 제공합니다.
 */
export default function ProfileEditHeader({ name, onEditPress }: ProfileEditHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBadge} 
          activeOpacity={0.7}
          onPress={onEditPress}
        >
          <Ionicons name="camera" size={wp(14)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.nameText}>{name}님</Text>
      <Text style={styles.emailText}>개인정보 및 서비스 설정을 관리하세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: hp(24),
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: hp(16),
  },
  avatarCircle: {
    width: wp(86),
    height: wp(86),
    borderRadius: wp(43),
    backgroundColor: COLORS.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fp(34),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  emailText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
});
