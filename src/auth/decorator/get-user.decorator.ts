import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/// @GetUser() user           // full { userId, email }
/// @GetUser('userId') id     // just the ID

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
