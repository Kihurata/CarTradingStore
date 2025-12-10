import { logAudit } from '../../../src/services/auditService';
import * as otherModel from '../../../src/models/other';

jest.mock('../../../src/models/other', () => ({
  createAuditLog: jest.fn(),
}));

describe('AuditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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