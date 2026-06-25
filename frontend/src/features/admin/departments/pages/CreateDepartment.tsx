import { Button, Error, Loading } from '@shared/components';
import { errorsFormik, setOptions } from '@shared/utils';
import { useFormik } from "formik";
import { useNavigate, Navigate } from "react-router-dom";
import { useGetAllFaculties } from '@api/faculties';
import { TFaculty } from '@api/faculties';
import { TCreateDepartment, initialValuesDepartment, departmentCreateSchema } from '../schemas';
import { useCreateDepartment } from '@api/departments';
import { useAbility } from '@config';

export const CreateDepartment = () => {
    const ability = useAbility();
    const canCreate = ability.can('create', 'departments');

    if (!canCreate) {
        return <Navigate to="/admin/departments" replace />;
    }

    const faculties = useGetAllFaculties();
    const isLoading = faculties.isLoading;

    const { mutateAsync: addDepartmentAsync } = useCreateDepartment();
    const navigate = useNavigate();

    const {
        values,
        setValues,
        handleChange,
        handleBlur,
        touched,
        errors,
        handleSubmit,
        resetForm,
    } = useFormik<TCreateDepartment>({
        initialValues: initialValuesDepartment,
        onSubmit: values => handleCreateDepartment(values),
        validate: values => {
            const result = departmentCreateSchema.safeParse(values);
            if (result.success) return;
            return errorsFormik<TCreateDepartment>(result);
        },
    });

    const handleCancel = () => {
        navigate(-1);
    };

    const handleCreateDepartment = async (values: TCreateDepartment) => {
        await addDepartmentAsync({
            ...values,
            uvs: values.uvs ?? null,
        });

        resetForm({ values: initialValuesDepartment });
        navigate(-1);
    };

    return (
        <>
            {isLoading && <Loading />}
            <div className="p-10 rounded shadow-md w-full max-w-4xl h-fit bg-white m-auto">
                <span className="text-2xl font-bold">
                    Nuevo Departamento
                </span>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-0 md:gap-x-10"
                    onSubmit={handleSubmit}
                >
                    {/* Nombre */}
                    <div className="mt-6">
                        <label className="block mb-2 font-bold" htmlFor="name">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            placeholder="Ingrese el nombre del departamento"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.name}
                        />
                        {touched.name && errors.name && (
                            <Error error={errors.name} />
                        )}
                    </div>

                    {/* Unidades Valorativas */}
                    <div className="mt-6">
                        <label className="block mb-2 font-bold" htmlFor="uvs">
                            Unidades Valorativas
                        </label>
                        <input
                            type="number"
                            id="uvs"
                            name="uvs"
                            min={0}
                            className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            placeholder="Ingrese las UVs (opcional)"
                            onChange={e => {
                                const raw = e.target.value;
                                setValues({
                                    ...values,
                                    uvs: raw === '' ? null : parseInt(raw, 10),
                                });
                            }}
                            onBlur={handleBlur}
                            value={values.uvs ?? ''}
                        />
                        {touched.uvs && errors.uvs && (
                            <Error error={errors.uvs as string} />
                        )}
                    </div>

                    {/* Facultad */}
                    <div className="mt-6">
                        <label className="block mb-2 font-bold" htmlFor="faculty">
                            Facultad
                        </label>
                        <select
                            id="faculty"
                            name="facultyId"
                            className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            onChange={e => {
                                const facultyId = e.target.options[e.target.selectedIndex].id;
                                setValues({ ...values, facultyId });
                            }}
                            onBlur={handleBlur}
                            defaultValue={'select'}
                        >
                            <option value="select" disabled>
                                Seleccione
                            </option>
                            {faculties.data &&
                                setOptions<TFaculty>(
                                    (faculties.data && faculties.data) ?? []
                                )}
                        </select>
                        {touched.facultyId && errors.facultyId && (
                            <Error error={errors.facultyId} />
                        )}
                    </div>

                    {/* Botones */}
                    <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4 mt-6 flex-col sm:flex-row">
                        <Button
                            type="submit"
                            className="bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-500"
                        >
                            Guardar Cambios
                        </Button>
                        <Button
                            onClick={handleCancel}
                            type="button"
                            className="bg-[#DC3545] text-white p-2 hover:bg-red-300 transition duration-500"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};
