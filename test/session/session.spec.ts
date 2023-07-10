import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import * as request from "supertest";
import { PrismaService } from "../../src/prisma/prisma.service";
import { UserService } from "../../src/modules/user/user.service";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/session/info (GET)', async () => {
    const prismaService = app.get(PrismaService);
    const session_userprofileList = await prismaService.session_userprofile.findMany({})

    const userService = app.get(UserService);
    const batchSize = 50;
    const batchCount = Math.ceil(session_userprofileList.length / batchSize);

    for(let i = 0; i < batchCount; i++){
      const batch = session_userprofileList.slice(i * batchSize, (i + 1) * batchSize);
      batch.forEach((user) => {
        const profile =  userService.getProfile(user)
          .then((profile) => {

          })
      })
    }


    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
