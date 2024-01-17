import { PrismaService } from 'src/prisma/prisma.service';
import settings from 'src/settings';

async function main() {
  const ormConfig = settings().ormconfig();
  console.log(ormConfig);
  const prisma = new PrismaService();
  try {
    await prisma.$connect();
    await prisma.$transaction(
      async (tx) => {
        const subject_course = await tx.subject_course.findMany();

        const BATCH_SIZE = 1000;
        console.log(subject_course.length);
        for (
          let i = 0;
          i < Math.ceil(subject_course.length / BATCH_SIZE);
          i++
        ) {
          const sliced_subject_course = subject_course.slice(
            i * BATCH_SIZE,
            (i + 1) * BATCH_SIZE,
          );
          const bulkPromises = sliced_subject_course.map(async (course) => {
            const result = tx.subject_course.update({
              where: {
                id: course.id,
              },
              data: {
                title_no_space: course.title.replace(/\s/g, ''),
                title_en_no_space: course.title_en.replace(/\s/g, ''),
              },
            });
            return result;
          });
          await Promise.all(bulkPromises);
          console.log(`batch ${i} done`);
        }
      },
      {
        maxWait: 5000,
        timeout: 300000,
      },
    );
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
