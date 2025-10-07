import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import {
  envValidationSchema,
  GlobalExceptionFilter,
  ResponseTransformInterceptor,
} from "./common";
import { AuthModule } from "./features/auth/auth.module";
import { UsersModule } from "./features/users/users.module";
import { PrismaModule } from "./infrastructure";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true, // 정의되지 않은 환경변수 허용
        abortEarly: false, // 모든 에러를 한번에 표시
      },
    }),

    // Infrastructure
    PrismaModule,

    // Feature Modules
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Response Transform Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
