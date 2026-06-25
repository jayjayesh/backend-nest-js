import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Empty decorator catches ALL exceptions
export class AllExceptionsFilter<T> implements ExceptionFilter<T> {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        // 1. Determine status code (default to 500 if not a standard NestJS HttpException)
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        // 2. Extract message & error details from NestJS exception response
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof HttpException) {
            const errorResponse = exception.getResponse();
            if (typeof errorResponse === 'string') {
                message = errorResponse;
            } else if (typeof errorResponse === 'object' && errorResponse !== null) {
                // ValidationPipe validation errors are returned as an array under the 'message' field
                message = (errorResponse as any).message || JSON.stringify(errorResponse);
                error = (errorResponse as any).error || exception.name;
            }
        } else if (exception instanceof Error) {
            // In case it's a standard JS error that wasn't wrapped in an HttpException
            message = exception.message;
            error = exception.name;
        }
        // 3. Send standardized error response
        response.status(status).json({
            success: false,
            statusCode: status,
            message: Array.isArray(message) ? message.join(', ') : message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,

        });
    }
}