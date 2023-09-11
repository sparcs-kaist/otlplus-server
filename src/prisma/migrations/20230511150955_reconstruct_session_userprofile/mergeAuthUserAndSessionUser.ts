import { normalizeArray } from '../../../common/utils/method.utils';
import settings from '../../../settings';
import { PrismaService } from '../../prisma.service';

async function main() {
  const ormConfig = settings().ormconfig();
  console.log(ormConfig);
  const prisma = new PrismaService();
  try {
    await prisma.$connect();

    const auth_users = await prisma.auth_user.findMany();
    const session_users = await prisma.session_userprofile.findMany();
    const auth_users_map = normalizeArray(
      auth_users,
      (auth_users) => auth_users.id,
    );

    const BATCH_SIZE = 1000;
    for (let i = 0; i < Math.ceil(session_users.length / BATCH_SIZE); i++) {
      const slicedSessionUsers = session_users.slice(
        i * BATCH_SIZE,
        (i + 1) * BATCH_SIZE,
      );
      const bulkPromises = slicedSessionUsers.map(async (session_user) => {
        const matched_auth_user = auth_users_map[session_user.user_id];
        if (matched_auth_user) {
          const updateData = {
            first_name: matched_auth_user.first_name,
            last_name: matched_auth_user.last_name,
            email: matched_auth_user.email,
            date_joined: matched_auth_user.date_joined,
          };
          session_user.first_name = matched_auth_user.first_name;
          session_user.last_name = matched_auth_user.last_name;
          session_user.email = matched_auth_user.email;
          session_user.date_joined = matched_auth_user.date_joined;
          // console.log(session_user)

          const result = prisma.session_userprofile.update({
            where: {
              id: session_user.id,
            },
            data: updateData,
          });
          return result;
        }
      });
      await Promise.all(bulkPromises);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('done');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    process.exit(0);
  });
