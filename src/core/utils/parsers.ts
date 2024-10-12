import { Time } from '@angular/common';

export function parseToTime(timeString: string): Time | undefined {
  const amPmRegex = /(\d{1,2}):(\d{2}) ?([aApP][mM])/;
  const amPmMath = timeString.match(amPmRegex);

  if (amPmMath) {
    const hours = parseInt(amPmMath[1], 10);
    const minutes = parseInt(amPmMath[2], 10);
    const period = amPmMath[3].toLowerCase();
    if (minutes < 0 || minutes > 59) {
      return undefined;
    }

    if (period === 'pm' && hours < 12) {
      return { hours: hours + 12, minutes };
    } else if (period === 'am' && hours === 12) {
      return { hours: 0, minutes };
    }
    return { hours, minutes };
  }
  const twentyFourHourRegex = /(\d{1,2}):(\d{2})/;
  const twentyFourHourMatch = timeString.match(twentyFourHourRegex);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1], 10);
    const minutes = parseInt(twentyFourHourMatch[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return undefined;
    }
    return { hours, minutes };
  } else {
    return undefined;
  }
}
