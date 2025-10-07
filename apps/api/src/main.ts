import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
