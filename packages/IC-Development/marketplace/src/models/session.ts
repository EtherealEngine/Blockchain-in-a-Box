export interface BaseToken {
  iat?: number;
  exp?: number;
  discordId: string;
}

export interface SessionChallengeToken extends BaseToken {
  challenge: number;
  verified: false;
}

export interface SessionVerifiedToken extends BaseToken {
  verified: true;
}
