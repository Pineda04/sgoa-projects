import z from "zod";

export const courseStadisticSchema = z.object({
	APB: z
		.number({ error: 'APB ser un número.' })
		.min(0, { error: 'El mínimo de APB es 0.' }),
	RPB: z
		.number({ error: 'RPB ser un número.' })
		.min(0, { error: 'El mínimo de RPB es 0.' }),
	NSP: z
		.number({ error: 'NSP ser un número.' })
		.min(0, { error: 'El mínimo de NSP es 0.' }),
	ABD: z
		.number({ error: 'ABD ser un número.' })
		.min(0, { error: 'El mínimo de ABD es 0.' }),
});
