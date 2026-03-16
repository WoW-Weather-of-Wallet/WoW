import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface AgreedTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 사용자가 서비스 가입 시 동의한 약관들을 다시 확인할 수 있는 모달입니다.
 */
export default function AgreedTermsModal({ visible, onClose }: AgreedTermsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>동의한 약관 확인</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <TermItem
              title="(필수) WOW 서비스 이용약관 동의"
              date="2024.03.10 동의함"
              onPress={() => {}}
            />
            <TermItem
              title="(필수) 개인정보 수집 및 이용 동의"
              date="2024.03.10 동의함"
              onPress={() => {}}
            />
            <TermItem
              title="(필수) 통신사 본인확인서비스 이용약관 동의"
              date="2024.03.10 동의함"
              onPress={() => {}}
            />
            
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                서비스 이용을 위해 필수적으로 동의하신 약관들입니다. 상세 내용은 각 항목의 '보기'를 통해 확인하실 수 있습니다.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TermItem({ title, date, onPress }: { title: string; date: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.termItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.termInfo}>
        <Text style={styles.termTitle}>{title}</Text>
        <Text style={styles.termDate}>{date}</Text>
      </View>
      <View style={styles.viewBadge}>
        <Text style={styles.viewText}>보기</Text>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(40),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: wp(4),
  },
  scrollContent: {
    gap: hp(16),
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  termInfo: {
    flex: 1,
    gap: hp(4),
  },
  termTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  termDate: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: '#F3F4F6',
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
    borderRadius: RADIUS.sm,
  },
  viewText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  noticeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    padding: wp(16),
    marginTop: hp(8),
  },
  noticeText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(20),
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: hp(18),
    alignItems: 'center',
    marginTop: hp(32),
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
