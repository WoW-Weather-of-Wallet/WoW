import React, { type ReactNode } from 'react';
import {
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import AuthActionButton from './AuthActionButton';
import IdentityStepFormLayout from './IdentityStepFormLayout';
import IdentityVerificationFields, {
  type IdentityVerificationFieldsProps,
} from './IdentityVerificationFields';
import TelecomSelectModal from './TelecomSelectModal';

interface IdentityVerificationFormStageProps {
  title: ReactNode;
  subtitle: ReactNode;
  onBack: () => void;
  fields: IdentityVerificationFieldsProps;
  extraContent?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  stepIndicatorContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  bottomContainerStyle?: StyleProp<ViewStyle>;
  actionLabel: string;
  actionLoading?: boolean;
  actionDisabled?: boolean;
  actionActive?: boolean;
  onActionPress?: () => void;
  actionContainerStyle?: StyleProp<ViewStyle>;
  actionActiveContainerStyle?: StyleProp<ViewStyle>;
  actionDisabledContainerStyle?: StyleProp<ViewStyle>;
  actionTextStyle?: StyleProp<TextStyle>;
  actionActiveTextStyle?: StyleProp<TextStyle>;
  actionDisabledTextStyle?: StyleProp<TextStyle>;
  actionLoadingColor?: string;
  telecomModalVisible: boolean;
  onCloseTelecomModal: () => void;
  onSelectTelecom: (value: string) => void;
  telecomOptions: readonly string[];
  telecomBottomInset?: number;
  telecomModalOverlayStyle?: StyleProp<ViewStyle>;
  telecomModalContentStyle?: StyleProp<ViewStyle>;
  telecomModalHeaderStyle?: StyleProp<ViewStyle>;
  telecomModalTitleStyle?: StyleProp<TextStyle>;
  telecomModalItemStyle?: StyleProp<ViewStyle>;
  telecomModalItemTextStyle?: StyleProp<TextStyle>;
}

export default function IdentityVerificationFormStage({
  title,
  subtitle,
  onBack,
  fields,
  extraContent,
  containerStyle,
  scrollContentStyle,
  backButtonStyle,
  stepIndicatorContainerStyle,
  titleStyle,
  subtitleStyle,
  bottomContainerStyle,
  actionLabel,
  actionLoading = false,
  actionDisabled = false,
  actionActive = false,
  onActionPress,
  actionContainerStyle,
  actionActiveContainerStyle,
  actionDisabledContainerStyle,
  actionTextStyle,
  actionActiveTextStyle,
  actionDisabledTextStyle,
  actionLoadingColor,
  telecomModalVisible,
  onCloseTelecomModal,
  onSelectTelecom,
  telecomOptions,
  telecomBottomInset = 0,
  telecomModalOverlayStyle,
  telecomModalContentStyle,
  telecomModalHeaderStyle,
  telecomModalTitleStyle,
  telecomModalItemStyle,
  telecomModalItemTextStyle,
}: IdentityVerificationFormStageProps) {
  return (
    <>
      <IdentityStepFormLayout
        containerStyle={containerStyle}
        scrollContentStyle={scrollContentStyle}
        backButtonStyle={backButtonStyle}
        stepIndicatorContainerStyle={stepIndicatorContainerStyle}
        titleStyle={titleStyle}
        subtitleStyle={subtitleStyle}
        bottomContainerStyle={bottomContainerStyle}
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        bottomContent={
          <AuthActionButton
            label={actionLabel}
            loading={actionLoading}
            disabled={actionDisabled}
            active={actionActive}
            onPress={onActionPress}
            containerStyle={actionContainerStyle}
            activeContainerStyle={actionActiveContainerStyle}
            disabledContainerStyle={actionDisabledContainerStyle}
            textStyle={actionTextStyle}
            activeTextStyle={actionActiveTextStyle}
            disabledTextStyle={actionDisabledTextStyle}
            loadingColor={actionLoadingColor}
          />
        }
      >
        <IdentityVerificationFields {...fields} />
        {extraContent}
      </IdentityStepFormLayout>

      <TelecomSelectModal
        visible={telecomModalVisible}
        onClose={onCloseTelecomModal}
        onSelect={onSelectTelecom}
        options={telecomOptions}
        bottomInset={telecomBottomInset}
        overlayStyle={telecomModalOverlayStyle}
        contentStyle={telecomModalContentStyle}
        headerStyle={telecomModalHeaderStyle}
        titleStyle={telecomModalTitleStyle}
        itemStyle={telecomModalItemStyle}
        itemTextStyle={telecomModalItemTextStyle}
      />
    </>
  );
}
