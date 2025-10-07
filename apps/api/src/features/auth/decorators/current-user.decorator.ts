import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

const getCurrentUserByContext = (ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest().user;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return getCurrentUserByContext(ctx);
  },
);
