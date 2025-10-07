import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { BusinessExceptions } from "../../../common";
import { RefreshTokensRepository } from "../repositories";

export interface DeviceInfo {
  deviceId?: string;
  deviceInfo?: string;
  ipAddress?: string;
}

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  /**
   * Refresh token 저장
   */
  async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date,
    deviceInfo?: DeviceInfo,
  ): Promise<void> {
    const hashedToken = await hash(token, 10);

    // 기존 같은 기기의 토큰이 있으면 삭제
    if (deviceInfo?.deviceId) {
      await this.refreshTokensRepository.deleteByUserIdAndDeviceId(
        userId,
        deviceInfo.deviceId,
      );
    }

    await this.refreshTokensRepository.create({
      token: hashedToken,
      expiresAt,
      deviceId: deviceInfo?.deviceId,
      deviceInfo: deviceInfo?.deviceInfo,
      ipAddress: deviceInfo?.ipAddress,
      user: {
        connect: { id: userId },
      },
    });
  }

  /**
   * Refresh token 유효성 검증
   */
  async validateRefreshToken(userId: number, token: string): Promise<boolean> {
    // 해당 사용자의 모든 토큰 조회
    const userTokens = await this.refreshTokensRepository.findByUserId(userId);

    // bcrypt compare로 일치하는 토큰 찾기
    for (const tokenRecord of userTokens) {
      const isMatch = await compare(token, tokenRecord.token);

      if (isMatch) {
        // 만료 확인
        if (tokenRecord.expiresAt < new Date()) {
          throw BusinessExceptions.tokenExpired();
        }

        // lastUsedAt 업데이트
        await this.refreshTokensRepository.updateLastUsedAt(tokenRecord.token);

        return true;
      }
    }

    // 일치하는 토큰이 없음
    throw BusinessExceptions.invalidToken({
      reason: "Token not found in database",
    });
  }

  /**
   * 특정 토큰 무효화 (로그아웃)
   */
  async revokeToken(userId: number, token: string): Promise<void> {
    // 해당 사용자의 모든 토큰 조회 후 일치하는 토큰 삭제
    const userTokens = await this.refreshTokensRepository.findByUserId(userId);

    for (const tokenRecord of userTokens) {
      const isMatch = await compare(token, tokenRecord.token);

      if (isMatch) {
        await this.refreshTokensRepository.delete(tokenRecord.token);
        return;
      }
    }

    // 토큰을 찾지 못한 경우 (이미 삭제되었거나 존재하지 않음)
    throw BusinessExceptions.invalidToken({
      reason: "Refresh token not found for revocation",
    });
  }

  /**
   * 특정 사용자의 모든 토큰 무효화 (전체 로그아웃)
   */
  async revokeUserTokens(userId: number): Promise<number> {
    return this.refreshTokensRepository.deleteByUserId(userId);
  }

  /**
   * 특정 기기의 토큰 무효화 (기기별 로그아웃)
   */
  async revokeDeviceToken(userId: number, deviceId: string): Promise<void> {
    await this.refreshTokensRepository.deleteByUserIdAndDeviceId(
      userId,
      deviceId,
    );
  }

  /**
   * 사용자의 활성 기기 목록 조회
   */
  async getUserDevices(userId: number) {
    const tokens = await this.refreshTokensRepository.findByUserId(userId);

    return tokens.map((token) => ({
      deviceId: token.deviceId,
      deviceInfo: token.deviceInfo,
      ipAddress: token.ipAddress,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt,
    }));
  }

  /**
   * 만료된 토큰 정리 (크론잡 등에서 호출)
   */
  async cleanExpiredTokens(): Promise<number> {
    return this.refreshTokensRepository.deleteExpired();
  }

  /**
   * 사용자의 기기 개수 제한 확인 및 처리
   */
  async enforceDeviceLimit(userId: number, maxDevices = 5): Promise<void> {
    const count = await this.refreshTokensRepository.countByUserId(userId);

    if (count >= maxDevices) {
      // 가장 오래된 기기의 토큰 삭제
      const tokens = await this.refreshTokensRepository.findByUserId(userId);
      const oldestToken = tokens[tokens.length - 1];
      if (oldestToken) {
        await this.refreshTokensRepository.delete(oldestToken.token);
      }
    }
  }
}
