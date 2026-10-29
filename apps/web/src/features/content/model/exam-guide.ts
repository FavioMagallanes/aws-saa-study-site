import { z } from 'zod';
import { bulletIdSchema } from '@arquitecto/contracts/content';

const guideBulletSchema = z.object({ id: bulletIdSchema, text: z.string().min(1) });

export const examGuideSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().regex(/^[1-4]\.\d+$/),
      title: z.string().min(1),
      knowledge: z.array(guideBulletSchema),
      skills: z.array(guideBulletSchema),
    }),
  ),
  services: z.array(z.object({ category: z.string().min(1), name: z.string().min(1) })),
});

export type ExamGuide = z.infer<typeof examGuideSchema>;
