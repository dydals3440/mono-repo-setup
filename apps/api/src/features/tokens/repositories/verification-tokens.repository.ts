import { Injectable } from "@nestjs/common";
import {
  Prisma,
  VerificationToken,
  VerificationTokenType,
} from "@prisma/client";
import { PrismaService } from "../../../infrastructure";

@Injectable()
export class VerificationTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verification token 생성
   */
  async create(
    data: Prisma.VerificationTokenCreateInput,
  ): Promise<VerificationToken> {
    return this.prisma.verificationToken.create({ data });
  }

  /**
   * Token으로 조회
   */
  async findByToken(token: string): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.findUnique({
      where: { token },
    });
  }

  /**
   * 사용자 ID와 타입으로 미사용 토큰 조회
   */
  async findUnusedByUserIdAndType(
    userId: number,
    type: VerificationTokenType,
  ): Promise<VerificationToken[]> {
    return this.prisma.verificationToken.findMany({
      where: {
        userId,
        type,
        used: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 토큰 사용 처리
   */
  async markAsUsed(token: string): Promise<VerificationToken> {
    return this.prisma.verificationToken.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  /**
   * 특정 사용자의 특정 타입 미사용 토큰 모두 무효화
   */
  async invalidateUnusedTokens(
    userId: number,
    type: VerificationTokenType,
  ): Promise<number> {
    const result = await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * 만료된 토큰 삭제
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.verificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * 사용된 토큰 삭제 (일정 기간 경과)
   */
  async deleteUsed(daysAgo = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const result = await this.prisma.verificationToken.deleteMany({
      where: {
        used: true,
        usedAt: {
          lt: cutoffDate,
        },
      },
    });
    return result.count;
  }
}
