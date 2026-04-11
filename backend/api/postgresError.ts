type PostgresError = Error & {
  code?: string;
  detail?: string;
  constraint?: string;
};

export function toHttpError(error: unknown): {
  status: number;
  body: { error: string; detail?: string };
} {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }

  const postgresError = error as PostgresError;

  switch (postgresError.code) {
    case '23505':
      return {
        status: 409,
        body: {
          error: 'Duplicate record',
          detail: postgresError.detail ?? postgresError.message,
        },
      };
    case '23503':
      return {
        status: 422,
        body: {
          error: 'Referenced record was not found',
          detail: postgresError.detail ?? postgresError.message,
        },
      };
    case '23514':
      return {
        status: 422,
        body: {
          error: 'Constraint validation failed',
          detail: postgresError.detail ?? postgresError.message,
        },
      };
    case '22P02':
      return {
        status: 400,
        body: {
          error: 'Invalid input syntax',
          detail: postgresError.detail ?? postgresError.message,
        },
      };
    case 'ECONNREFUSED':
      return {
        status: 503,
        body: {
          error: 'Database connection refused',
          detail: postgresError.message,
        },
      };
    default:
      return {
        status: 500,
        body: {
          error: 'Internal server error',
          detail: postgresError.message,
        },
      };
  }
}
