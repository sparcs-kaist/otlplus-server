import { PrismaService } from "../../prisma.service";
import settings from "../../../settings";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../../repositories/user.repository";
import { AuthService } from "../../../modules/auth/auth.service";
import * as bcrypt from "bcrypt";

async function main() {
  const ormConfig = settings().ormconfig();
  console.log(ormConfig);
  const prisma = new PrismaService();
  const userRepository = new UserRepository(prisma);
  const authService = new AuthService(userRepository, new JwtService({}));
  try {
    await prisma.$connect();
    await prisma.$transaction(async (tx)=> {
      const session_users = await tx.session_userprofile.findMany();

      const BATCH_SIZE = 1000;
      console.log(session_users.length);
      for (let i = 0; i < Math.ceil(session_users.length / BATCH_SIZE); i++) {
        const slicedSessionUsers = session_users.slice(
          i * BATCH_SIZE,
          (i + 1) * BATCH_SIZE
        );
        const bulkPromises = slicedSessionUsers.map(async (session_user) => {
          const { refreshToken, ...refreshTokenOptions } = authService.getCookieWithRefreshToken(session_user.sid)
          const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
          const encryptedRefreshToken = await bcrypt.hash(refreshToken, salt);
          session_user.refresh_token = encryptedRefreshToken
          const result = tx.session_userprofile.update({
            where: {
              id: session_user.id
            },
            data: {
              refresh_token: encryptedRefreshToken
            }
          });
          return result;
        });
        await Promise.all(bulkPromises);
        console.log(`batch ${i} done`);
      }
    },{
      maxWait: 5000,
      timeout: 300000
    })
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    process.exit(0);
  });
