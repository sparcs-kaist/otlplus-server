#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { OTLApiClient } from './api-client.js';
import type { Course, Lecture, Review } from './types.js';

// Initialize API client
const apiClient = new OTLApiClient();

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'search_courses',
    description: 'Search for courses with various filters. Returns a list of courses matching the criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword for course title or code',
        },
        department: {
          type: 'number',
          description: 'Department ID to filter courses',
        },
        type: {
          type: 'string',
          description: 'Course type (e.g., "전공필수", "전공선택", "교양")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_course_details',
    description: 'Get detailed information about a specific course by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        course_id: {
          type: 'number',
          description: 'The ID of the course to retrieve',
        },
      },
      required: ['course_id'],
    },
  },
  {
    name: 'search_lectures',
    description: 'Search for lectures with various filters. Lectures are specific instances of courses offered in a particular year and semester.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword for lecture title or code',
        },
        year: {
          type: 'number',
          description: 'Academic year (e.g., 2024)',
        },
        semester: {
          type: 'number',
          description: 'Semester number (1: Spring, 2: Summer, 3: Fall, 4: Winter)',
        },
        department: {
          type: 'number',
          description: 'Department ID to filter lectures',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_lecture_details',
    description: 'Get detailed information about a specific lecture by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        lecture_id: {
          type: 'number',
          description: 'The ID of the lecture to retrieve',
        },
      },
      required: ['lecture_id'],
    },
  },
  {
    name: 'get_course_reviews',
    description: 'Get reviews for a specific course. Reviews include ratings for grade difficulty, workload, and teaching quality.',
    inputSchema: {
      type: 'object',
      properties: {
        course_id: {
          type: 'number',
          description: 'The ID of the course to get reviews for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of reviews to return (default: 10)',
          default: 10,
        },
      },
      required: ['course_id'],
    },
  },
  {
    name: 'get_lecture_reviews',
    description: 'Get reviews for a specific lecture. Reviews include ratings for grade difficulty, workload, and teaching quality.',
    inputSchema: {
      type: 'object',
      properties: {
        lecture_id: {
          type: 'number',
          description: 'The ID of the lecture to get reviews for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of reviews to return (default: 10)',
          default: 10,
        },
      },
      required: ['lecture_id'],
    },
  },
  {
    name: 'recommend_courses',
    description: 'Recommend courses based on specified criteria. This tool analyzes course data and reviews to suggest the best courses. You can filter by various criteria and sort by different metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        criteria: {
          type: 'string',
          description: 'Recommendation criteria: "high_rating" (courses with best reviews), "easy_grade" (courses with easier grading), "low_load" (courses with less workload), "good_teaching" (courses with best teaching quality)',
          enum: ['high_rating', 'easy_grade', 'low_load', 'good_teaching'],
          default: 'high_rating',
        },
        department: {
          type: 'number',
          description: 'Filter by department ID (optional)',
        },
        type: {
          type: 'string',
          description: 'Filter by course type (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of courses to recommend (default: 10)',
          default: 10,
        },
      },
    },
  },
];

/**
 * Recommend courses based on criteria
 */
async function recommendCourses(args: {
  criteria?: string;
  department?: number;
  type?: string;
  limit?: number;
}): Promise<string> {
  const { criteria = 'high_rating', department, type, limit = 10 } = args;

  // Search courses with filters
  const courses = await apiClient.searchCourses({
    department,
    type,
    limit: 100, // Get more courses to analyze
  });

  if (courses.length === 0) {
    return 'No courses found matching the criteria.';
  }

  // Sort courses based on criteria
  let sortedCourses: Course[];
  switch (criteria) {
    case 'easy_grade':
      sortedCourses = courses
        .filter((c) => c.review_total_weight > 0)
        .sort((a, b) => (b.grade_sum / b.review_total_weight) - (a.grade_sum / a.review_total_weight));
      break;
    case 'low_load':
      sortedCourses = courses
        .filter((c) => c.review_total_weight > 0)
        .sort((a, b) => (a.load_sum / a.review_total_weight) - (b.load_sum / b.review_total_weight));
      break;
    case 'good_teaching':
      sortedCourses = courses
        .filter((c) => c.review_total_weight > 0)
        .sort((a, b) => (b.speech_sum / b.review_total_weight) - (a.speech_sum / a.review_total_weight));
      break;
    case 'high_rating':
    default:
      // Calculate overall rating (combination of grade, low load, and teaching)
      sortedCourses = courses
        .filter((c) => c.review_total_weight > 0)
        .sort((a, b) => {
          const scoreA = (a.grade_sum + a.speech_sum - a.load_sum) / a.review_total_weight;
          const scoreB = (b.grade_sum + b.speech_sum - b.load_sum) / b.review_total_weight;
          return scoreB - scoreA;
        });
      break;
  }

  // Get top N courses
  const topCourses = sortedCourses.slice(0, limit);

  // Format results
  const results = topCourses.map((course, index) => {
    const avgGrade = course.review_total_weight > 0 ? (course.grade_sum / course.review_total_weight).toFixed(2) : 'N/A';
    const avgLoad = course.review_total_weight > 0 ? (course.load_sum / course.review_total_weight).toFixed(2) : 'N/A';
    const avgSpeech = course.review_total_weight > 0 ? (course.speech_sum / course.review_total_weight).toFixed(2) : 'N/A';

    return `${index + 1}. ${course.title} (${course.title_en})
   - ID: ${course.id}
   - Code: ${course.old_code}
   - Department: ${course.department.name}
   - Type: ${course.type}
   - Average Grade: ${avgGrade}/5
   - Average Load: ${avgLoad}/5
   - Average Teaching: ${avgSpeech}/5
   - Total Reviews: ${course.review_total_weight}
   ${course.summary ? `- Summary: ${course.summary}` : ''}`;
  });

  const criteriaDescription = {
    high_rating: 'overall rating (grade + teaching - load)',
    easy_grade: 'grade difficulty (easier grading)',
    low_load: 'workload (less work required)',
    good_teaching: 'teaching quality',
  };

  return `Top ${topCourses.length} courses recommended based on ${criteriaDescription[criteria as keyof typeof criteriaDescription] || criteria}:\n\n${results.join('\n\n')}`;
}

/**
 * Main server setup
 */
async function main() {
  const server = new Server(
    {
      name: 'otlplus-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'search_courses': {
          const courses = await apiClient.searchCourses({
            keyword: args.keyword as string | undefined,
            department: args.department as number | undefined,
            type: args.type as string | undefined,
            limit: (args.limit as number) || 20,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(courses, null, 2),
              },
            ],
          };
        }

        case 'get_course_details': {
          const course = await apiClient.getCourseById(args.course_id as number);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(course, null, 2),
              },
            ],
          };
        }

        case 'search_lectures': {
          const lectures = await apiClient.searchLectures({
            keyword: args.keyword as string | undefined,
            year: args.year as number | undefined,
            semester: args.semester as number | undefined,
            department: args.department as number | undefined,
            limit: (args.limit as number) || 20,
          });
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(lectures, null, 2),
              },
            ],
          };
        }

        case 'get_lecture_details': {
          const lecture = await apiClient.getLectureById(args.lecture_id as number);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(lecture, null, 2),
              },
            ],
          };
        }

        case 'get_course_reviews': {
          const reviews = await apiClient.getReviewsByCourseId(args.course_id as number, {
            order: ['-created_datetime'],
          });
          const limitedReviews = reviews.slice(0, (args.limit as number) || 10);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(limitedReviews, null, 2),
              },
            ],
          };
        }

        case 'get_lecture_reviews': {
          const reviews = await apiClient.getReviewsByLectureId(args.lecture_id as number, {
            order: ['-created_datetime'],
          });
          const limitedReviews = reviews.slice(0, (args.limit as number) || 10);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(limitedReviews, null, 2),
              },
            ],
          };
        }

        case 'recommend_courses': {
          const recommendation = await recommendCourses({
            criteria: args.criteria as string | undefined,
            department: args.department as number | undefined,
            type: args.type as string | undefined,
            limit: (args.limit as number) || 10,
          });
          return {
            content: [
              {
                type: 'text',
                text: recommendation,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('OTL Plus MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
