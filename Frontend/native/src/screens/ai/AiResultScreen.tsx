import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './AiResultScreen.styles';
import GradientButton from '../../components/common/GradientButton';

/**
 * [AI-Result] 
 * 분석 결과 리포트 화면의 플레이스홀더입니다. 
 * 향후 실제 데이터가 들어올 영역을 비워두고 헤더와 기본 버튼만 구성합니다.
 */
export default function AiResultScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  // TO-DO: 실제 사용자 이름을 전역 상태(AuthStore 등)에서 가져오면 더 좋습니다.
  const userName = '사용자'; 

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.userName}>{userName} 님의</Text>
          <Text style={styles.title}>
            <Text style={styles.highlight}>AI 분석 결과</Text>입니다!
          </Text>
        </View>

        {/* 결과 리포트 영역 플레이스홀더 */}
        <View style={styles.resultCard}>
          <Text style={styles.placeholderText}>
            분석 리포트 결과 페이지{'\n'}구현 예정 영역입니다.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <GradientButton 
            title="확인 완료" 
            onPress={() => {
              // 메인 홈 또는 이전 화면으로 복귀
              navigation.navigate('MainTabs');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
