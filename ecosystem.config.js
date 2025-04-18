module.exports = {
  apps: [
    {
      name: '@otl/server-nest',
      script: './dist/apps/server/apps/server/src/bootstrap/bootstrap.js',
      instances: 2,
      exec_mode: 'cluster',
      merge_logs: true,
      autorestart: true,
      wait_ready: true,
      kill_timeout: 5000, // 새로운 프로세스 실행이 완료된 후 예전 프로세스를 교체하기까지 기다릴 시
      max_memory_restart: '1024M',
      node_args: '--max-old-space-size=2048',
    },
  ],
};
