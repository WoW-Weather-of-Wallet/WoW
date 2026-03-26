import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from '../../screens/main/MyPageScreen.styles';

interface MyPageActionButtonsProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function MyPageActionButtons({
  onLogout,
  onDeleteAccount,
}: MyPageActionButtonsProps) {
  return (
    <>
      <TouchableOpacity style={styles.readOnlyInput} onPress={onLogout}>
        <Text style={[styles.readOnlyLabel, { color: COLORS.textPrimary }]}>로그아웃</Text>
        <Ionicons name="log-out-outline" size={wp(20)} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.readOnlyInput, { borderColor: COLORS.error + '30', marginTop: hp(10) }]}
        onPress={onDeleteAccount}
      >
        <Text style={[styles.readOnlyLabel, { color: COLORS.error }]}>회원 탈퇴</Text>
        <Ionicons name="exit-outline" size={wp(20)} color={COLORS.error} />
      </TouchableOpacity>
    </>
  );
}
