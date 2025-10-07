import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { BusinessExceptions } from "../../../common";
import { UsersService } from "../../users/users.service";
import { TokenPayload } from "../interfaces/token-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow("JWT_ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.usersService.getUserById(payload.userId);

    // tokenVersion이 일치하지 않으면 토큰 무효화
    if (user.tokenVersion !== payload.tokenVersion) {
      throw BusinessExceptions.tokenRevoked({
        reason: "Token version mismatch",
      });
    }

    return user;
  }
}
