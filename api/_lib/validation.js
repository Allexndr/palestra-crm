import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1).max(254),
  password: z.string().min(6).max(128),
  role: z.enum(['admin', 'coach', 'parent', 'student']).optional(),
});

export const registerClubSchema = z.object({
  formData: z.object({
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(8).max(32),
    email: z.string().email().max(254),
    clubName: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(80),
    address: z.string().trim().min(3).max(180),
    martialArts: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
    studentsCount: z.coerce.number().int().min(1).max(100000),
  }),
  password: z.string().min(12).max(128),
  tariff: z
    .object({
      selectedFeatures: z.array(z.string().max(40)).max(20).optional(),
      totalPrice: z.coerce.number().min(0).max(10_000_000).optional(),
      basePrice: z.coerce.number().min(0).max(10_000_000).optional(),
    })
    .nullable()
    .optional(),
});

export const appStateSchema = z.object({
  state: z.record(z.string(), z.unknown()),
});

export const deleteBlobSchema = z.object({
  url: z.string().max(2048).refine((value) => {
    if (value.startsWith('/api/blob/read?')) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'Expected a Blob URL or authenticated Blob read URL'),
});

export function parseOrThrow(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;

  const error = new Error('Invalid request data');
  error.statusCode = 400;
  
  // Provide deep field errors with dot notation paths (e.g. "formData.email")
  const fieldErrors = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  error.details = { fieldErrors };
  throw error;
}
