import { Injectable, Logger } from '@nestjs/common';
import settings from '@otl/scholar-sync/settings';
import axios from 'axios';
import qs from 'qs';
import * as https from 'node:https';
import { IScholar } from './IScholar';
import ScholarLectureType = IScholar.ScholarLectureType;
import ScholarExamtimeType = IScholar.ScholarExamtimeType;
import ScholarClasstimeType = IScholar.ScholarClasstimeType;
import ScholarAttendType = IScholar.ScholarAttendType;
import ScholarChargeType = IScholar.ScholarChargeType;
import ScholarDegreeType = IScholar.ScholarDegreeType;
import ScholarOtherMajorType = IScholar.ScholarOtherMajorType;
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ScholarApiClient {
  private readonly syncConfig = settings().syncConfig();
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(ScholarApiClient.name);

  constructor() {
    axios.defaults.paramsSerializer = (params) => {
      return qs.stringify(params);
    };
    this.apiKey = this.syncConfig.scholarKey;
    this.baseUrl = this.syncConfig.scholarUrl;
  }

  private async _get(path: string, params?: any): Promise<any> {
    try {
      // In the Python code, "verify=False" was used. We can replicate ignoring TLS in axios if needed.
      // But you might not want to do that in production.
      const fullUrl = `${this.baseUrl}${path}`;
      const response = await axios.get(fullUrl, {
        headers: {
          AUTH_KEY: this.apiKey,
          'Content-Type': 'application/json',
        },
        params: params,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // if ignoring SSL errors
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to GET from ${path}`, error);
      throw error;
    }
  }

  async getChargeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarChargeType[]> {
    const params = {
      lectureYear: lectureYear,
      lectureTerm: lectureTerm,
    };
    // in python: return _get(f"/charge_type2?{'&'.join(params)}")["OutBlock_1"]
    const data = await this._get(`/charge_type2`, params);
    return data?.OutBlock_1;
  }

  async getLectureType(lectureYear?: number, lectureTerm?: number): Promise<ScholarLectureType[]> {
    const params = {
      lectureYear: lectureYear,
      lectureTerm: lectureTerm,
    };
    const data = await this._get(`/lecture_type2`, params);
    console.log(data?.OutBlock_1);
    return plainToInstance<ScholarLectureType, any>(ScholarLectureType, (data?.OutBlock_1 as any[]) || [], {
      excludeExtraneousValues: true,
    });
  }

  async getExamTimeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarExamtimeType[]> {
    const params = {
      lectureYear: lectureYear,
      lectureTerm: lectureTerm,
    };
    const data = await this._get(`/exam_time_type2`, params);
    // return data?.OutBlock_1;
    return plainToInstance<ScholarExamtimeType, any[]>(ScholarExamtimeType, data?.OutBlock_1 || [], {
      excludeExtraneousValues: true,
    });
  }

  async getClassTimeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarClasstimeType[]> {
    const params = {
      lectureYear: lectureYear,
      lectureTerm: lectureTerm,
    };
    const data = await this._get(`/time_type2`, params);
    // return data?.OutBlock_1;
    return plainToInstance<ScholarClasstimeType, any[]>(ScholarClasstimeType, data?.OutBlock_1 || [], {
      excludeExtraneousValues: true,
    });
  }

  async getAttendType(lectureYear?: number, lectureTerm?: number, studentNo?: number): Promise<ScholarAttendType[]> {
    const params = {
      lectureYear: lectureYear,
      lectureTerm: lectureTerm,
      studentNo: studentNo,
    };
    const data = await this._get(`/attend_type2`, params);
    // return data?.OutBlock_1;
    return plainToInstance<ScholarAttendType, any[]>(ScholarAttendType, data?.OutBlock_1 || [], {
      excludeExtraneousValues: true,
    });
  }

  async getDegree(studentNo?: number): Promise<ScholarDegreeType[]> {
    const params = {
      studentNo: studentNo,
    };
    const data = await this._get(`/report_e_degree_k`, params);
    // return data?.OutBlock_1;
    return plainToInstance<ScholarDegreeType, any[]>(ScholarDegreeType, data?.OutBlock_1 || [], {
      excludeExtraneousValues: true,
    });
  }

  async getKdsStudentsOtherMajor(): Promise<ScholarOtherMajorType[]> {
    const data = await this._get('/kds_students_other_major');
    // return data?.OutBlock_1;
    return plainToInstance<ScholarOtherMajorType, any[]>(ScholarOtherMajorType, data?.OutBlock_1 || [], {
      excludeExtraneousValues: true,
    });
  }
}
