import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BusinessExceptions } from "../../common";
import { PrismaService } from "../../infrastructure";
import { CreateUserDto, UserResponseDto } from "./users.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    readonly _prisma: PrismaService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Logging
    this.logger.log(`회원 가입 요청: ${createUserDto.email}`);

    // 이메일 중복 체크
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw BusinessExceptions.emailAlreadyExists(createUserDto.email);
    }

    const user = await this.usersRepository.create(createUserDto);
    return UserResponseDto.fromEntity(user);
  }

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw BusinessExceptions.invalidCredentials();
    }

    return user;
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw BusinessExceptions.userNotFound(userId);
    }

    return UserResponseDto.fromEntity(user);
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    return this.usersRepository.update(userId, data);
  }

  /**
   * 특정 사용자의 모든 refresh token을 무효화
   * version을 증가시켜 기존 토큰들을 무효화
   */
  async revokeAllRefreshTokens(userId: number) {
    return this.usersRepository.incrementVersion(userId);
  }
}
