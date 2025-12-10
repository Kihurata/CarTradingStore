// src/services/auditService.ts
import { createAuditLog } from '../models/other';

export const logAudit = async (
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: any
): Promise<any> => {
  const newAudit = await createAuditLog({ 
    actor_id: actorId,    
    action, 
    target_type: targetType, 
    target_id: targetId,    
    metadata 
});
  return newAudit;
};