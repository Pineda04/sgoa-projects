import {
  courseClassroomSchedulesConflict,
  courseClassroomSectionsOverlap,
  inferCourseClassroomSection,
  normalizeCourseClassroomDays,
  normalizeCourseClassroomSection,
  parseCourseClassroomSection,
} from './course-classroom-schedule.util';

describe('course classroom schedule utilities', () => {
  it('normalizes days into weekday order', () => {
    expect(normalizeCourseClassroomDays('ViLuMi')).toBe('LuMiVi');
  });

  it.each(['LuLu', 'LuXX', '', 'L'])('rejects invalid days %s', (days) => {
    expect(() => normalizeCourseClassroomDays(days)).toThrow();
  });

  it.each([
    ['8:05-10:30', '08:05 - 10:30'],
    ['8:05 AM - 1:30 pm', '08:05 - 13:30'],
  ])('normalizes section %s', (section, expected) => {
    expect(normalizeCourseClassroomSection(section)).toBe(expected);
  });

  it.each(['08:00', '10:00 - 09:00', '08:00 - 08:00', '25:00 - 26:00'])(
    'rejects invalid section %s',
    (section) => {
      expect(() => normalizeCourseClassroomSection(section)).toThrow();
      expect(parseCourseClassroomSection(section)).toBeNull();
    },
  );

  it('detects actual overlap and permits adjacent ranges', () => {
    expect(
      courseClassroomSectionsOverlap('07:30 - 09:15', '09:00 - 10:00'),
    ).toBe(true);
    expect(
      courseClassroomSectionsOverlap('07:30 - 09:00', '09:00 - 10:00'),
    ).toBe(false);
    expect(courseClassroomSectionsOverlap('08:00', '08:00 - 09:00')).toBe(
      false,
    );
  });

  it('treats an unknown legacy interval as a conservative conflict', () => {
    expect(
      courseClassroomSchedulesConflict('Lu', '08:00', 'Lu', '10:00 - 11:00'),
    ).toBe(true);
    expect(
      courseClassroomSchedulesConflict('Lu', '08:00', 'Ma', '10:00 - 11:00'),
    ).toBe(false);
  });

  it.each([
    ['4:00 PM', '16:00', '17:00', 16 * 60, 17 * 60],
    ['10:00', '10:00', '11:00', 600, 660],
    ['8:05 AM', '08:05', '09:05', 485, 545],
  ])(
    'infers a one-hour range for legacy section %s',
    (section, startTime, endTime, startMinutes, endMinutes) => {
      expect(inferCourseClassroomSection(section)).toEqual({
        startTime,
        endTime,
        startMinutes,
        endMinutes,
      });
    },
  );

  it('returns an explicit range unchanged and null when nothing is readable', () => {
    expect(inferCourseClassroomSection('07:30 - 09:15')).toEqual({
      startTime: '07:30',
      endTime: '09:15',
      startMinutes: 450,
      endMinutes: 555,
    });
    expect(inferCourseClassroomSection('SEC-01')).toBeNull();
  });
});
