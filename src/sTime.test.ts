import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TestLocalTimeZone } from './__test__/constants.js'
import { setFakeTimer } from './__test__/setFakeTimer.js'
import { MinutesInDay, MinutesInHour } from './internal/constants.js'
import {
  addMinutesToTime,
  get12HourTimeString,
  get12HoursHoursStringFromTime,
  getHoursFromTime,
  getMinutesFromTime,
  getMinutesStringFromTime,
  getTimeAtMidnight,
  getTimeFromMinutes,
  getTimeInMinutes,
  getTimeNow,
  isAfterTime,
  isBeforeTime,
  isSameTime,
  isSameTimeOrAfter,
  isSameTimeOrBefore,
  isTimePM,
  sTime,
} from './sTime.js'

beforeEach(() => {
  vi.useRealTimers()
})

/**
 * --- Factory ---
 */

describe('sTime', () => {
  it('works when given a valid string value', () => {
    expect(sTime('12:34')).toMatchInlineSnapshot(`"12:34"`)
  })

  it('works when given a valid STime', () => {
    expect(sTime(sTime('12:34'))).toMatchInlineSnapshot(`"12:34"`)
  })

  it('throws for invalid value', () => {
    expect(() => {
      sTime('')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time format. Expected format: HH:MM. Current value: ''.]`,
    )
  })

  it('throws for invalid length data', () => {
    expect(() => {
      sTime('180')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time format. Expected format: HH:MM. Current value: '180'.]`,
    )
  })

  it('throws for invalid characters', () => {
    expect(() => {
      sTime('11:0a')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time format. Expected format: HH:MM. Current value: '11:0a'.]`,
    )
  })

  it('throws for time that does not exist', () => {
    expect(() => {
      sTime('24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

/**
 * --- Serialization ---
 */

describe('JSON.stringify', () => {
  it('returns the string value for the time in HH:MM format', () => {
    const time = sTime('13:45')
    expect(JSON.stringify(time)).toMatchInlineSnapshot(`""13:45""`)
  })
})

/**
 * --- Factory helpers ---
 */

describe('getTimeNow', () => {
  it('works for a day at midnight', () => {
    setFakeTimer('2022-04-04T00:00')

    expect(getTimeNow(TestLocalTimeZone)).toMatchInlineSnapshot(`"00:00"`)
  })

  it('works for a day a second before midnight', () => {
    setFakeTimer('2022-04-03T23:59:59')

    expect(getTimeNow(TestLocalTimeZone)).toMatchInlineSnapshot(`"23:59"`)
  })

  it('works for a day in the middle of the day', () => {
    setFakeTimer('2022-04-04T12:59:59')

    expect(getTimeNow(TestLocalTimeZone)).toMatchInlineSnapshot(`"12:59"`)
  })
})

describe('getTimeAtMidnight', () => {
  it('works when requesting midnight', () => {
    expect(getTimeAtMidnight()).toMatchInlineSnapshot(`"00:00"`)
  })
})

describe('getTimeFromMinutes', () => {
  it('works for midnight (0:00)', () => {
    expect(getTimeFromMinutes(0)).toMatchInlineSnapshot(`"00:00"`)
  })

  it('works for midnight (24:00)', () => {
    expect(getTimeFromMinutes(MinutesInDay)).toMatchInlineSnapshot(`"00:00"`)
  })

  it('works for time past midnight (24:01)', () => {
    expect(getTimeFromMinutes(MinutesInDay + 1)).toMatchInlineSnapshot(
      `"00:01"`,
    )
  })

  it('works for noon', () => {
    expect(getTimeFromMinutes(MinutesInDay / 2)).toMatchInlineSnapshot(
      `"12:00"`,
    )
  })

  it('works for other times', () => {
    expect(getTimeFromMinutes(3 * MinutesInHour + 33)).toMatchInlineSnapshot(
      `"03:33"`,
    )
  })

  it('works for negative minutes', () => {
    expect(getTimeFromMinutes(-1)).toMatchInlineSnapshot(`"23:59"`)
  })
})

/**
 * --- Getters ---
 */

describe('getHoursFromTime', () => {
  it('works for a valid STime', () => {
    const time = sTime('12:59')

    expect(getHoursFromTime(time)).toMatchInlineSnapshot(`12`)
  })

  it('works for a valid string', () => {
    expect(getHoursFromTime('00:01')).toMatchInlineSnapshot(`0`)
  })

  it('throws for invalid time', () => {
    expect(() => {
      getHoursFromTime('2:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time format. Expected format: HH:MM. Current value: '2:00'.]`,
    )
  })
})

describe('get12HoursHoursStringFromTime', () => {
  it('works for a valid STime', () => {
    const time = sTime('12:59')

    expect(get12HoursHoursStringFromTime(time)).toMatchInlineSnapshot(`"12"`)
  })

  it('works for a valid string (midnight)', () => {
    expect(get12HoursHoursStringFromTime('00:01')).toMatchInlineSnapshot(`"12"`)
  })

  it('works for after noon', () => {
    const time = sTime('23:59')

    expect(get12HoursHoursStringFromTime(time)).toMatchInlineSnapshot(`"11"`)
  })

  it('throws for invalid time', () => {
    expect(() => {
      get12HoursHoursStringFromTime('29:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '29:00'.]`,
    )
  })
})

describe('getMinutesFromTime', () => {
  it('works for a valid STime', () => {
    const time = sTime('12:59')

    expect(getMinutesFromTime(time)).toMatchInlineSnapshot(`59`)
  })

  it('works for a valid string', () => {
    expect(getMinutesFromTime('00:01')).toMatchInlineSnapshot(`1`)
  })

  it('throws for invalid time', () => {
    expect(() => {
      getMinutesFromTime('00:90')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '00:90'.]`,
    )
  })
})

describe('getMinutesStringFromTime', () => {
  it('works for a valid STime', () => {
    const time = sTime('12:59')

    expect(getMinutesStringFromTime(time)).toMatchInlineSnapshot(`"59"`)
  })

  it('works for a valid string and includes padding', () => {
    expect(getMinutesStringFromTime('00:01')).toMatchInlineSnapshot(`"01"`)
  })

  it('returns the minutes text for time (no padding required)', () => {
    const time = sTime('23:23')
    expect(getMinutesStringFromTime(time)).toMatchInlineSnapshot(`"23"`)
  })

  it('throws for invalid time', () => {
    expect(() => {
      getMinutesStringFromTime('00:90')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '00:90'.]`,
    )
  })
})

describe('get12HourTimeString', () => {
  it('works with am time', () => {
    expect(get12HourTimeString(sTime('10:25'))).toMatchInlineSnapshot(
      `"10:25 AM"`,
    )
  })

  it('works with pm time', () => {
    expect(get12HourTimeString('22:25')).toMatchInlineSnapshot(`"10:25 PM"`)
  })

  it('works with midnight', () => {
    expect(get12HourTimeString('00:00')).toMatchInlineSnapshot(`"12:00 AM"`)
  })

  it('works with noon', () => {
    expect(get12HourTimeString('12:00')).toMatchInlineSnapshot(`"12:00 PM"`)
  })

  it('throws for invalid time', () => {
    expect(() => {
      get12HourTimeString('29:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '29:00'.]`,
    )
  })
})

describe('getTimeInMinutes', () => {
  it('works for midnight (0:00) default', () => {
    expect(getTimeInMinutes('00:00')).toMatchInlineSnapshot(`0`)
  })

  it('works for midnight (0:00) with param', () => {
    const time = getTimeAtMidnight()

    expect(getTimeInMinutes(time, false)).toMatchInlineSnapshot(`0`)
  })

  it('works for midnight (24:00)', () => {
    const time = getTimeAtMidnight()

    expect(getTimeInMinutes(time, true)).toBe(MinutesInDay)
  })

  it('works for noon', () => {
    expect(getTimeInMinutes('12:00', true)).toBe(12 * MinutesInHour)
  })

  it('works for other times', () => {
    expect(getTimeInMinutes('03:33', true)).toBe(3 * MinutesInHour + 33)
  })

  it('throws for invalid time', () => {
    expect(() => {
      getTimeInMinutes('29:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '29:00'.]`,
    )
  })
})

/**
 * --- Operations ---
 */

describe('addMinutesToTime', () => {
  it('works to add 0 minutes', () => {
    const time = sTime('14:09')

    expect(addMinutesToTime(time, 0)).toMatchInlineSnapshot(`"14:09"`)
  })

  it('works to add negative minutes', () => {
    expect(addMinutesToTime('14:09', -10)).toMatchInlineSnapshot(`"13:59"`)
  })

  it('works to add negative minutes (more than a day)', () => {
    const time = sTime('14:09')

    expect(
      addMinutesToTime(time, -(MinutesInDay * 100 + 5)),
    ).toMatchInlineSnapshot(`"14:04"`)
  })

  it('works to add positive minutes', () => {
    expect(addMinutesToTime('14:09', 61)).toMatchInlineSnapshot(`"15:10"`)
  })

  it('works to add positive minutes (more than a day)', () => {
    expect(addMinutesToTime('14:09', MinutesInDay + 5)).toMatchInlineSnapshot(
      `"14:14"`,
    )
  })

  it('throws for invalid time', () => {
    expect(() => {
      addMinutesToTime('29:00', 10)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '29:00'.]`,
    )
  })
})

/**
 * --- Comparisons ---
 */

describe('isSameTime', () => {
  it('works for times that are the same instance', () => {
    const a = sTime('09:43')
    expect(isSameTime(a, a)).toBe(true)
  })

  it('works for times that are the same but different instances', () => {
    const a = sTime('10:20')
    const b = sTime('10:20')

    expect(isSameTime(a, b)).toBe(true)
  })

  it('works for times that are different (hour)', () => {
    const b = sTime('09:20')

    expect(isSameTime('10:20', b)).toBe(false)
  })

  it('works for times that are different (all components)', () => {
    const a = sTime('00:00')

    expect(isSameTime(a, '12:01')).toBe(false)
  })

  it('works for noon and midnight', () => {
    expect(isSameTime('00:00', '12:00')).toBe(false)
  })

  it('works for times that start from same instance but are different', () => {
    const a = sTime('23:59')

    expect(isSameTime(a, addMinutesToTime(a, 1))).toBe(false)
  })

  it('throws for invalid first argument', () => {
    expect(() => {
      isSameTime('24:00', '12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })

  it('throws for invalid second argument', () => {
    expect(() => {
      isSameTime('12:00', '24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

describe('isAfterTime', () => {
  it('works for time that is after', () => {
    const a = sTime('12:01')
    const b = sTime('12:00')

    expect(isAfterTime(a, b)).toBe(true)
  })

  it('works for time that is before', () => {
    const a = sTime('12:00')
    const b = sTime('12:01')

    expect(isAfterTime(a, b)).toBe(false)
  })

  it('works for time that is the same', () => {
    const a = sTime('12:00')
    const b = sTime('12:00')

    expect(isAfterTime(a, b)).toBe(false)
  })

  it('throws when the first argument is an invalid time', () => {
    expect(() => {
      isAfterTime('24:00', '12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })

  it('throws when the second argument is an invalid time', () => {
    expect(() => {
      isAfterTime('12:00', '24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

describe('isSameTimeOrAfter', () => {
  it('works for time that is after', () => {
    const b = sTime('12:00')

    expect(isSameTimeOrAfter('14:03', b)).toBe(true)
  })

  it('works for time that is before', () => {
    const a = sTime('12:00')

    expect(isSameTimeOrAfter(a, '12:01')).toBe(false)
  })

  it('works for time that is the same', () => {
    const a = sTime('12:00')
    const b = sTime('12:00')

    expect(isSameTimeOrAfter(a, b)).toBe(true)
  })

  it('throws when the first argument is an invalid time', () => {
    expect(() => {
      isSameTimeOrAfter('24:00', '12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })

  it('throws when the second argument is an invalid time', () => {
    expect(() => {
      isSameTimeOrAfter('12:00', '24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

describe('isBeforeTime', () => {
  it('works for time that is before', () => {
    const a = sTime('00:23')
    const b = sTime('11:23')

    expect(isBeforeTime(a, b)).toBe(true)
  })

  it('works for time that is after', () => {
    const a = sTime('12:01')

    expect(isBeforeTime(a, '12:00')).toBe(false)
  })

  it('works for time that is the same', () => {
    const b = sTime('12:00')

    expect(isBeforeTime('12:00', b)).toBe(false)
  })

  it('throws when the first argument is an invalid time', () => {
    expect(() => {
      isBeforeTime('24:00', '12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })

  it('throws when the second argument is an invalid time', () => {
    expect(() => {
      isBeforeTime('12:00', '24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

describe('isSameTimeOrBefore', () => {
  it('works for time that is after', () => {
    const a = sTime('12:01')

    expect(isSameTimeOrBefore(a, '12:00')).toBe(false)
  })

  it('works for time that is before', () => {
    const b = sTime('12:01')

    expect(isSameTimeOrBefore('12:00', b)).toBe(true)
  })

  it('works for time that is the same', () => {
    expect(isSameTimeOrBefore('23:01', '23:01')).toBe(true)
  })

  it('throws when the first argument is an invalid time', () => {
    expect(() => {
      isSameTimeOrBefore('24:00', '12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })

  it('throws when the second argument is an invalid time', () => {
    expect(() => {
      isSameTimeOrBefore('12:00', '24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

describe('isTimePM', () => {
  it('works for string value (midnight)', () => {
    expect(isTimePM('00:00')).toBe(false)
  })

  it('works for STime', () => {
    expect(isTimePM(sTime('23:59'))).toBe(true)
  })

  it('throws for invalid time', () => {
    expect(() => {
      isTimePM('29:75')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '29:75'.]`,
    )
  })
})
