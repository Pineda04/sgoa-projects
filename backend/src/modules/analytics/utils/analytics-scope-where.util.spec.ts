import { analyticsScopeToCourseClassroomWhere } from './analytics-scope-where.util';

describe('analyticsScopeToCourseClassroomWhere', () => {
  it('keeps teacher and center restrictions conjunctive inside each OR branch', () => {
    expect(
      analyticsScopeToCourseClassroomWhere(
        {
          domain: 'academic-load',
          branches: [
            {
              type: 'centerDepartments',
              centerDepartmentIds: ['center-1'],
              teacherId: 'teacher-1',
            },
            { type: 'teacher', teacherId: 'teacher-2' },
          ],
        },
        'period-1',
      ),
    ).toEqual({
      OR: [
        {
          teachingSession: {
            assignmentReport: {
              periodId: 'period-1',
              teacherId: 'teacher-1',
              centerDepartmentId: { in: ['center-1'] },
            },
          },
        },
        {
          teachingSession: {
            assignmentReport: {
              periodId: 'period-1',
              teacherId: 'teacher-2',
            },
          },
        },
      ],
    });
  });
});
