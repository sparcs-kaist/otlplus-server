module.exports = [
  {
    script: './dist/src/bootstrap/bootstrap.js',
    name: 'otlplus',
    exec_mode: 'cluster',
    instances: 2,
    env: {
      NODE_ENV: 'dev',
    },
  },
];
