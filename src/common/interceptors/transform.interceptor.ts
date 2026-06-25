import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        // 1. Get the HTTP response object to extract the current status code (e.g. 200 or 201)
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        // 2. Use RxJS operators to map/wrap the controller response
        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode: statusCode,
                message: 'Success',
                data: data ?? null, // If the controller returned nothing, default to null
            })),
        );
    }
}
