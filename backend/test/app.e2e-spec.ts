import {
  Body,
  Controller,
  INestApplication,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SignupDto } from '../src/auth/dto/signup.dto';

interface SignupResponseBody {
  access_token: string;
  refresh_token: string;
  user: {
    organizationId: number;
  };
}

@Controller('auth')
class TestAuthController {
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 1,
        email: dto.email,
        name: dto.name,
        organizationId: 1,
      },
    };
  }
}

describe('Auth request contract (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestAuthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('accepts signup with an organization', async () => {
    const server = app.getHttpServer() as App;

    await request(server)
      .post('/auth/signup')
      .send({
        email: 'agent@example.com',
        password: 'secret123',
        name: 'Agent',
        organizationName: 'Prime Realty',
      })
      .expect(201)
      .expect(({ body }) => {
        const responseBody = body as SignupResponseBody;
        expect(responseBody.access_token).toBe('access-token');
        expect(responseBody.refresh_token).toBe('refresh-token');
        expect(responseBody.user.organizationId).toBe(1);
      });
  });

  it('rejects signup without organizationName', async () => {
    const server = app.getHttpServer() as App;

    await request(server)
      .post('/auth/signup')
      .send({
        email: 'agent@example.com',
        password: 'secret123',
        name: 'Agent',
      })
      .expect(400);
  });
});
