import { Injectable } from "@nestjs/common";
import { VerificationTokenType } from "@prisma/client";
import { compare, genSalt, hash } from "bcryptjs";
import { BusinessExceptions } from "../../../common";
import { VerificationTokensRepository } from "../repositories";

@Injectable()
export class VerificationTokensService {
  constructor(
    private readonly verificationTokensRepository: VerificationTokensRepository,
  ) {}

  /**
   * 일회용 토큰 생성
   */
  async createToken(
    userId: number,
    type: VerificationTokenType,
    expiresInMs: number,
  ): Promise<string> {
    // 이전 미사용 토큰 무효화
    await this.verificationTokensRepository.invalidateUnusedTokens(
      userId,
      type,
    );

    // 새 토큰 생성 (bcryptjs genSalt 사용)
    const plainToken = await genSalt(10);
    const hashedToken = await hash(plainToken, 10);

    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.verificationTokensRepository.create({
      token: hashedToken,
      type,
      expiresAt,
      user: {
        connect: { id: userId },
      },
    });

    // 클라이언트에는 원본 토큰 반환
    return plainToken;
  }

  /**
   * 이메일 인증 토큰 생성 (24시간)
   */
  async createEmailVerificationToken(userId: number): Promise<string> {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    return this.createToken(
      userId,
      VerificationTokenType.VERIFY_EMAIL,
      TWENTY_FOUR_HOURS,
    );
  }

  /**
   * 비밀번호 재설정 토큰 생성 (15분)
   */
  async createPasswordResetToken(userId: number): Promise<string> {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    return this.createToken(
      userId,
      VerificationTokenType.RESET_PASSWORD,
      FIFTEEN_MINUTES,
    );
  }

  /**
   * 토큰 검증 및 사용 처리
   * bcrypt를 사용하므로 userId를 파라미터로 받아 해당 사용자의 토큰만 조회
   */
  async validateAndUseToken(
    userId: number,
    plainToken: string,
    expectedType: VerificationTokenType,
  ): Promise<number> {
    // 해당 사용자의 미사용 토큰 조회
    const userTokens =
      await this.verificationTokensRepository.findUnusedByUserIdAndType(
        userId,
        expectedType,
      );

    // bcrypt compare로 일치하는 토큰 찾기
    for (const tokenRecord of userTokens) {
      const isMatch = await compare(plainToken, tokenRecord.token);

      if (isMatch) {
        // 만료 확인
        if (tokenRecord.expiresAt < new Date()) {
          throw BusinessExceptions.tokenExpired();
        }

        // 토큰 사용 처리
        await this.verificationTokensRepository.markAsUsed(tokenRecord.token);

        return tokenRecord.userId;
      }
    }

    // 일치하는 토큰이 없음
    throw BusinessExceptions.invalidToken({
      reason: "Token not found or already used",
    });
  }

  /**
   * 이메일 인증 토큰 검증
   */
  async validateEmailVerificationToken(
    userId: number,
    plainToken: string,
  ): Promise<number> {
    return this.validateAndUseToken(
      userId,
      plainToken,
      VerificationTokenType.VERIFY_EMAIL,
    );
  }

  /**
   * 비밀번호 재설정 토큰 검증
   */
  async validatePasswordResetToken(
    userId: number,
    plainToken: string,
  ): Promise<number> {
    return this.validateAndUseToken(
      userId,
      plainToken,
      VerificationTokenType.RESET_PASSWORD,
    );
  }

  /**
   * 만료된 토큰 정리
   */
  async cleanExpiredTokens(): Promise<number> {
    return this.verificationTokensRepository.deleteExpired();
  }

  /**
   * 사용된 토큰 정리 (30일 경과)
   */
  async cleanUsedTokens(daysAgo = 30): Promise<number> {
    return this.verificationTokensRepository.deleteUsed(daysAgo);
  }
}
