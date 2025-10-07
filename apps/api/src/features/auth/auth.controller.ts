import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { User } from "@prisma/client";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard, JwtRefreshAuthGuard, LocalAuthGuard } from "./guards";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    return {
      message: "Login successful",
    };
  }

  @Post("refresh")
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @CurrentUser() user: User,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    await this.authService.refreshAccessToken(user, refreshToken, response);
    return {
      message: "Token refreshed",
    };
  }

  @Post("revoke")
  @UseGuards(JwtAuthGuard)
  async revoke(@CurrentUser() user: User) {
    await this.authService.revokeUserTokens(user.id);
    return {
      message: "All refresh tokens revoked",
    };
  }
}
