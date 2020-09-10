export const REFRESH_TOKEN_GRANT_TYPE = 'refresh_token';

export interface RefreshTokenData {
  expires_in: number;
  token_type: string;
  access_token: string;
}
