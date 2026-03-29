import React from 'react';
import { View } from 'react-native';

import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

export function AiAnalysisPreview() {
  return (
    <View className="items-center justify-center" style={{ width: wp(112), height: hp(104) }}>
      <View
        className="justify-between bg-white"
        style={{
          width: wp(104),
          height: hp(88),
          borderRadius: RADIUS.md,
          padding: wp(10),
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ height: hp(4), width: wp(40), borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)', marginTop: hp(4) }} />

        <View className="items-center justify-center" style={{ marginVertical: hp(6) }}>
          <View
            style={{
              width: wp(36),
              height: wp(36),
              borderRadius: wp(18),
              borderWidth: 4,
              borderColor: 'rgba(0, 0, 0, 0.04)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: wp(36),
              height: wp(36),
              borderRadius: wp(18),
              borderWidth: 4,
              borderColor: COLORS.primary,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: wp(12),
              height: hp(4),
              borderRadius: 2,
              backgroundColor: 'rgba(102, 102, 238, 0.2)',
            }}
          />
        </View>

        {[
          { color: COLORS.primary, width: '70%' },
          { color: COLORS.chartBlue, width: '40%' },
        ].map((item, index) => (
          <View key={index} className="flex-row items-center" style={{ gap: wp(4) }}>
            <View
              style={{
                width: wp(6),
                height: wp(6),
                borderRadius: wp(3),
                backgroundColor: item.color,
              }}
            />
            <View
              className="flex-1"
              style={{ height: hp(4), borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
            >
              <View
                style={{
                  width: item.width as never,
                  height: '100%',
                  borderRadius: 2,
                  backgroundColor: item.color,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AiGoalPreview() {
  return (
    <View className="items-center justify-center" style={{ width: wp(112), height: hp(104) }}>
      <View
        className="justify-between bg-white"
        style={{
          width: wp(104),
          height: hp(88),
          borderRadius: RADIUS.md,
          padding: wp(10),
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="items-center" style={{ gap: hp(4), marginTop: hp(4) }}>
          <View style={{ height: hp(4), width: wp(30), borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)' }} />
          <View
            style={{
              width: wp(50),
              height: hp(8),
              borderRadius: 2,
              marginTop: hp(2),
              backgroundColor: COLORS.primary,
            }}
          />
        </View>

        <View
          style={{
            height: hp(6),
            marginTop: hp(10),
            borderRadius: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            position: 'relative',
          }}
        >
          <View
            style={{
              width: '60%',
              height: '100%',
              borderRadius: 3,
              backgroundColor: COLORS.chartBlue,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: -hp(8),
              left: '50%',
              width: wp(12),
              height: hp(10),
              borderRadius: 2,
              backgroundColor: '#374151',
            }}
          />
        </View>

        <View
          className="flex-row items-end justify-between"
          style={{ height: hp(20), marginTop: hp(6), paddingHorizontal: wp(2) }}
        >
          {[16, 14, 12, 18, 10, 8, 6].map((height, index) => (
            <View
              key={index}
              style={{
                width: wp(6),
                height: hp(height),
                borderRadius: 2,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                backgroundColor: index >= 4 ? COLORS.chartGreen : 'rgba(0, 0, 0, 0.08)',
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function AiNotificationPreview() {
  return (
    <View className="items-center justify-center" style={{ width: wp(112), height: hp(104) }}>
      <View
        className="overflow-hidden bg-white"
        style={{
          width: wp(74),
          height: hp(98),
          borderRadius: RADIUS.lg,
          borderWidth: 2,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          padding: wp(6),
        }}
      >
        <View className="flex-row items-center" style={{ gap: wp(4), marginBottom: hp(8) }}>
          <View
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(5),
              backgroundColor: 'rgba(0, 0, 0, 0.06)',
            }}
          />
          <View style={{ height: hp(4), width: wp(30), borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)' }} />
        </View>

        <View style={{ height: hp(4), width: '100%', borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)', marginBottom: hp(6) }} />
        <View style={{ height: hp(4), width: '80%', borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)', marginBottom: hp(6) }} />
        <View style={{ height: hp(4), width: '60%', borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.06)' }} />

        <View
          className="flex-row items-center bg-white"
          style={{
            position: 'absolute',
            top: hp(10),
            left: wp(4),
            right: wp(4),
            gap: wp(4),
            borderRadius: RADIUS.sm,
            padding: wp(4),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
            zIndex: 10,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <View
            style={{
              width: wp(8),
              height: wp(8),
              borderRadius: 2,
              backgroundColor: COLORS.primary,
            }}
          />
          <View
            className="flex-1"
            style={{ height: hp(6), borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.04)' }}
          />
        </View>
      </View>
    </View>
  );
}
