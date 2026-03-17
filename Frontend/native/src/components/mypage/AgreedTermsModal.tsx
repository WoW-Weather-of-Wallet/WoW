import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { TERM_DOCUMENTS, TermDocumentKey } from '../../constants/terms';

interface AgreedTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AgreedTermsModal({ visible, onClose }: AgreedTermsModalProps) {
  const navigation = useNavigation<any>();

  const handleViewDocument = (key: TermDocumentKey) => {
    const document = TERM_DOCUMENTS[key];

    if (!document.url) {
      Alert.alert('준비 중', '이 약관의 PDF 링크는 아직 연결되지 않았습니다.');
      return;
    }

    navigation.navigate('TermsPdf', {
      title: document.title,
      url: document.url,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
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
              title={TERM_DOCUMENTS.service.title}
              date={TERM_DOCUMENTS.service.effectiveDate}
              onPress={() => handleViewDocument('service')}
            />
            <TermItem
              title={TERM_DOCUMENTS.privacy.title}
              date={TERM_DOCUMENTS.privacy.effectiveDate}
              onPress={() => handleViewDocument('privacy')}
            />
            <TermItem
              title={TERM_DOCUMENTS.telecom.title}
              date={TERM_DOCUMENTS.telecom.effectiveDate}
              onPress={() => handleViewDocument('telecom')}
            />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                서비스 이용을 위해 필수적으로 동의하신 약관들입니다. 각 항목의 보기 버튼을 누르면
                상세 내용을 확인할 수 있습니다.
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

function TermItem({
  title,
  date,
  onPress,
}: {
  title: string;
  date: string;
  onPress: () => void;
}) {
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
