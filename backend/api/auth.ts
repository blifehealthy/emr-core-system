import type { AuthActor, HttpRequest, HttpResponse, UserRole } from './types.ts';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export function requireBearerAuth(
  request: HttpRequest,
  expectedToken?: string
): HttpResponse | null {
  if (!expectedToken) {
    return null;
  }

  const authorization = request.headers?.authorization?.trim();

  if (!authorization) {
    return {
      status: 401,
      headers: JSON_HEADERS,
      body: { error: 'Authorization header is required' },
    };
  }

  if (authorization !== `Bearer ${expectedToken}`) {
    return {
      status: 401,
      headers: JSON_HEADERS,
      body: { error: 'Invalid bearer token' },
    };
  }

  return null;
}

const permissions: Record<string, UserRole[]> = {
  patient_read: ['doctor', 'nurse', 'admin'],
  audit_read: ['doctor', 'nurse', 'admin'],
  appointment_read: ['doctor', 'nurse', 'admin'],
  appointment_write: ['doctor', 'nurse', 'admin'],
  consent_read: ['doctor', 'nurse', 'admin'],
  consent_write: ['doctor', 'nurse', 'admin'],
  attachment_read: ['doctor', 'nurse', 'admin'],
  attachment_write: ['doctor', 'nurse', 'admin'],
  allergy_read: ['doctor', 'nurse', 'admin'],
  allergy_write: ['doctor', 'nurse', 'admin'],
  condition_read: ['doctor', 'nurse', 'admin'],
  condition_write: ['doctor', 'nurse', 'admin'],
  medication_read: ['doctor', 'nurse', 'admin'],
  medication_write: ['doctor', 'nurse', 'admin'],
  encounter_create: ['doctor', 'nurse', 'admin'],
  user_read: ['admin'],
  user_write: ['admin'],
  practitioner_read: ['doctor', 'nurse', 'admin'],
  practitioner_write: ['admin'],
  prescription_read: ['doctor', 'nurse', 'admin'],
  prescription_write: ['doctor', 'admin'],
  soap_update: ['doctor', 'admin'],
  diagnosis_update: ['doctor', 'admin'],
  vital_sign_update: ['doctor', 'nurse', 'admin'],
  clinical_note_finalize: ['doctor', 'admin'],
  clinical_note_sign: ['doctor', 'admin'],
};

export function requireRole(
  request: HttpRequest,
  permission: keyof typeof permissions
): HttpResponse | null {
  const role = request.headers?.['x-user-role'];

  if (!role) {
    return {
      status: 403,
      headers: JSON_HEADERS,
      body: { error: 'x-user-role header is required' },
    };
  }

  if (!permissions[permission].includes(role as UserRole)) {
    return {
      status: 403,
      headers: JSON_HEADERS,
      body: { error: `Role ${role} is not allowed for ${permission}` },
    };
  }

  return null;
}

export function getActorContext(request: HttpRequest) {
  return {
    userId: request.headers?.['x-user-id']?.trim() || null,
    practitionerId: request.headers?.['x-practitioner-id']?.trim() || null,
    role: request.headers?.['x-user-role']?.trim() || undefined,
  };
}

export function withResolvedActor(request: HttpRequest, actor: AuthActor): HttpRequest {
  return {
    ...request,
    headers: {
      ...request.headers,
      'x-user-id': actor.userId ?? request.headers?.['x-user-id'],
      'x-practitioner-id':
        actor.practitionerId ?? request.headers?.['x-practitioner-id'],
      'x-user-role': actor.role ?? request.headers?.['x-user-role'],
    },
  };
}
