import axios, { AxiosInstance } from 'axios';
import type {
  Course,
  Lecture,
  Review,
  SearchCoursesParams,
  SearchLecturesParams,
  SearchReviewsParams,
  UserProfile,
  TakenCoursesParams,
  TakenLecture,
} from './types.js';

/**
 * OTL Plus API Client
 * Provides read-only access to course, lecture, and review data
 * Supports authentication with access token for user-specific data
 */
export class OTLApiClient {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(baseURL: string = 'https://otl.sparcs.org', accessToken?: string) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  }

  /**
   * Set or update the access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    this.accessToken = undefined;
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Search courses with various filters
   */
  async searchCourses(params: SearchCoursesParams = {}): Promise<Course[]> {
    const response = await this.client.get<Course[]>('/api/courses', { params });
    return response.data;
  }

  /**
   * Get course details by ID
   */
  async getCourseById(id: number): Promise<Course> {
    const response = await this.client.get<Course>(`/api/courses/${id}`);
    return response.data;
  }

  /**
   * Get lectures for a specific course
   */
  async getLecturesByCourseId(courseId: number, params: { year?: number; semester?: number } = {}): Promise<Lecture[]> {
    const response = await this.client.get<Lecture[]>(`/api/courses/${courseId}/lectures`, { params });
    return response.data;
  }

  /**
   * Get reviews for a specific course
   */
  async getReviewsByCourseId(courseId: number, params: { order?: string[] } = {}): Promise<Review[]> {
    const response = await this.client.get<Review[]>(`/api/courses/${courseId}/reviews`, { params });
    return response.data;
  }

  /**
   * Search lectures with various filters
   */
  async searchLectures(params: SearchLecturesParams = {}): Promise<Lecture[]> {
    const response = await this.client.get<Lecture[]>('/api/lectures', { params });
    return response.data;
  }

  /**
   * Get lecture details by ID
   */
  async getLectureById(id: number): Promise<Lecture> {
    const response = await this.client.get<Lecture>(`/api/lectures/${id}`);
    return response.data;
  }

  /**
   * Get reviews for a specific lecture
   */
  async getReviewsByLectureId(lectureId: number, params: { order?: string[] } = {}): Promise<Review[]> {
    const response = await this.client.get<Review[]>(`/api/lectures/${lectureId}/reviews`, { params });
    return response.data;
  }

  /**
   * Search reviews with filters
   */
  async searchReviews(params: SearchReviewsParams = {}): Promise<Review[]> {
    const response = await this.client.get<Review[]>('/api/reviews', { params });
    return response.data;
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: number): Promise<Review> {
    const response = await this.client.get<Review>(`/api/reviews/${id}`);
    return response.data;
  }

  /**
   * Get course autocomplete suggestions
   */
  async getCourseAutocomplete(keyword: string): Promise<string | undefined> {
    const response = await this.client.get<string | undefined>('/api/courses/autocomplete', {
      params: { keyword },
    });
    return response.data;
  }

  /**
   * Get lecture autocomplete suggestions
   */
  async getLectureAutocomplete(keyword: string): Promise<string | undefined> {
    const response = await this.client.get<string | undefined>('/api/lectures/autocomplete', {
      params: { keyword },
    });
    return response.data;
  }

  /**
   * Get current user's profile (requires authentication)
   */
  async getUserProfile(): Promise<UserProfile> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required. Please set access token first.');
    }
    const response = await this.client.get<UserProfile>('/session/me');
    return response.data;
  }

  /**
   * Get user's taken courses (requires authentication)
   */
  async getUserTakenCourses(userId: number, params: TakenCoursesParams = {}): Promise<Course[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required. Please set access token first.');
    }
    const response = await this.client.get<Course[]>(`/api/users/${userId}/taken-courses`, { params });
    return response.data;
  }

  /**
   * Get user's taken lectures for a specific semester (requires authentication)
   */
  async getTakenLecturesBySemester(year: number, semester: number): Promise<TakenLecture[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required. Please set access token first.');
    }
    const response = await this.client.get<TakenLecture[]>(`/session/${year}/${semester}/taken-lectures`);
    return response.data;
  }
}
