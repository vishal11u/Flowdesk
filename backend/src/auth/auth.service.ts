import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OrganizationsService } from '../organizations/organizations.service';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';

interface TokenPayload {
  email: string;
  sub: number;
  organizationId: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly organizationsService: OrganizationsService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findOneByEmail(
      signupDto.email,
    );

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const organization = await this.organizationsService.create(
      signupDto.organizationName,
    );
    const hashedPassword = await bcrypt.hash(signupDto.password, 12);
    const user = await this.usersService.create({
      email: signupDto.email,
      name: signupDto.name,
      password: hashedPassword,
      organizationId: organization.id,
    });

    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmailWithSecret(
      loginDto.email,
    );

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        dto.refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOneById(payload.sub);

    if (
      !user?.refreshTokenHash ||
      !(await bcrypt.compare(dto.refreshToken, user.refreshTokenHash))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: number): Promise<{ revoked: boolean }> {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { revoked: true };
  }

  private async issueTokens(user: User) {
    const payload: TokenPayload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshTokenExpiry =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRY') ?? '7d';
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        this.configService.get<string>('JWT_SECRET'),
      expiresIn: refreshTokenExpiry as never,
    });

    await this.usersService.updateRefreshTokenHash(
      user.id,
      await bcrypt.hash(refreshToken, 12),
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
      },
    };
  }
}
