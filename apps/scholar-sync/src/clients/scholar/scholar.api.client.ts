import { Injectable, Logger } from '@nestjs/common'
import settings from '@otl/scholar-sync/settings'
import axios from 'axios'
import * as https from 'node:https'
import qs from 'qs'

import { IScholar } from './IScholar'
import ScholarLectureType = IScholar.ScholarLectureType
import ScholarExamtimeType = IScholar.ScholarExamtimeType
import ScholarClasstimeType = IScholar.ScholarClasstimeType
import ScholarAttendType = IScholar.ScholarAttendType
import ScholarChargeType = IScholar.ScholarChargeType
import ScholarDegreeType = IScholar.ScholarDegreeType
import ScholarOtherMajorType = IScholar.ScholarOtherMajorType
import { plainToInstance } from 'class-transformer'

@Injectable()
export class ScholarApiClient {
  private readonly syncConfig = settings().syncConfig()

  private readonly apiKey: string | undefined

  private readonly baseUrl: string | undefined

  private readonly logger = new Logger(ScholarApiClient.name)

  constructor() {
    axios.defaults.paramsSerializer = (params) => qs.stringify(params)
    this.apiKey = this.syncConfig.scholarKey
    this.baseUrl = this.syncConfig.scholarUrl
  }

  private async get(path: string, params?: Record<string, number | undefined>): Promise<{ OutBlock_1: unknown[] }> {
    try {
      // In the Python code, "verify=False" was used. We can replicate ignoring TLS in axios if needed.
      // But you might not want to do that in production.
      const fullUrl = `${this.baseUrl}${path}`
      const response = await axios.get<unknown>(fullUrl, {
        headers: {
          'AUTH_KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        params,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // if ignoring SSL errors
      })
      const { data } = response
      if (data == null) return { OutBlock_1: [] }
      if (typeof data !== 'object' || !('OutBlock_1' in data)) {
        throw new Error('Invalid scholar response envelope')
      }
      const rows: unknown = data.OutBlock_1
      if (rows == null) return { OutBlock_1: [] }
      if (!Array.isArray(rows)) throw new Error('Invalid scholar response rows')
      return { OutBlock_1: rows }
    }
    catch (error) {
      this.logger.error(`Failed to GET from ${path}`, error)
      throw error
    }
  }

  async getChargeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarChargeType[]> {
    const params = {
      lecture_year: lectureYear,
      lecture_term: lectureTerm,
    }
    // in python: return get(f"/charge_type2?{'&'.join(params)}")["OutBlock_1"]
    const data = await this.get('/charge_type2', params)
    // return data?.OutBlock_1;
    return plainToInstance(ScholarChargeType, data.OutBlock_1)
  }

  async getLectureType(lectureYear?: number, lectureTerm?: number): Promise<IScholar.ScholarLectureType[]> {
    const params = {
      lecture_year: lectureYear,
      lecture_term: lectureTerm,
    }
    const data = await this.get('/lecture_type2', params)
    // console.log(data?.OutBlock_1);
    return plainToInstance(ScholarLectureType, data.OutBlock_1)
  }

  async getExamTimeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarExamtimeType[]> {
    const params = {
      lecture_year: lectureYear,
      lecture_term: lectureTerm,
    }
    const data = await this.get('/exam_time_type2', params)
    // return data?.OutBlock_1;
    return plainToInstance(ScholarExamtimeType, data.OutBlock_1)
  }

  async getClassTimeType(lectureYear?: number, lectureTerm?: number): Promise<ScholarClasstimeType[]> {
    const params = {
      lecture_year: lectureYear,
      lecture_term: lectureTerm,
    }
    const data = await this.get('/time_type2', params)
    // return data?.OutBlock_1;
    return plainToInstance(ScholarClasstimeType, data.OutBlock_1)
  }

  async getAttendType(lectureYear?: number, lectureTerm?: number, studentNo?: number): Promise<ScholarAttendType[]> {
    const params = {
      lecture_year: lectureYear,
      lecture_term: lectureTerm,
      student_no: studentNo,
    }
    const data = await this.get('/attend_type2', params)
    // return data?.OutBlock_1;
    return plainToInstance(ScholarAttendType, data.OutBlock_1)
  }

  async getDegree(studentNo?: number): Promise<ScholarDegreeType[]> {
    const params = {
      student_no: studentNo,
    }
    const data = await this.get('/report_e_degree_k', params)
    // return data?.OutBlock_1;
    return plainToInstance(ScholarDegreeType, data.OutBlock_1)
  }

  async getKdsStudentsOtherMajor(): Promise<ScholarOtherMajorType[]> {
    const data = await this.get('/kds_students_other_major')
    // return data?.OutBlock_1;
    return plainToInstance(ScholarOtherMajorType, data.OutBlock_1)
  }
}
