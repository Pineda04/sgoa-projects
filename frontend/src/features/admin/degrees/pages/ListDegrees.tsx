import { useGetAllUndergrads, useGetAllPostgrads } from '@api/degrees';
import { useAbility } from '@config';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/components/ui';
import { DegreeTable } from '../components';

export const ListDegrees = () => {
    const ability = useAbility();
    const canCreate = ability.can('create', 'degrees');
    const canUpdate = ability.can('update', 'degrees');
    const canDelete = ability.can('delete', 'degrees');

    const undergrads = useGetAllUndergrads();
    const postgrads = useGetAllPostgrads();

    return (
        <div className="pb-8 sm:pb-12">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    Gestión de Títulos
                </h1>
                <p className="text-muted-foreground mt-1">
                    Administración de títulos de pregrado y posgrado.
                </p>
            </div>

            <Tabs defaultValue="undergrad">
                <TabsList variant="pills" className="mb-4 sm:mb-6">
                    <TabsTrigger value="undergrad">Pregrados</TabsTrigger>
                    <TabsTrigger value="postgrad">Posgrados</TabsTrigger>
                </TabsList>

                <TabsContent value="undergrad">
                    {undergrads.isError ? (
                        <p className="text-sm text-red-500">
                            Error al cargar los pregrados. Intenta nuevamente.
                        </p>
                    ) : (
                        <DegreeTable
                            degreeType="undergrad"
                            data={undergrads.data ?? []}
                            isLoading={undergrads.isLoading}
                            canCreate={canCreate}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    )}
                </TabsContent>

                <TabsContent value="postgrad">
                    {postgrads.isError ? (
                        <p className="text-sm text-red-500">
                            Error al cargar los posgrados. Intenta nuevamente.
                        </p>
                    ) : (
                        <DegreeTable
                            degreeType="postgrad"
                            data={postgrads.data ?? []}
                            isLoading={postgrads.isLoading}
                            canCreate={canCreate}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
