import { ScholarApiClient } from '@otl/scholar-sync/clients/scholar/scholar.api.client';
import settings from '@otl/scholar-sync/settings';
import fs from 'fs';

const scholarClient = new ScholarApiClient();

describe('ScholarApiClient data save', () => {
  const logFileDir = `${settings().loggingConfig().logDir}/data` + `/${process.env.NODE_ENV}`;
  beforeAll(() => {
    fs.mkdirSync(logFileDir, { recursive: true });
  });

  it('should get charge type', async () => {
    // Test with specific year and semester
    const year = 2025;
    const semester = 1;
    const result = await scholarClient.getChargeType(year, semester);
    fs.writeFileSync(`${logFileDir}/scholar-charge-${year}-${semester}.json`, JSON.stringify(result, null, 2));
  });

  it('should get exam time', async () => {
    const year = 2025;
    const semester = 1;
    const result = await scholarClient.getExamTimeType(year, semester);
    fs.writeFileSync(`${logFileDir}/scholar-exam-${year}-${semester}.json`, JSON.stringify(result, null, 2));
  });

  it('should get class time', async () => {
    const year = 2025;
    const semester = 1;
    const result = await scholarClient.getClassTimeType(year, semester);
    fs.writeFileSync(`${logFileDir}/scholar-class-${year}-${semester}.json`, JSON.stringify(result, null, 2));
  });

  it('should get attend type', async () => {
    const year = 2025;
    const semester = 1;
    const studentNo = 20180036;
    const result = await scholarClient.getAttendType(year, semester, studentNo);
    fs.writeFileSync(`${logFileDir}/scholar-attend-${year}-${semester}.json`, JSON.stringify(result, null, 2));
  });
  it('should get degree type', async () => {
    const studentNo = 202512345;
    const result = await scholarClient.getDegree(studentNo);
    fs.writeFileSync(`${logFileDir}/scholar-degree-${studentNo}.json`, JSON.stringify(result, null, 2));
  });
  it('should get major type', async () => {
    const studentNo = 202512345;
    const result = await scholarClient.getKdsStudentsOtherMajor();
    fs.writeFileSync(`${logFileDir}/scholar-major-${studentNo}.json`, JSON.stringify(result, null, 2));
  });
});
