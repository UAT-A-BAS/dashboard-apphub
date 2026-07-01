import { describe, expect, it } from 'vitest';
import { getThemeFromCurrentTime, getThemeFromTime } from './weather';

describe('weather theme day/night boundary', () => {
  it('uses a daytime theme from 06:00 through 17:59', () => {
    expect(getThemeFromTime(new Date(2026, 6, 1, 6, 0))).toBe('clearMorning');
    expect(getThemeFromCurrentTime(3, new Date(2026, 6, 1, 17, 59))).toBe('cloudy');
  });

  it('uses a nighttime theme from 18:00 through 05:59', () => {
    expect(getThemeFromCurrentTime(3, new Date(2026, 6, 1, 18, 0))).toBe('cloudyNight');
    expect(getThemeFromTime(new Date(2026, 6, 2, 5, 59))).toBe('clearNight');
  });
});
