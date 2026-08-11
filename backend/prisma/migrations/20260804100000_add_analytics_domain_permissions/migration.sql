UPDATE "academic"."positions"
SET "name" = 'Docente'
WHERE "id" = 'a2de91eb-aed1-465f-a61e-e9b94c6f91e1'::uuid;

INSERT INTO "auth"."permissions" ("id", "action", "subject")
SELECT gen_random_uuid(), actions.action, subjects.subject
FROM (
  VALUES ('manage'), ('read'), ('create'), ('update'), ('delete')
) AS actions(action)
CROSS JOIN (
  VALUES
    ('analytics-academic-load'),
    ('analytics-enrollment'),
    ('analytics-classrooms'),
    ('analytics-staff'),
    ('analytics-technology'),
    ('analytics-activities'),
    ('analytics-monitoring')
) AS subjects(subject)
ON CONFLICT ("action", "subject") DO NOTHING;

DELETE FROM "auth"."role_permissions" AS role_permissions
USING "auth"."permissions" AS permissions
WHERE role_permissions."permissionId" = permissions."id"
  AND permissions."subject" = 'analytics';

INSERT INTO "auth"."role_permissions" ("roleId", "permissionId")
SELECT assignments.role_id, permissions."id"
FROM (
  VALUES
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-academic-load'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-enrollment'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-classrooms'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-staff'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-technology'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-activities'),
    ('6705e39c-a5f1-46ab-97c0-d38eba358c73'::uuid, 'manage', 'analytics-monitoring'),
    ('ad710392-fcd0-4bf1-8259-fc6456509802'::uuid, 'manage', 'analytics-academic-load'),
    ('ad710392-fcd0-4bf1-8259-fc6456509802'::uuid, 'manage', 'analytics-staff'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-academic-load'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-enrollment'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-classrooms'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-staff'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-technology'),
    ('c93114ba-9d47-476e-b7ed-b40b8d4d90d7'::uuid, 'read', 'analytics-activities'),
    ('64583707-7d7e-4fdc-8446-a4536cb855f0'::uuid, 'read', 'analytics-academic-load'),
    ('64583707-7d7e-4fdc-8446-a4536cb855f0'::uuid, 'read', 'analytics-enrollment'),
    ('64583707-7d7e-4fdc-8446-a4536cb855f0'::uuid, 'read', 'analytics-classrooms'),
    ('64583707-7d7e-4fdc-8446-a4536cb855f0'::uuid, 'read', 'analytics-activities'),
    ('9b1e3c1a-2f6a-4b8d-9a3e-3a4c2f6e1a7d'::uuid, 'read', 'analytics-monitoring')
) AS assignments(role_id, action, subject)
JOIN "auth"."roles" AS roles ON roles."id" = assignments.role_id
JOIN "auth"."permissions" AS permissions
  ON permissions."action" = assignments.action
 AND permissions."subject" = assignments.subject
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
