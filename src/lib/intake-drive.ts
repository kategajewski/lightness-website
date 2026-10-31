import "server-only";
import { randomBytes } from "node:crypto";
import type { SignedIntake } from "@/lib/intake-storage";

const api = "https://www.googleapis.com/drive/v3/files";
const uploadApi = "https://www.googleapis.com/upload/drive/v3/files";
const folderMime = "application/vnd.google-apps.folder";
const archiveMarker = "client-intakes-v1";
const fields = "id,mimeType,parents,appProperties,trashed,shared,ownedByMe,driveId";

export type IntakeDriveErrorCode =
  | "invalid_input" | "network" | "authorization" | "permission"
  | "quota" | "rate_limit" | "remote_error" | "malformed_response"
  | "conflict" | "unsafe_destination";

/** Provider bodies, tokens and client answers must never become error messages. */
export class IntakeDriveError extends Error {
  readonly code: IntakeDriveErrorCode;
  readonly status?: number;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;

  constructor(code: IntakeDriveErrorCode, options: {
    status?: number; retryable?: boolean; retryAfterSeconds?: number;
  } = {}) {
    super(`The private Drive archive operation failed (${code}).`);
    this.name = "IntakeDriveError";
    this.code = code;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

type DriveMetadata = {
  id: string;
  mimeType: string;
  parents?: string[];
  appProperties?: Record<string, string>;
  trashed: boolean;
  shared: boolean;
  ownedByMe: boolean;
  driveId?: string;
};

type DriveResult = { id: string; created: boolean };
export type EnsureDriveFolderInput = {
  accessToken: string;
  /** Must be allocated and durably saved by the caller before this operation. */
  folderId: string;
  name: string;
  /** Omit only when creating the private top-level archive folder. */
  parentId?: string;
  /** An opaque stable client key, required for a client folder. No raw email/phone. */
  clientKey?: string;
};

export type ArchiveIntakeToDriveInput = {
  record: Pick<SignedIntake, "id" | "submittedAt" | "recordDigest">;
  pdf: Uint8Array;
  accessToken: string;
  archiveFolderId: string;
  clientFolderId: string;
  clientKey: string;
  /** A pre-generated Drive ID persisted for this signed intake before upload. */
  fileId: string;
};

function validId(id: string) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{10,200}$/.test(id);
}

function requireId(id: string) {
  if (!validId(id)) throw new IntakeDriveError("invalid_input");
}

function requireClientKey(key: string | undefined): asserts key is string {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(key)) {
    throw new IntakeDriveError("invalid_input");
  }
}

function cleanFolderName(name: string) {
  if (typeof name !== "string") throw new IntakeDriveError("invalid_input");
  const cleaned = name.normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > 160) throw new IntakeDriveError("invalid_input");
  return cleaned;
}

function folderProperties(parentId?: string, clientKey?: string) {
  return {
    lightnessArchive: archiveMarker,
    lightnessKind: parentId ? "client" : "root",
    ...(clientKey ? { lightnessClientKey: clientKey } : {}),
  };
}

async function request(url: string, accessToken: string, init: RequestInit = {}) {
  if (typeof accessToken !== "string" || !accessToken.trim() || /[\r\n]/.test(accessToken)) {
    throw new IntakeDriveError("invalid_input");
  }
  try {
    return await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new IntakeDriveError("network", { retryable: true });
  }
}

async function body(response: Response): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await response.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new IntakeDriveError("malformed_response", { status: response.status, retryable: true });
  }
}

async function failure(response: Response): Promise<never> {
  let reasons: unknown[] = [];
  try {
    const value = await response.json() as { error?: { errors?: { reason?: unknown }[] } };
    if (Array.isArray(value?.error?.errors)) reasons = value.error.errors.map(item => item?.reason);
  } catch { /* Provider details are deliberately discarded. */ }
  const rateLimited = response.status === 429 || reasons.some(reason => reason === "rateLimitExceeded" || reason === "userRateLimitExceeded");
  const quota = reasons.includes("storageQuotaExceeded") || reasons.includes("activeItemCreationLimitExceeded");
  const retryAfter = response.headers.get("retry-after");
  const seconds = retryAfter && /^\d+$/.test(retryAfter) ? Math.min(Number(retryAfter), 86_400) : undefined;
  const code: IntakeDriveErrorCode = response.status === 401 ? "authorization"
    : rateLimited ? "rate_limit" : quota ? "quota"
      : response.status === 403 || response.status === 404 ? "permission"
        : response.status === 409 ? "conflict" : "remote_error";
  throw new IntakeDriveError(code, {
    status: response.status,
    retryable: rateLimited || response.status >= 500,
    retryAfterSeconds: seconds,
  });
}

function verifyMetadata(value: Record<string, unknown>, expected: {
  id: string; mimeType: string; parentId?: string; properties: Record<string, string>;
}): DriveMetadata {
  if (value.id !== expected.id || value.mimeType !== expected.mimeType
    || value.trashed !== false || value.shared !== false || value.ownedByMe !== true
    || (value.driveId !== undefined && value.driveId !== "")) {
    throw new IntakeDriveError("unsafe_destination");
  }
  if (expected.parentId && (!Array.isArray(value.parents) || value.parents.length !== 1 || value.parents[0] !== expected.parentId)) {
    throw new IntakeDriveError("unsafe_destination");
  }
  if (!value.appProperties || typeof value.appProperties !== "object" || Array.isArray(value.appProperties)) {
    throw new IntakeDriveError("conflict");
  }
  const properties = value.appProperties as Record<string, unknown>;
  if (Object.entries(expected.properties).some(([key, expectedValue]) => properties[key] !== expectedValue)) {
    throw new IntakeDriveError("conflict");
  }
  return value as DriveMetadata;
}

async function readMetadata(id: string, accessToken: string) {
  const response = await request(`${api}/${encodeURIComponent(id)}?${new URLSearchParams({ fields })}`, accessToken);
  if (!response.ok) return failure(response);
  return body(response);
}

async function privateFolder(id: string, accessToken: string, parentId?: string, clientKey?: string) {
  return verifyMetadata(await readMetadata(id, accessToken), {
    id, mimeType: folderMime, parentId, properties: folderProperties(parentId, clientKey),
  });
}

/** Allocation has no Drive file side effect. Persist the returned ID before create. */
export async function generateDriveId(accessToken: string): Promise<string> {
  const response = await request(`${api}/generateIds?${new URLSearchParams({ count: "1", space: "drive", type: "files" })}`, accessToken);
  if (!response.ok) return failure(response);
  const value = await body(response);
  if (!Array.isArray(value.ids) || value.ids.length !== 1 || !validId(value.ids[0])) {
    throw new IntakeDriveError("malformed_response", { retryable: true });
  }
  return value.ids[0] as string;
}

/** Reusing a persisted ID is safe after a timeout. Existing folders are never renamed. */
export async function ensureDriveFolder(input: EnsureDriveFolderInput): Promise<DriveResult> {
  const { accessToken, folderId, parentId, clientKey } = input;
  requireId(folderId);
  const name = cleanFolderName(input.name);
  if (parentId) {
    requireId(parentId);
    requireClientKey(clientKey);
    if (parentId === folderId) throw new IntakeDriveError("invalid_input");
    await privateFolder(parentId, accessToken);
  } else if (clientKey !== undefined) throw new IntakeDriveError("invalid_input");
  const properties = folderProperties(parentId, clientKey);
  const response = await request(`${api}?${new URLSearchParams({ fields })}`, accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: folderId, name, mimeType: folderMime, ...(parentId ? { parents: [parentId] } : {}), appProperties: properties }),
  });
  const existing = response.status === 409;
  if (!response.ok && !existing) return failure(response);
  verifyMetadata(existing ? await readMetadata(folderId, accessToken) : await body(response), {
    id: folderId, mimeType: folderMime, parentId, properties,
  });
  return { id: folderId, created: !existing };
}

/** Upload a frozen signed-record copy. Never changes permissions or overwrites a PDF. */
export async function archiveIntakeToDrive(input: ArchiveIntakeToDriveInput): Promise<DriveResult> {
  const { record, accessToken, archiveFolderId, clientFolderId, clientKey, fileId } = input;
  [archiveFolderId, clientFolderId, fileId].forEach(requireId);
  requireClientKey(clientKey);
  if (new Set([archiveFolderId, clientFolderId, fileId]).size !== 3
    || !record || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(record.id)
    || !/^[a-f0-9]{64}$/.test(record.recordDigest)
    || typeof record.submittedAt !== "string" || !Number.isFinite(Date.parse(record.submittedAt))
    || !(input.pdf instanceof Uint8Array) || input.pdf.byteLength > 5_000_000
    || Buffer.from(input.pdf.subarray(0, 5)).toString("ascii") !== "%PDF-") {
    throw new IntakeDriveError("invalid_input");
  }
  await Promise.all([
    privateFolder(archiveFolderId, accessToken),
    privateFolder(clientFolderId, accessToken, archiveFolderId, clientKey),
  ]);
  const properties = {
    lightnessArchive: archiveMarker,
    lightnessKind: "signed-intake",
    lightnessClientKey: clientKey,
    lightnessIntakeId: record.id,
    lightnessRecordDigest: record.recordDigest,
  };
  const metadata = {
    id: fileId,
    name: `Signed intake ${record.submittedAt.slice(0, 10)} ${record.id}.pdf`,
    mimeType: "application/pdf",
    parents: [clientFolderId],
    appProperties: properties,
  };
  const boundary = `lightness-intake-${randomBytes(18).toString("hex")}`;
  const multipart = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
    Buffer.from(input.pdf),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const response = await request(`${uploadApi}?${new URLSearchParams({ uploadType: "multipart", fields })}`, accessToken, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body: new Uint8Array(multipart).buffer,
  });
  const existing = response.status === 409;
  if (!response.ok && !existing) return failure(response);
  verifyMetadata(existing ? await readMetadata(fileId, accessToken) : await body(response), {
    id: fileId, mimeType: "application/pdf", parentId: clientFolderId, properties,
  });
  return { id: fileId, created: !existing };
}
