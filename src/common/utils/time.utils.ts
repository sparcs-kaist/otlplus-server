export const getTimeNumeric = (time: Date) => {
  const beginNumeric = time.getHours() * 60 + time.getMinutes();
  if (beginNumeric % 30) {
    return beginNumeric + (30 - beginNumeric % 30);
  } else {
    return beginNumeric;
  }
}