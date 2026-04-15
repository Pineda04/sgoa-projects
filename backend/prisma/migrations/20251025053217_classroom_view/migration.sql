-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION public.fn_upper_unaccent(text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN upper(unaccent($1));
END;
$$;

CREATE OR REPLACE VIEW infraestructure.vw_classroom_info AS
  SELECT
    id,
    fn_upper_unaccent(name) as "normalizedName"
  FROM
    infraestructure.classrooms;
