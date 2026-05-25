import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser } from '../common/domain/authenticated-user';
import { AuditLogsService } from './audit-logs.service';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        if (request.method === 'GET') {
          return;
        }

        void this.auditLogsService.record({
          organizationId: request.user?.organizationId,
          userId: request.user?.userId,
          method: request.method,
          path: request.path,
          statusCode: response.statusCode,
          ip: request.ip,
          metadata: {
            userAgent: request.headers['user-agent'],
          },
        });
      }),
    );
  }
}
