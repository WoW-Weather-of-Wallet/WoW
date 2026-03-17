import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

interface TermsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  // 휴대폰 인증 단계에서 필수 약관 동의 완료 여부를 상위 화면으로 전달한다.
  onConfirm: (termsAgreed: boolean) => void;
  flow?: 'FindId' | 'FindPw' | string;
}

export default function TermsBottomSheet({ visible, onClose, onConfirm, flow }: TermsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  
  const [allAgreed, setAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    telecom: false,
  });

  const isRecovery = flow === 'FindId' || flow === 'FindPw';

  // 회원가입이면 3개 전부, 복구(ID/PW 찾기)면 서비스 약관 제외 2개만 필수
  const isAllRequiredAgreed = isRecovery 
    ? agreements.privacy && agreements.telecom 
    : agreements.service && agreements.privacy && agreements.telecom;

  // 약관 바텀시트 내부 체크 상태를 기반으로 "전체 동의" 표시를 동기화한다.
  useEffect(() => {
    setAllAgreed(isAllRequiredAgreed);
  }, [agreements, isAllRequiredAgreed]);

  const toggleAll = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setAgreements({
      service: isRecovery ? false : newValue,
      privacy: newValue,
      telecom: newValue,
    });
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.content, { paddingBottom: insets.bottom + hp(32) }]} 
          onPress={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않도록
        >
          <View style={styles.header}>
            <Text style={styles.title}>약관 동의</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.allAgreeContainer} onPress={toggleAll} activeOpacity={0.7}>
            <Ionicons 
              name="checkmark-circle" 
              size={wp(28)} 
              color={allAgreed ? COLORS.primary : COLORS.border} 
            />
            <Text style={styles.allAgreeText}>전체 동의하기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.agreementsList}>
            {!isRecovery && (
              <AgreementRow 
                title="(필수) WOW 서비스 이용약관 동의" 
                checked={agreements.service} 
                onToggle={() => toggleAgreement('service')} 
              />
            )}
            <AgreementRow 
              title="(필수) 개인정보 수집 및 이용 동의" 
              checked={agreements.privacy} 
              onToggle={() => toggleAgreement('privacy')} 
            />
            <AgreementRow 
              title="(필수) 통신사 본인확인서비스 이용약관 동의" 
              checked={agreements.telecom} 
              onToggle={() => toggleAgreement('telecom')} 
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.confirmButton, isAllRequiredAgreed && styles.activeButton]}
              disabled={!isAllRequiredAgreed}
              onPress={() => {
                onClose();
                setTimeout(() => onConfirm(true), 300);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.confirmButtonText, isAllRequiredAgreed && styles.activeButtonText]}>
                동의하고 계속하기
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const AgreementRow = ({ title, checked, onToggle }: { title: string, checked: boolean, onToggle: () => void }) => (
  <View style={styles.row}>
    <TouchableOpacity style={styles.rowLeft} onPress={onToggle} activeOpacity={0.7}>
      <Ionicons 
        name="checkmark" 
        size={wp(24)} 
        color={checked ? COLORS.primary : COLORS.border} 
        style={styles.checkIcon} 
      />
      <Text style={styles.rowText}>{title}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.viewButton}>
      <Text style={styles.viewText}>보기</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  content: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: wp(24), 
    borderTopRightRadius: wp(24), 
    paddingHorizontal: wp(24), 
    paddingTop: hp(24) 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: hp(28) 
  },
  title: { 
    fontSize: fp(22), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A' 
  },
  closeButton: { 
    padding: wp(4) 
  },
  allAgreeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    padding: wp(16), 
    borderRadius: wp(12), 
    marginBottom: hp(24) 
  },
  allAgreeText: { 
    fontSize: fp(18), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A', 
    marginLeft: wp(12) 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E5E7EB', 
    marginBottom: hp(24) 
  },
  agreementsList: { 
    gap: hp(20), 
    marginBottom: hp(40) 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  checkIcon: { 
    marginRight: wp(12) 
  },
  rowText: { 
    fontSize: fp(16), 
    fontFamily: FONTS.medium, 
    color: '#4B5563', 
    flex: 1 
  },
  viewButton: { 
    padding: wp(4), 
    paddingLeft: wp(12) 
  },
  viewText: { 
    fontSize: fp(14), 
    fontFamily: FONTS.medium, 
    color: '#9CA3AF', 
    textDecorationLine: 'underline' 
  },
  buttonContainer: { 
    width: '100%', 
    marginTop: hp(10) 
  },
  confirmButton: { 
    backgroundColor: '#E5E7EB', 
    borderRadius: wp(30), 
    paddingVertical: hp(18), 
    alignItems: 'center' 
  },
  activeButton: { 
    backgroundColor: COLORS.primary 
  },
  confirmButtonText: { 
    fontSize: fp(20), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A' 
  },
  activeButtonText: { 
    color: '#FFFFFF' 
  },
});
