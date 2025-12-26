import { z } from 'zod';
import { Day } from '@/types';

// =====================================================
// UNIVERSITY & CAMPUS SCHEMAS
// =====================================================

export const UniversitySchema = z.object({
  name: z.string().min(1, 'University name is required'),
  shortName: z.string().min(1, 'University short name is required'),
  campus: z.string().min(1, 'Campus name is required'),
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

export const CampusSelectionSchema = z.object({
  university: z.string().min(1, 'Please select a university'),
  campus: z.string().min(1, 'Please select a campus'),
});

// =====================================================
// SCHEDULE SCHEMAS
// =====================================================

export const DayEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const ParsedClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),
  days: z.array(DayEnum).optional(),
  location: z.string().optional(),
});

export const ScheduleFileSchema = z.object({
  base64: z.string().min(1, 'File content is required'),
  mimeType: z.string().regex(
    /^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf|text\/(plain|calendar))$/,
    'File must be an image, PDF, or text file'
  ),
  name: z.string().min(1, 'File name is required'),
});

export const ScheduleArraySchema = z.array(ParsedClassSchema).min(1, 'At least one class is required');

// =====================================================
// USER PROFILE SCHEMAS
// =====================================================

export const UserProfileSchema = z.object({
  university: z.string().optional(),
  campus: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const UserProfileUpdateSchema = z.object({
  university: z.string().min(1, 'University is required'),
  campus: z.string().min(1, 'Campus is required'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

// =====================================================
// ANALYSIS SCHEMAS
// =====================================================

export const AnalysisDaySchema = z.enum([
  'today',
  'tomorrow',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const WeatherRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const AnalysisRequestSchema = z.object({
  selectedDay: AnalysisDaySchema,
  university: UniversitySchema,
  scheduleFile: ScheduleFileSchema.optional(),
  savedClasses: ScheduleArraySchema.optional(),
  usesSavedSchedule: z.boolean(),
}).refine(
  (data) => data.scheduleFile || (data.usesSavedSchedule && data.savedClasses),
  {
    message: 'Either a schedule file or saved classes must be provided',
    path: ['scheduleFile'],
  }
);

// =====================================================
// ADMIN SCHEMAS
// =====================================================

export const SystemNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  type: z.enum(['info', 'warning', 'critical', 'maintenance']),
  expires_at: z.string().datetime().optional().nullable(),
});

export const AIConfigUpdateSchema = z.object({
  key: z.string().min(1, 'Config key is required'),
  value: z.union([z.string(), z.number(), z.boolean()]),
  description: z.string().optional(),
});

export const AIPromptUpdateSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  prompt_text: z.string().min(10, 'Prompt must be at least 10 characters'),
  model_override: z.string().optional(),
  is_active: z.boolean().optional(),
});

// =====================================================
// TYPE EXPORTS (for TypeScript inference)
// =====================================================

export type University = z.infer<typeof UniversitySchema>;
export type CampusSelection = z.infer<typeof CampusSelectionSchema>;
export type ParsedClass = z.infer<typeof ParsedClassSchema>;
export type ScheduleFile = z.infer<typeof ScheduleFileSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type SystemNotice = z.infer<typeof SystemNoticeSchema>;
export type AIConfigUpdate = z.infer<typeof AIConfigUpdateSchema>;
export type AIPromptUpdate = z.infer<typeof AIPromptUpdateSchema>;
