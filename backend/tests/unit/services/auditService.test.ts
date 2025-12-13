import { logAudit } from '../../../src/services/auditService';
import * as otherModel from '../../../src/models/other';

jest.mock('../../../src/models/other', () => ({
  createAuditLog: jest.fn(),
}));

describe('AuditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
  [Description]: Kiểm tra xem hàm logAudit có gọi model createAuditLog với cấu trúc đối tượng ghi log chính xác hay không.
  [Pre-condition]: Model createAuditLog được mock thành công.
  [Data Test]: actorId='user1', action='test.action', targetType='listing', targetId='123', meta={ note: 'test' }
  [Steps]: 
    1. Mock otherModel.createAuditLog trả về { id: 'log1' }.
    2. Gọi hàm logAudit('user1', 'test.action', 'listing', '123', { note: 'test' }).
  [Expected Result]: 
    - Hàm otherModel.createAuditLog được gọi.
    - Tham số truyền vào phải khớp với object cấu trúc ({ actor_id, action, target_type, target_id, metadata }).
  */
  it('should call model createAuditLog with correct object structure', async () => {
    (otherModel.createAuditLog as jest.Mock).mockResolvedValue({ id: 'log1' });

    await logAudit('user1', 'test.action', 'listing', '123', { note: 'test' });

    expect(otherModel.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: 'user1',
        action: 'test.action',
        target_type: 'listing',
        target_id: '123',
        metadata: { note: 'test' }
      })
    );
  });
});