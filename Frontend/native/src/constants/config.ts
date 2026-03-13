export const OAUTH_CONFIG = {
  SSAFY: {
    CLIENT_ID: process.env.EXPO_PUBLIC_SSAFY_CLIENT_ID || 'your_client_id_here',
    REDIRECT_URI: process.env.EXPO_PUBLIC_SSAFY_REDIRECT_URI || 'your_redirect_uri_here',
    AUTH_URL: 'https://project.ssafy.com/oauth/sso-check',
    RESPONSE_TYPE: 'code',
  },
};
