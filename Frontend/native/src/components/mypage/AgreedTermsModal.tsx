import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import { styles } from './AgreedTermsModal.styles';

interface AgreedTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AgreedTermsModal({ visible, onClose }: AgreedTermsModalProps) {
  const navigation = useNavigation<any>();
  const { documents, isLoading } = useTermDocuments(visible);

  const handleViewDocument = (key: TermDocumentKey) => {
    const document = documents[key];

    if (!document.url) {
      Alert.alert('불러오기 실패', '약관 문서를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
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
            {isLoading ? (
              <View style={styles.noticeBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.noticeText}>약관 정보를 불러오는 중입니다.</Text>
              </View>
            ) : null}

            <TermItem
              title={documents.service.title}
              date={documents.service.effectiveDate}
              onPress={() => handleViewDocument('service')}
            />
            <TermItem
              title={documents.privacy.title}
              date={documents.privacy.effectiveDate}
              onPress={() => handleViewDocument('privacy')}
            />
            <TermItem
              title={documents.telecom.title}
              date={documents.telecom.effectiveDate}
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
        <Text style={styles.termDate}>{date || '시행일 정보 없음'}</Text>
      </View>
      <View style={styles.viewBadge}>
        <Text style={styles.viewText}>보기</Text>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}
