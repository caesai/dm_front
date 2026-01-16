import { getRestaurantStatus } from '@/utils.ts';

const worktime = [
  { id: 1, weekday: 'пн', time_start: '17:00', time_end: '23:00' },
  { id: 2, weekday: 'вт', time_start: '17:00', time_end: '23:00' },
  { id: 3, weekday: 'ср', time_start: '17:00', time_end: '23:00' },
  { id: 4, weekday: 'чт', time_start: '17:00', time_end: '23:00' },
  { id: 5, weekday: 'пт', time_start: '13:00', time_end: '01:00' },
  { id: 6, weekday: 'сб', time_start: '13:00', time_end: '01:00' },
  { id: 7, weekday: 'вс', time_start: '13:00', time_end: '23:00' },
];

describe('getRestaurantStatus', () => {
  // Weekdays (Monday–Thursday)
  test('Monday at 16:59 - should report opening at 17:00', () => {
    expect(getRestaurantStatus(worktime, 'пн', '16:59')).toBe('Откроется в 17:00');
  });
  test('Monday at 17:00 - should be open until 23:00', () => {
    expect(getRestaurantStatus(worktime, 'пн', '17:00')).toBe('Открыто до 23:00');
  });
  test('Monday at 23:00 - should report will open at 17:00', () => {
    expect(getRestaurantStatus(worktime, 'пн', '23:00')).toBe('Откроется в 17:00');
  });
  test('Monday at 12:00 - should report opening at 17:00', () => {
    expect(getRestaurantStatus(worktime, 'пн', '12:00')).toBe('Откроется в 17:00');
  });

  // Friday
  test('Friday at 12:59 - should report opening at 13:00', () => {
    expect(getRestaurantStatus(worktime, 'пт', '12:59')).toBe('Откроется в 13:00');
  });
  test('Friday at 13:00 - should be open until 01:00', () => {
    expect(getRestaurantStatus(worktime, 'пт', '13:00')).toBe('Открыто до 01:00');
  });
  test('Friday at 23:59 - should be open until 01:00', () => {
    expect(getRestaurantStatus(worktime, 'пт', '23:59')).toBe('Открыто до 01:00');
  });
  test('Saturday at 00:30 - should be open until 01:00 (from Friday overnight)', () => {
    expect(getRestaurantStatus(worktime, 'сб', '00:30')).toBe('Открыто до 01:00');
  });
  test('Saturday at 01:00 - should report will open at 13:00', () => {
    expect(getRestaurantStatus(worktime, 'сб', '01:00')).toBe('Откроется в 13:00');
  });

  // Saturday
  test('Saturday at 12:59 - should report opening at 13:00', () => {
    expect(getRestaurantStatus(worktime, 'сб', '12:59')).toBe('Откроется в 13:00');
  });
  test('Saturday at 13:00 - should be open until 01:00', () => {
    expect(getRestaurantStatus(worktime, 'сб', '13:00')).toBe('Открыто до 01:00');
  });
  test('Sunday at 00:30 - should be open until 01:00 (from Saturday overnight)', () => {
    expect(getRestaurantStatus(worktime, 'вс', '00:30')).toBe('Открыто до 01:00');
  });

  // Sunday
  test('Sunday at 12:59 - should report opening at 13:00', () => {
    expect(getRestaurantStatus(worktime, 'вс', '12:59')).toBe('Откроется в 13:00');
  });
  test('Sunday at 13:00 - should be open until 23:00', () => {
    expect(getRestaurantStatus(worktime, 'вс', '13:00')).toBe('Открыто до 23:00');
  });
  test('Sunday at 23:00 - should report will open at 17:00', () => {
    expect(getRestaurantStatus(worktime, 'вс', '23:00')).toBe('Откроется в 17:00');
  });
  test('Monday at 00:30 - should report will open at 17:00', () => {
    expect(getRestaurantStatus(worktime, 'пн', '00:30')).toBe('Откроется в 17:00');
  });
});