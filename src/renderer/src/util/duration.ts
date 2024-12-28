import padStart from 'lodash/padStart';

export function formatDuration({ seconds: totalSecondsIn, fileNameFriendly, showFraction = true, shorten = false, fps }: {
  seconds?: number | undefined, fileNameFriendly?: boolean | undefined, showFraction?: boolean | undefined, shorten?: boolean | undefined, fps?: number | undefined,
}) {
  const totalSeconds = totalSecondsIn || 0;
  const totalSecondsAbs = Math.abs(totalSeconds);
  const sign = totalSeconds < 0 ? '-' : '';

  const unitsPerSec = fps != null ? fps : 1000;

  // round to integer for our current unit
  const totalUnits = Math.round(totalSecondsAbs * unitsPerSec);

  const seconds = Math.floor(totalUnits / unitsPerSec);
  const secondsPadded = padStart(String(seconds % 60), 2, '0');
  const minutes = Math.floor(totalUnits / unitsPerSec / 60) % 60;
  const hours = Math.floor(totalUnits / unitsPerSec / 60 / 60);

  const minutesPadded = shorten && hours === 0 ? `${minutes}` : padStart(String(minutes), 2, '0');

  const remainder = totalUnits % unitsPerSec;

  // Be nice to filenames and use .
  const delim = fileNameFriendly ? '.' : ':';

  let hoursPart = '';
  if (!shorten || hours !== 0) {
    const hoursPadded = shorten ? `${hours}` : padStart(String(hours), 2, '0');
    hoursPart = `${hoursPadded}${delim}`;
  }

  let fraction = '';
  if (showFraction && !(shorten && remainder === 0)) {
    const numDigits = fps != null ? 2 : 3;
    fraction = `.${padStart(String(Math.floor(remainder)), numDigits, '0')}`;
  }

  return `${sign}${hoursPart}${minutesPadded}${delim}${secondsPadded}${fraction}`;
}

// todo adapt also to frame counts and frame fractions?
export const isExactDurationMatch = (str: string) => /^-?\d{2}:\d{2}:\d{2}.\d{3}$/.test(str);

// See also parseYoutube
export function parseDuration(str: string, fps?: number) {
  // eslint-disable-next-line unicorn/better-regex
  const match = str.replaceAll(/\s/g, '').match(/^(-?)(?:(?:(\d{1,}):)?(\d{1,2}):)?(\d{1,2}(?:[.,]\d{1,3})?)$/);

  if (!match) return undefined;

  const [, sign, hourStr, minStr, secStrRaw] = match;
  const hour = hourStr != null ? parseInt(hourStr, 10) : 0;
  const min = minStr != null ? parseInt(minStr, 10) : 0;

  const secWithFraction = secStrRaw!.replace(',', '.');

  let sec: number;
  if (fps == null) {
    sec = parseFloat(secWithFraction);
  } else {
    const [secStr, framesStr] = secWithFraction.split('.');
    sec = parseInt(secStr!, 10) + (framesStr != null ? parseInt(framesStr, 10) : 0) / fps;
  }

  if (min > 59) return undefined;
  if (sec >= 60) return undefined;

  let time = (((hour * 60) + min) * 60 + sec);

  if (sign === '-') time *= -1;

  return time;
}
