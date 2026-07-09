SELECT
  id,
  fn_upper_unaccent(name) AS "normalizedName"
FROM
  infraestructure.classrooms;