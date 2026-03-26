import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import { useFixedExpensePickerSearch } from '../../hooks/useFixedExpensePickerSearch';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import FixedExpensePickerRow, {
  type SelectableTransactionItem,
} from './FixedExpensePickerRow';
import FixedExpensePickerSearchInput from './FixedExpensePickerSearchInput';

interface FixedExpensePickerSheetProps {
  visible: boolean;
  items: SelectableTransactionItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function FixedExpensePickerSheet({
  visible,
  items,
  selectedId,
  onSelect,
  onConfirm,
  onClose,
}: FixedExpensePickerSheetProps) {
  const { query, setQuery, filteredItems, hasQuery } =
    useFixedExpensePickerSearch(items);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={'\uACE0\uC815\uC9C0\uCD9C\uB85C \uB4F1\uB85D\uD560 \uAC70\uB798 \uC120\uD0DD'}
      subtitle={
        '\uACE0\uC815\uC9C0\uCD9C\uB85C \uAD00\uB9AC\uD560 \uAC70\uB798\uB97C \uC120\uD0DD\uD558\uBA74 \uC774\uD6C4 \uC6D4\uBCC4 \uD750\uB984\uC744 \uBCF4\uB2E4 \uC27D\uAC8C \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.'
      }
    >
      <FixedExpensePickerSearchInput value={query} onChangeText={setQuery} />

      <View style={{ gap: hp(4), marginBottom: hp(18) }}>
        {filteredItems.map((item) => (
          <FixedExpensePickerRow
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onPress={onSelect}
          />
        ))}

        {filteredItems.length === 0 ? (
          <View
            className="items-center"
            style={{
              borderRadius: RADIUS.xl,
              backgroundColor: COLORS.background,
              paddingHorizontal: wp(16),
              paddingVertical: hp(18),
            }}
          >
            <Text
              style={{
                fontSize: fp(15),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(6),
              }}
            >
              {hasQuery
                ? '\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694'
                : '\uC120\uD0DD\uD560 \uAC70\uB798 \uB0B4\uC5ED\uC774 \uC5C6\uC5B4\uC694'}
            </Text>
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: fp(19),
              }}
            >
              {hasQuery
                ? '\uB2E4\uB978 \uD0A4\uC6CC\uB4DC\uB85C \uB2E4\uC2DC \uAC80\uC0C9\uD558\uAC70\uB098 \uC804\uCCB4 \uBAA9\uB85D\uC744 \uD655\uC778\uD574\uBCF4\uC138\uC694.'
                : '\uD604\uC7AC \uACE0\uC815\uC9C0\uCD9C\uB85C \uB4F1\uB85D\uD560 \uAC70\uB798 \uB0B4\uC5ED\uC774 \uC5C6\uC5B4\uC694.'}
            </Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        className="items-center justify-center"
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.primary,
          paddingVertical: hp(16),
        }}
        onPress={onConfirm}
      >
        <Text
          style={{
            fontSize: fp(15),
            fontFamily: FONTS.bold,
            color: COLORS.textInverse,
          }}
        >
          {'\uC120\uD0DD\uD55C \uAC70\uB798 \uB4F1\uB85D'}
        </Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
