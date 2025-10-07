import { Role, type User } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

/**
 * 유저 생성 요청 DTO
 */
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(Role)
  role: Role;
}

/**
 * 유저 응답 DTO (비밀번호 제외)
 */
export class UserResponseDto {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  isEmailVerified: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
