import { z } from 'zod';

export const ArtifactTypeEnum = z.enum([
  'GITHUB_URL',
  'PDF_LINK',
  'TEXT',
  'VIDEO_URL',
  'FIGMA_URL',
]);

export const createArtifactSchema = z.object({
  type: ArtifactTypeEnum,
  url: z.string().optional().default(''),
  description: z.string().optional().default(''),
  skillNames: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one skill is required'),
});

export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;

export const generateOutreachSchema = z.object({
  problemId: z.string().min(1, 'problemId is required'),
  tone: z.enum(['formal', 'casual', 'enthusiastic']),
});

export type GenerateOutreachInput = z.infer<typeof generateOutreachSchema>;

