import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure";
import {
  RefreshTokensRepository,
  VerificationTokensRepository,
} from "./repositories";
import { RefreshTokensService, VerificationTokensService } from "./services";

@Module({
  imports: [PrismaModule],
  providers: [
    RefreshTokensRepository,
    VerificationTokensRepository,
    RefreshTokensService,
    VerificationTokensService,
  ],
  exports: [RefreshTokensService, VerificationTokensService],
})
export class TokensModule {}
