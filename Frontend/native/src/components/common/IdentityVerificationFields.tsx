import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import IdentityNameSection, {
  type IdentityNameSectionProps,
} from './IdentityNameSection';
import IdentitySsnSection, {
  type IdentitySsnSectionProps,
} from './IdentitySsnSection';
import TelecomPhoneInputSection, {
  type TelecomPhoneInputSectionProps,
} from './TelecomPhoneInputSection';

export interface IdentityVerificationFieldsProps {
  nameSection: IdentityNameSectionProps;
  ssnSection?: IdentitySsnSectionProps;
  phoneSection?: TelecomPhoneInputSectionProps;
  nameWrapperStyle?: StyleProp<ViewStyle>;
  ssnWrapperStyle?: StyleProp<ViewStyle>;
  phoneWrapperStyle?: StyleProp<ViewStyle>;
  nameDelay?: number;
  ssnDelay?: number;
  phoneDelay?: number;
  duration?: number;
}

export default function IdentityVerificationFields({
  nameSection,
  ssnSection,
  phoneSection,
  nameWrapperStyle,
  ssnWrapperStyle,
  phoneWrapperStyle,
  nameDelay = 0,
  ssnDelay = 0,
  phoneDelay = 0,
  duration = 500,
}: IdentityVerificationFieldsProps) {
  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(nameDelay).duration(duration)}
        style={nameWrapperStyle}
      >
        <IdentityNameSection {...nameSection} />
      </Animated.View>

      {ssnSection ? (
        <Animated.View
          entering={FadeInDown.delay(ssnDelay).duration(duration)}
          style={ssnWrapperStyle}
        >
          <IdentitySsnSection {...ssnSection} />
        </Animated.View>
      ) : null}

      {phoneSection ? (
        <Animated.View
          entering={FadeInDown.delay(phoneDelay).duration(duration)}
          style={phoneWrapperStyle}
        >
          <TelecomPhoneInputSection {...phoneSection} />
        </Animated.View>
      ) : null}
    </>
  );
}
