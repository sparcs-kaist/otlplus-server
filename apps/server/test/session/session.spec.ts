import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { AppModule } from '../../src/app.module';
import { UserService } from '../../src/modules/user/user.service';
import { PrismaService } from '@otl/server-nest/modules/prisma/prisma.service';

describe.skip('AppController (e2e)', () => {
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
    const userService = app.get(UserService);

    const sidList = await axios.get('http://localhost:58000/session');

    const BATCH_SIZE = 10;
    const BATCH_COUNT = Math.floor(sidList.data.length / BATCH_SIZE) + 1;
    for (let i = 0; i < BATCH_COUNT; i++) {
      const batch = sidList.data.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const promises = batch.map(async (sid: string) => {
        const r = await axios.get(`http://localhost:58000/session/login?sid=${sid}`);
        const { data } = r;
        const user = prismaService.session_userprofile
          .findFirst({
            where: { sid },
          })
          .then((user) => {
            try {
              if (!user) return null;
              return userService.getProfile(user);
            } catch (e) {
              console.log('error with sid: ', sid);
              console.error(e);
            }
          })
          .then((profile) => {
            expect(profile).toEqual(data);
            return profile;
          });
        return user;
      });
      await Promise.all(promises);
      console.log(`batch ${i} / ${BATCH_COUNT} done`);
    }
  }, 100000000);
});
