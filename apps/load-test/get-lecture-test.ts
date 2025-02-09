import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 30 }, // 1분 동안 100명의 VU로 증가
    { duration: '1m', target: 50 }, // 3분 동안 200명의 VU 유지
    { duration: '1m', target: 15 }, // 1분 동안 0명의 VU로 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95%의 요청이 1초 이내에 응답해야 함
    http_req_failed: ['rate<0.01'], // 실패율이 1% 미만이어야 함
  },
};

export default function () {
  const url =
    'https://api.otl.dev.sparcs.org/api/lectures?year=2024&semester=3&keyword=&type=HSE&department=ALL&level=ALL&order=old_code&order=class_no&limit=300&isFull=True';
  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'is response json': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5); // 요청 간격을 0.5초로 설정
}
