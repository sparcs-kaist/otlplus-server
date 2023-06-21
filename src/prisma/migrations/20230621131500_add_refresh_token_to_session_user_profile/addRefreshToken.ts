import { PrismaService } from "../../prisma.service";
import settings from "../../../settings";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../../repositories/user.repository";
import { AuthService } from "../../../modules/auth/auth.service";

async function main() {
  const ormConfig = settings().ormconfig();
  console.log(ormConfig);
  const prisma = new PrismaService();
  const userRepository = new UserRepository(prisma);
  const authService = new AuthService(userRepository, new JwtService({}));
  try {
    await prisma.$connect();
    prisma.$transaction(async (tx)=> {
      const session_users = await tx.session_userprofile.findMany();

      const BATCH_SIZE = 1000;
      for (let i = 0; i < Math.ceil(session_users.length / BATCH_SIZE); i++) {
        const slicedSessionUsers = session_users.slice(
          i * BATCH_SIZE,
          (i + 1) * BATCH_SIZE
        );
        const bulkPromises = slicedSessionUsers.map(async (session_user) => {
          const { refreshToken, ...refreshTokenOptions } = authService.getCookieWithRefreshToken(session_user)
          session_user.refresh_token = refreshToken
          const result = tx.session_userprofile.update({
            where: {
              id: session_user.id
            },
            data: {
              refresh_token: refreshToken
            }
          });
          return result;
        });
        await Promise.all(bulkPromises);
      }
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
