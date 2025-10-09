// src/services/auditService.ts
import { createAuditLog } from '../models/other';

export const logAudit = async (
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: any
): Promise<any> => {
  const newAudit = await createAuditLog(actorId, action, targetType, targetId, metadata);
  return newAudit;
};