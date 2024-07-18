import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';

export class CourseMiddleware implements IPrismaMiddleware.IPrismaMiddleware {
  private static instance: CourseMiddleware;
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async preExecute(): Promise<boolean> {
    return true;
  }

  async postExecute(
    operations: IPrismaMiddleware.operationType,
    args: any,
    result: any,
  ): Promise<boolean> {
    // for test
    // console.log(`course operations:${operations}`);
    // console.log(`course args:${JSON.stringify(args, null, 2)}`);
    // console.log(`course result:${JSON.stringify(result, null, 2)}`);
    // if(operations === 'findFirst'){
    //   const test =await this.prisma.review_review.findFirst(
    //     {
    //       where: {
    //         id: 2890
    //       }
    //     }
    //   );
    //   console.log(test);
    // }
    // test end
    if (operations === 'create') {
      //todo: cache delete
    }
    return true;
  }

  static initialize(prisma: PrismaService) {
    if (!CourseMiddleware.instance) {
      CourseMiddleware.instance = new CourseMiddleware(prisma);
    }
  }

  static getInstance(): CourseMiddleware {
    return CourseMiddleware.instance;
  }
}
