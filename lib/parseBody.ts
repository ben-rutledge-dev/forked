import { NextResponse } from 'next/server';
import { z } from 'zod';

type ParseBodyResult<T>
  = | { success: true, data: T }
    | { success: false, response: NextResponse };

export const parseBody = async <T>(req: Request, schema: z.ZodType<T>): Promise<ParseBodyResult<T>> => {
  let json: unknown;
  try {
    json = await req.json();
  }
  catch {
    return { success: false, response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Validation failed', fieldErrors: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
};
