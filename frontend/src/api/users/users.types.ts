import { userCreateSchema, userUpdateSchema } from "@features/admin/users/schemas";
import z from "zod";

export type TCreateUser = z.infer<typeof userCreateSchema>;

export type TUpdateUser = z.infer<typeof userUpdateSchema>;
