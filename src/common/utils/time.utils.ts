export const getTimeNumeric = (time: Date, isClass = true) => {
  const beginNumeric = (time.getUTCHours() * 60) + time.getUTCMinutes();
  if (beginNumeric % 30 && isClass) {
    return beginNumeric - (beginNumeric % 30);
  } else {
    return beginNumeric;
  }
}