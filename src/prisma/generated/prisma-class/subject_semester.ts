import { main_rankedreviewdailyfeed } from './main_rankedreviewdailyfeed';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class subject_semester {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  year: number;

  @ApiProperty({ type: Number })
  semester: number;

  @ApiProperty({ type: Date })
  beginning: Date;

  @ApiProperty({ type: Date })
  end: Date;

  @ApiPropertyOptional({ type: Date })
  courseRegistrationPeriodStart?: Date;

  @ApiPropertyOptional({ type: Date })
  courseRegistrationPeriodEnd?: Date;

  @ApiPropertyOptional({ type: Date })
  courseAddDropPeriodEnd?: Date;

  @ApiPropertyOptional({ type: Date })
  courseDropDeadline?: Date;

  @ApiPropertyOptional({ type: Date })
  courseEvaluationDeadline?: Date;

  @ApiPropertyOptional({ type: Date })
  gradePosting?: Date;

  @ApiPropertyOptional({ type: Date })
  courseDesciptionSubmission?: Date;

  @ApiProperty({ isArray: true, type: () => main_rankedreviewdailyfeed })
  main_rankedreviewdailyfeed: main_rankedreviewdailyfeed[];
}
