import type { AuthActor, HttpRequest, HttpResponse, UserRole } from './types.ts';
import { verifySessionToken } from '../services/sessionToken.ts';
import { verifyOidcAccessToken, type OidcAuthConfig } from '../services/oidcToken.ts';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export function authenticateBearerRequest(
  request: HttpRequest,
  options: { apiToken?: string; sessionSecret?: string; oidc?: OidcAuthConfig }
): { ok: true; request: HttpRequest } | { ok: false; response: HttpResponse } {
  if (!options.apiToken && !options.sessionSecret && !options.oidc) {
    return { ok: true, request };
  }

  const authorization = request.headers?.authorization?.trim();

  if (!authorization) {
    return {
      ok: false,
      response: {
        status: 401,
        headers: JSON_HEADERS,
        body: { error: 'Authorization header is required' },
      },
    };
  }

  const bearerToken = readBearerToken(authorization);
  if (!bearerToken) {
    return unauthorized('Invalid authorization scheme');
  }

  if (options.apiToken && bearerToken === options.apiToken) {
    return { ok: true, request };
  }

  if (options.sessionSecret) {
    const session = verifySessionToken(bearerToken, options.sessionSecret);
    if (session.ok) {
      return {
        ok: true,
        request: withResolvedActor(request, { userId: session.payload.userId }),
      };
    }
    if (!options.oidc) {
      return unauthorized(session.error);
    }
  }

  if (options.oidc) {
    const oidc = verifyOidcAccessToken(bearerToken, options.oidc);
    if (oidc.ok) {
      return {
        ok: true,
        request: withResolvedActor(request, { oidcSubject: oidc.subject }),
      };
    }
    return unauthorized(oidc.error);
  }

  return unauthorized('Invalid bearer token');
}

const permissions: Record<string, UserRole[]> = {
  patient_read: ['doctor', 'nurse', 'admin'],
  patient_write: ['doctor', 'nurse', 'admin'],
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
  flag_read: ['doctor', 'nurse', 'admin'],
  flag_write: ['doctor', 'nurse', 'admin'],
  encounter_create: ['doctor', 'nurse', 'admin'],
  encounter_update: ['doctor', 'admin'],
  user_read: ['admin'],
  user_write: ['admin'],
  practitioner_read: ['doctor', 'nurse', 'admin'],
  practitioner_write: ['admin'],
  drug_catalog_read: ['doctor', 'nurse', 'admin'],
  drug_catalog_write: ['admin'],
  drug_interaction_rule_read: ['doctor', 'nurse', 'admin'],
  drug_interaction_rule_write: ['admin'],
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
    oidcSubject: request.headers?.['x-oidc-subject']?.trim() || null,
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
      'x-oidc-subject': actor.oidcSubject ?? request.headers?.['x-oidc-subject'],
    },
  };
}

function readBearerToken(authorization: string) {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function unauthorized(error: string): { ok: false; response: HttpResponse } {
  return {
    ok: false,
    response: {
      status: 401,
      headers: JSON_HEADERS,
      body: { error },
    },
  };
}
