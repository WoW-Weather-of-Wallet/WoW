export const EXPENSE_CATEGORIES = {
  FOOD: { id: 1, name: '식비', icon: '🍽️' },
  TRANSPORT: { id: 2, name: '교통', icon: '🚌' },
  SHOPPING: { id: 3, name: '쇼핑', icon: '🛍️' },
  CULTURE: { id: 4, name: '문화/여가', icon: '🎭' },
  SUBSCRIPTION: { id: 5, name: '구독', icon: '📺' },
  MEDICAL: { id: 6, name: '의료', icon: '💊' },
  EDUCATION: { id: 7, name: '교육', icon: '📚' },
  ETC: { id: 8, name: '기타', icon: '📦' },
} as const

export type CategoryKey = keyof typeof EXPENSE_CATEGORIES
export type CategoryId = (typeof EXPENSE_CATEGORIES)[CategoryKey]['id']
