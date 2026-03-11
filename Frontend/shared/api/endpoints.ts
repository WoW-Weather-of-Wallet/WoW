// =============================================
// API ?붾뱶?ъ씤???곸닔 紐⑥쓬
// ??React) + ??React Native) 怨듭슜?쇰줈 ?ъ슜
// BASE_URL? ?섍꼍???곕씪 蹂寃??꾩슂 (媛쒕컻/諛고룷)
// =============================================

// 媛쒕컻: localhost / 諛고룷: ?ㅼ젣 ?쒕쾭 二쇱냼濡?蹂寃?
export const BASE_URL = 'http://localhost:8080'

export const ENDPOINTS = {
  // -----------------------------------------------
  // ?ъ슜??愿由?(Auth) - BE ?대떦: 源吏꾩슦
  // -----------------------------------------------
  AUTH: {
    SIGNUP: '/api/v1/auth/signup',                              // POST - ?뚯썝媛??
    LOGIN: '/api/v1/auth/login',                                // POST - 濡쒓렇??
    LOGOUT: '/api/v1/auth/logout',                              // DELETE - 濡쒓렇?꾩썐
    REFRESH: '/api/v1/auth/refresh',                            // POST - ?좏겙 媛깆떊
    PHONE_SEND: '/api/v1/auth/sms/send',                      // POST - ?대????몄쬆踰덊샇 ?붿껌
    PHONE_VERIFY: '/api/v1/auth/sms/verify',                  // POST - ?대????몄쬆踰덊샇 ?뺤씤
    CHECK_EMAIL: '/api/v1/auth/check-email',                    // GET  - ?대찓??以묐났 ?뺤씤
    EMAIL_VERIFY_REQUEST: '/api/v1/auth/email-verifications',   // POST - ?대찓???몄쬆踰덊샇 ?붿껌
    EMAIL_VERIFY_CONFIRM: '/api/v1/auth/email-verifications/confirm', // POST - ?대찓???몄쬆踰덊샇 ?뺤씤
    GOOGLE_OAUTH: '/oauth2/authorization/google',               // POST - 援ш? OAuth (2李?MVP)
  },

  // -----------------------------------------------
  // ?좎? ?뺣낫 - BE ?대떦: 源吏꾩슦
  // -----------------------------------------------
  USER: {
    ME: '/api/v1/users/me',                       // GET/PATCH/DELETE - ???뺣낫 議고쉶/?섏젙/?덊눜
    PASSWORD: '/api/v1/users/me/password',         // PATCH - 鍮꾨?踰덊샇 蹂寃?
    NOTIFICATIONS: '/api/v1/users/me/notifications', // GET/PATCH - ?뚮┝ ?ㅼ젙 議고쉶/蹂寃?
    ONBOARDING: '/api/v1/users/me/onboarding',    // POST - ?⑤낫???좏깮 ???
  },

  // -----------------------------------------------
  // ?쎄? - BE ?대떦: 源吏꾩슦
  // -----------------------------------------------
  TERMS: {
    LIST: '/api/v1/terms',       // GET  - ?쎄? 紐⑸줉 議고쉶
    AGREE: '/api/v1/terms/agree', // POST - ?쎄? ?숈쓽
  },

  // -----------------------------------------------
  // 怨꾩쥖 - BE ?대떦: ?댁콈紐?/ FE ?대떦: ?댁콈紐?
  // -----------------------------------------------
  ACCOUNTS: {
    LIST: '/api/v1/accounts',                                               // GET - 怨꾩쥖 ?뺣낫 諛??붿븸 議고쉶
    BALANCE: (accountId: number) => `/api/v1/accounts/${accountId}/balance`, // GET - ?뱀젙 怨꾩쥖 ?붿븸 ?④굔 議고쉶
    TRANSACTIONS: (accountId: number) => `/api/v1/accounts/${accountId}/transactions`, // GET - 嫄곕옒 ?댁뿭 議고쉶
  },

  // -----------------------------------------------
  // 嫄곕옒 ?댁뿭 硫붾え - FE ?대떦: ?댁콈紐?
  // -----------------------------------------------
  TRANSACTIONS: {
    MEMO: (transactionId: number) => `/api/v1/transactions/${transactionId}/memo`, // PATCH/DELETE - 硫붾え ?묒꽦/?섏젙/??젣
  },

  // -----------------------------------------------
  // 罹섎┛??- BE ?대떦: ?ㅼ슦??
  // -----------------------------------------------
  CALENDAR: {
    HEADER: '/api/v1/calendar/header',               // GET - 罹섎┛???ㅻ뜑 議고쉶 (?붿븸, 紐⑺몴 ??
    MONTHLY: '/api/v1/calendar/monthly',             // GET - ???⑥쐞 罹섎┛??議고쉶
    FIXED_EXPENSES: '/api/v1/calendar/fixed-expenses', // GET - 怨좎젙 吏異?紐⑸줉 議고쉶
    TRANSACTIONS: '/api/v1/calendar/transactions',   // GET - ?꾩껜 嫄곕옒?댁뿭 議고쉶
    AI_FEEDBACK: '/api/v1/calendar/aifeedback',      // GET - AI ?쇰뱶諛?議고쉶
  },

  // -----------------------------------------------
  // 怨좎젙 吏異?- BE ?대떦: ?ㅼ슦??
  // -----------------------------------------------
  FIXED_EXPENSES: {
    LIST: '/api/v1/fixed-expenses',                                          // GET  - 怨좎젙 吏異??꾩껜 議고쉶
    BY_CATEGORY: (category: string) => `/api/v1/fixed-expenses?category=${category}`, // GET  - 移댄뀒怨좊━蹂?議고쉶
    DETAIL: (id: number) => `/api/v1/fixed-expenses/${id}`,                  // PATCH/DELETE - ?섏젙/??젣
  },

  // -----------------------------------------------
  // ?좊룞 吏異?- BE ?대떦: ?ㅼ슦??(2李?MVP)
  // -----------------------------------------------
  EXPENSES: {
    LIST: '/api/v1/expenses',                           // GET/POST - ?꾩껜 議고쉶/異붽?
    DETAIL: (id: number) => `/api/v1/expenses/${id}`,  // PATCH/DELETE - ?섏젙/??젣
  },

  // -----------------------------------------------
  // 硫붿씤 ?붾㈃ - BE ?대떦 誘몄젙
  // -----------------------------------------------
  MAIN: {
    SPENDING_TYPE: '/api/v1/main/spending-type',                  // GET - ?뚮퉬 ?좏삎 議고쉶
    SPENDING_TYPE_ANALYSIS: '/api/v1/main/spending-type/analysis', // GET - ?뚮퉬 ?좏삎 遺꾩꽍 寃곌낵 議고쉶
    SPENDING_MONTHLY: '/api/v1/main/spending/monthly',            // GET - ?대쾲???뚮퉬 移댄뀒怨좊━蹂?議고쉶
    BUDGET: '/api/v1/main/budget',                                // GET - ?대쾲???⑥? ?덉궛 議고쉶
    WEEKLY_FORECAST: '/api/v1/main/calendar/weekly-forecast',     // GET - ?대쾲二??뚮퉬 ?덈낫 議고쉶
    MONTHLY_COMPARE: '/api/v1/main/spending/monthly/compare',     // GET - ?대쾲??吏?쒕떖 ?뚮퉬 鍮꾧탳
  },

  // -----------------------------------------------
  // 媛?대뱶
  // -----------------------------------------------
  GUIDE: '/api/v1/guide', // GET - 怨꾩쥖 議고쉶 媛?대뱶
} as const

