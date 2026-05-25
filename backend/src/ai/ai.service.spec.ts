import { ConfigService } from '@nestjs/config';
import { BusinessNiche } from '../common/domain/business-niche';
import { AiService } from './ai.service';

describe('AiService', () => {
  it('generates niche-aware fallback workflow intelligence', async () => {
    const service = new AiService({
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService);

    const result = await service.generateReply({
      message: 'Can we schedule a property viewing today?',
      niche: BusinessNiche.RealEstate,
      history: [],
    });

    expect(result.source).toBe('fallback');
    expect(result.niche).toBe(BusinessNiche.RealEstate);
    expect(result.intent).toBe('property-viewing');
    expect(result.urgency).toBe('high');
    expect(result.nextActions.length).toBeGreaterThan(0);
    expect(result.replies.professional).toContain('preferred location');
  });
});
