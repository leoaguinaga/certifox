import "server-only";

export class AuthorizationError extends Error {
  public readonly statusCode: number;

  constructor(message = "No autorizado para realizar esta acción", statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export type UserRole = "STUDENT" | "INSTRUCTOR";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

export interface SessionContext {
  user: SessionUser;
}

/**
 * Valida que exista una sesión activa.
 */
export function requireAuth(session: SessionContext | null | undefined): SessionUser {
  if (!session || !session.user) {
    throw new AuthorizationError("Debes iniciar sesión para continuar", 401);
  }
  return session.user;
}

/**
 * Valida que el usuario tenga un rol específico.
 */
export function requireRole(session: SessionContext | null | undefined, requiredRole: UserRole): SessionUser {
  const user = requireAuth(session);
  if (user.role !== requiredRole) {
    throw new AuthorizationError(`Acceso denegado: se requiere el rol ${requiredRole}`, 403);
  }
  return user;
}

/**
 * Valida que el usuario autenticado sea el dueño de la matrícula especificada.
 */
export function assertOwnsEnrollment(session: SessionContext | null | undefined, enrollmentUserId: string): SessionUser {
  const user = requireAuth(session);
  if (user.id !== enrollmentUserId) {
    throw new AuthorizationError("No tienes permiso para acceder a esta matrícula", 403);
  }
  return user;
}

/**
 * Valida que el usuario autenticado sea el instructor dueño del curso.
 */
export function assertCanManageCourse(session: SessionContext | null | undefined, instructorId: string): SessionUser {
  const user = requireRole(session, "INSTRUCTOR");
  if (user.id !== instructorId) {
    throw new AuthorizationError("Solo el instructor asignado a este curso puede gestionarlo", 403);
  }
  return user;
}

/**
 * Valida si un usuario puede calificar una entrega (debe ser el instructor dueño).
 */
export function assertCanGradeSubmission(session: SessionContext | null | undefined, courseInstructorId: string): SessionUser {
  return assertCanManageCourse(session, courseInstructorId);
}

/**
 * Valida si el estudiante puede entregar una tarea en una matrícula activa.
 */
export function assertCanSubmitAssessment(
  session: SessionContext | null | undefined,
  enrollment: { userId: string; status: string }
): SessionUser {
  const user = assertOwnsEnrollment(session, enrollment.userId);
  if (enrollment.status !== "ACTIVE") {
    throw new AuthorizationError("Solo se pueden entregar tareas en cursos con matrícula activa", 403);
  }
  return user;
}

/**
 * Valida la visualización de un certificado en el campus privado:
 * Un estudiante solo puede ver el suyo; un instructor puede ver los emitidos en sus cursos.
 */
export function assertCanViewCampusCertificate(
  session: SessionContext | null | undefined,
  cert: { enrollment: { userId: string; course: { instructorId: string } } }
): SessionUser {
  const user = requireAuth(session);
  if (user.role === "STUDENT" && cert.enrollment.userId !== user.id) {
    throw new AuthorizationError("No tienes permiso para ver este certificado", 403);
  }
  if (user.role === "INSTRUCTOR" && cert.enrollment.course.instructorId !== user.id) {
    throw new AuthorizationError("No tienes permiso para gestionar un certificado de otro instructor", 403);
  }
  return user;
}
