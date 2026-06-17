import { Button } from '@components/ui/button';
import { Error, Loading } from '@components';
import { TOutputDepartment } from '@features/centers';
import { TAcademicCommonProps } from '@features/teachers';
import Select, { SingleValue, StylesConfig, GroupBase } from 'react-select';
import { useFormik } from 'formik';
import { TUpdateDepartment, departmentUpdateSchema } from '../schemas';
import { errorsFormik } from '@utils';
import { PencilIcon, Save, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGetAllFaculties } from '@features/shared/academic';
import { useDeleteDepartmentMutation, useUpdateDepartment } from '../hooks';
import { askDel } from '@features/teachers/utils/activities/delete-action';

type TFacultyOption = { label: string; value: string };

const customStyles: StylesConfig<TFacultyOption, false, GroupBase<TFacultyOption>> = {
  control: base => ({
    ...base,
    borderRadius: '6px',
    borderColor: '#99a1af',
    cursor: 'pointer',
    padding: '2px',
  }),
  option: base => ({
    ...base,
    cursor: 'pointer',
  }),
};

interface IProps {
  incomingData: TOutputDepartment;
  isModal?: boolean;
}

export const DepartmentView = ({ incomingData, isModal }: IProps) => {
  const faculties = useGetAllFaculties();

  const { updateDepartment, isPendingUpdate } = useUpdateDepartment(incomingData.id);
  const { deleteDepartment, isPendingDelete } = useDeleteDepartmentMutation(incomingData.id);

  const [isEdit, setIsEdit] = useState(false);

  const initialValues = useMemo<TUpdateDepartment>(
    () => ({
      name: incomingData.name,
      uvs: incomingData.uvs,
      facultyId: incomingData.facultyId,
    }),
    [incomingData],
  );

  const formik = useFormik<TUpdateDepartment>({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: values => onSubmitting(values),
    validate: values => {
      const result = departmentUpdateSchema.safeParse(values);
      if (result.success) return;
      return errorsFormik<TUpdateDepartment>(result);
    },
  });

  const handleEdit = () => setIsEdit(prev => !prev);

  const onSubmitting = async (values: TUpdateDepartment) => {
    await updateDepartment({ id: incomingData.id, body: values });
    handleEdit();
  };

  const handleDelete = async () =>
    askDel(
      incomingData.id,
      `eliminar el departamento <${incomingData.name}>`,
      deleteDepartment,
    );

  // Opción actualmente seleccionada en el selector de facultad
  const selectedFaculty = useMemo<TFacultyOption | undefined>(() => {
    if (!faculties.data || !formik.values.facultyId) return undefined;
    const match = (faculties.data as TAcademicCommonProps[]).find(
      f => f.id === formik.values.facultyId,
    );
    return match ? { label: match.name, value: match.id } : undefined;
  }, [faculties.data, formik.values.facultyId]);

  const facultyOptions = useMemo<TFacultyOption[]>(
    () =>
      faculties.data
        ? (faculties.data as TAcademicCommonProps[]).map(f => ({
          label: f.name,
          value: f.id,
        }))
        : [],
    [faculties.data],
  );

  if (faculties.isLoading || isPendingUpdate || isPendingDelete) return <Loading />;

  return (
    <div className={`${!isModal ? 'min-h-screen ' : ''}px-4 py-4`}>
      {/* Cabecera sticky con título y botones de acción */}
      <div className={`sticky z-20 mb-5 ${isModal ? 'bg-white' : 'bg-gray-50 top-[57px]'}`}>
        <div className="flex flex-col justify-start items-center py-5 md:flex-row md:justify-between md:items-center md:py-0 w-full">
          <h1 className="text-2xl font-semibold">
            {isEdit ? 'Editando departamento' : 'Detalle del departamento'}
          </h1>

          <div className="mt-2 lg:mt-0 flex flex-wrap gap-2 items-center">
            {/* Eliminar — solo visible cuando NO se está editando */}
            <Button
              type="button"
              className="w-fit bg-[#DC3545] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 hover:bg-red-400 transition duration-500 cursor-pointer"
              hidden={isEdit}
              onClick={handleDelete}
              variant="unstyled"
            >
              <Trash2 className="size-5" />
              Eliminar
            </Button>

            {/* Editar — solo visible cuando NO se está editando */}
            <Button
              type="button"
              className="w-fit bg-[#144C74] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 hover:bg-blue-300 transition duration-500 cursor-pointer"
              hidden={isEdit}
              onClick={handleEdit}
              variant="unstyled"
            >
              <PencilIcon className="size-5" />
              Editar
            </Button>

            {/* Guardar — solo visible al editar */}
            <Button
              type="button"
              className="w-fit bg-[#5BC85C] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 hover:bg-green-300 transition duration-500 cursor-pointer"
              hidden={!isEdit}
              onClick={() => formik.handleSubmit()}
              variant="unstyled"
            >
              <Save className="size-5" />
              Guardar
            </Button>

            {/* Cancelar edición — solo visible al editar */}
            <Button
              type="button"
              className="w-fit bg-[#DC3545] flex flex-row mx-auto items-center rounded-md text-white p-2 gap-2 hover:bg-red-400 transition duration-500 cursor-pointer"
              hidden={!isEdit}
              onClick={() => {
                handleEdit();
                formik.resetForm({ values: initialValues });
              }}
              variant="unstyled"
            >
              <XCircle className="size-5" />
              Cancelar
            </Button>
          </div>
        </div>
        <hr className="h-px my-2 bg-gray-200 border-0" />
      </div>

      {/* Campos del formulario */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4${isModal ? ' h-[50vh] overflow-auto' : ''}`}
      >
        {/* Nombre */}
        <div>
          <label className="block mb-2 font-bold" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full mb-2 border rounded-md p-2 border-gray-400 read-only:bg-gray-100"
            readOnly={!isEdit}
            value={formik.values.name ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Nombre del departamento"
          />
          {formik.touched.name && formik.errors.name && (
            <Error error={formik.errors.name} />
          )}
        </div>

        {/* Unidades Valorativas */}
        <div>
          <label className="block mb-2 font-bold" htmlFor="uvs">
            Unidades Valorativas
          </label>
          <input
            id="uvs"
            name="uvs"
            type="number"
            min={0}
            className="w-full mb-2 border rounded-md p-2 border-gray-400 read-only:bg-gray-100"
            readOnly={!isEdit}
            value={formik.values.uvs ?? ''}
            onChange={e => {
              const raw = e.target.value;
              formik.setFieldValue('uvs', raw === '' ? null : parseInt(raw, 10));
            }}
            onBlur={formik.handleBlur}
            placeholder="Ej: 30 (opcional)"
          />
          {formik.touched.uvs && formik.errors.uvs && (
            <Error error={formik.errors.uvs as string} />
          )}
        </div>

        {/* Facultad */}
        <div>
          <label className="block mb-2 font-bold" htmlFor="facultyId">
            Facultad
          </label>
          {isEdit ? (
            <>
              <Select<TFacultyOption>
                inputId="facultyId"
                name="facultyId"
                menuPlacement='top'
                menuPortalTarget={document.body}
                styles={{
                  ...customStyles,
                  menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
                options={facultyOptions}
                value={selectedFaculty}
                placeholder="Seleccione una facultad..."
                isSearchable
                isDisabled={!isEdit}
                onChange={(newValue: SingleValue<TFacultyOption>) => {
                  formik.setFieldValue('facultyId', newValue?.value ?? '');
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.facultyId && formik.errors.facultyId && (
                <Error error={formik.errors.facultyId} />
              )}
            </>
          ) : (
            <input
              type="text"
              className="w-full mb-2 border rounded-md p-2 border-gray-400 bg-gray-100"
              readOnly
              value={incomingData.facultyName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

