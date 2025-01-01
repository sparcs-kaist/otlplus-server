import ClinicHeapProfiler from '@clinic/heap-profiler';

const heapProfiler = new ClinicHeapProfiler();

// ['node', '--nodeoption', 'app.js']로 옵션 추가 가능
heapProfiler.collect(
  ['node', 'dist/src/bootstrap/bootstrap.js'],
  (err, filepath) => {
    if (err) {
      console.log('collect error\n', err);
    }

    console.log(filepath);
    heapProfiler.visualize(filepath, `${filepath}.html`, () => {
      if (err) {
        console.log('visualize error\n', err);
      }
    });
  },
);
