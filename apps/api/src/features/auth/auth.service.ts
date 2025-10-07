import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { compare } from "bcryptjs";
import { Response } from "express";
import { BusinessException, BusinessExceptions } from "../../common";
import { RefreshTokensService } from "../tokens";
import { UsersService } from "../users/users.service";
import { TokenPayload } from "./interfaces";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async login(user: User, response: Response) {
    const { token: accessToken, expiresIn: accessTokenExpiresIn } =
      this.generateAccessToken(user.id, user.tokenVersion);

    const { token: refreshToken, expiresIn: refreshTokenExpiresIn } =
      await this.generateRefreshToken(user.id, user.tokenVersion);

    this.setTokenCookie(
      response,
      "Authentication",
      accessToken,
      accessTokenExpiresIn,
    );
    this.setTokenCookie(
      response,
      "refreshToken",
      refreshToken,
      refreshTokenExpiresIn,
    );
  }

  async verifyUser({ email, password }: Pick<User, "email" | "password">) {
    try {
      const user = await this.usersService.getUserByEmail(email);

      if (!user) {
        throw BusinessExceptions.invalidCredentials();
      }

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw BusinessExceptions.invalidCredentials();
      }

      return user;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }

      throw BusinessExceptions.internalServerError(error);
    }
  }

  async refreshAccessToken(
    user: User,
    oldRefreshToken: string,
    response: Response,
  ) {
    // 기존 Refresh Token 삭제
    await this.refreshTokensService.revokeToken(user.id, oldRefreshToken);

    // 나머지 모든 토큰도 삭제 (Refresh Token Rotation 보장)
    await this.refreshTokensService.revokeUserTokens(user.id);

    // Access Token 생성
    const { token: accessToken, expiresIn: accessTokenExpiresIn } =
      this.generateAccessToken(user.id, user.tokenVersion);

    // 새로운 Refresh Token 생성
    const { token: refreshToken, expiresIn: refreshTokenExpiresIn } =
      await this.generateRefreshToken(user.id, user.tokenVersion);

    // 쿠키 설정
    this.setTokenCookie(
      response,
      "Authentication",
      accessToken,
      accessTokenExpiresIn,
    );
    this.setTokenCookie(
      response,
      "refreshToken",
      refreshToken,
      refreshTokenExpiresIn,
    );
  }

  /**
   * Refresh token 검증 및 사용자 조회
   */
  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    if (!refreshToken) {
      throw BusinessExceptions.invalidToken({
        reason: "Refresh token not found in cookie",
      });
    }

    // 사용자 조회
    const user = await this.usersService.getUserById(userId);

    // DB에서 refresh token 검증 (만료 체크)
    await this.refreshTokensService.validateRefreshToken(user.id, refreshToken);

    return user;
  }

  /**
   * 특정 사용자의 모든 refresh token을 무효화
   * 자격증명이 손상된 경우 사용
   */
  async revokeUserTokens(userId: number) {
    // 1. User의 tokenVersion 증가 (기존 토큰 무효화)
    await this.usersService.revokeAllRefreshTokens(userId);

    // 2. DB의 토큰들도 삭제
    await this.refreshTokensService.revokeUserTokens(userId);
  }

  /**
   * Access Token 생성
   */
  private generateAccessToken(
    userId: number,
    tokenVersion: number,
  ): {
    token: string;
    expiresIn: number;
  } {
    const expiresIn = parseInt(
      this.configService.getOrThrow<string>("JWT_ACCESS_TOKEN_EXPIRATION_MS"),
      10,
    );

    const payload: TokenPayload = { userId, tokenVersion };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_TOKEN_SECRET"),
      expiresIn: `${expiresIn}ms`,
    });

    return { token, expiresIn };
  }

  /**
   * Refresh Token 생성 및 DB 저장
   */
  private async generateRefreshToken(
    userId: number,
    version: number,
  ): Promise<{ token: string; expiresIn: number }> {
    const expiresIn = parseInt(
      this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_EXPIRATION_MS"),
      10,
    );

    const payload: TokenPayload = {
      userId,
      tokenVersion: version,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: `${expiresIn}ms`,
    });

    // DB에 저장
    const expiresAt = new Date(Date.now() + expiresIn);
    await this.refreshTokensService.saveRefreshToken(userId, token, expiresAt);

    return { token, expiresIn };
  }

  /**
   * 쿠키 설정
   */
  private setTokenCookie(
    response: Response,
    name: string,
    token: string,
    maxAge: number,
  ): void {
    response.cookie(name, token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      maxAge,
    });
  }
}
