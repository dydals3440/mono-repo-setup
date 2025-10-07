import { Injectable } from "@nestjs/common";
import { Prisma, RefreshToken } from "@prisma/client";
import { PrismaService } from "../../../infrastructure";

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Refresh token 생성
   */
  async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  /**
   * Token으로 조회
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  /**
   * 사용자 ID로 모든 토큰 조회
   */
  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { lastUsedAt: "desc" },
    });
  }

  /**
   * 사용자 + 기기별 토큰 조회
   */
  async findByUserIdAndDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
        deviceId,
      },
      orderBy: { lastUsedAt: "desc" },
    });
  }

  /**
   * lastUsedAt 업데이트
   */
  async updateLastUsedAt(token: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });
  }

  /**
   * 특정 토큰 삭제
   */
  async delete(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  /**
   * 특정 사용자의 모든 토큰 삭제
   */
  async deleteByUserId(userId: number): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  /**
   * 특정 기기의 토큰 삭제
   */
  async deleteByUserIdAndDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });
  }

  /**
   * 만료된 토큰 삭제
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * 사용자의 토큰 개수 조회
   */
  async countByUserId(userId: number): Promise<number> {
    return this.prisma.refreshToken.count({
      where: { userId },
    });
  }
}
