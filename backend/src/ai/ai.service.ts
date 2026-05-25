import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessNiche } from '../common/domain/business-niche';
import { GenerateReplyDto } from './dto/generate-reply.dto';

type ReplyTone = 'professional' | 'friendly' | 'assertive';
type Urgency = 'low' | 'medium' | 'high';

export interface AiWorkflowResponse {
  niche: BusinessNiche;
  source: 'openai' | 'fallback';
  intent: string;
  urgency: Urgency;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  historySummary: string;
  detectedSignals: {
    unpaidInvoice: boolean;
    complaint: boolean;
    refundRequest: boolean;
    lead: boolean;
  };
  suggestedTags: string[];
  nextActions: string[];
  followUp: {
    required: boolean;
    dueInHours: number;
    reason: string;
  };
  replies: Record<ReplyTone, string>;
}

type WorkflowPayload = Omit<AiWorkflowResponse, 'niche' | 'source'>;

interface OpenAiContentItem {
  type?: string;
  text?: string;
}

interface OpenAiOutputItem {
  content?: OpenAiContentItem[];
}

interface OpenAiResponseBody {
  output_text?: string;
  output?: OpenAiOutputItem[];
}

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async generateReply(dto: GenerateReplyDto): Promise<AiWorkflowResponse> {
    const niche = dto.niche ?? BusinessNiche.B2BSaasSupport;

    if (this.configService.get<string>('OPENAI_API_KEY')) {
      return this.generateWithOpenAi(dto, niche);
    }

    return this.generateFallback(dto, niche);
  }

  private async generateWithOpenAi(
    dto: GenerateReplyDto,
    niche: BusinessNiche,
  ): Promise<AiWorkflowResponse> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>(
      'OPENAI_MODEL',
      'gpt-5.4-mini',
    );

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: this.buildSystemPrompt(niche),
          },
          {
            role: 'user',
            content: JSON.stringify({
              currentMessage: dto.message,
              history: dto.history ?? [],
              clientContext: dto.clientContext ?? {},
              businessRules: dto.businessRules ?? '',
            }),
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'flowdesk_ai_workflow',
            strict: true,
            schema: this.workflowSchema(),
          },
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new ServiceUnavailableException(
        `OpenAI request failed: ${details}`,
      );
    }

    const data = (await response.json()) as OpenAiResponseBody;
    const outputText = this.extractOutputText(data);
    const workflowPayload = JSON.parse(outputText) as WorkflowPayload;

    return {
      ...workflowPayload,
      niche,
      source: 'openai',
    };
  }

  private buildSystemPrompt(niche: BusinessNiche): string {
    const nicheBrief =
      niche === BusinessNiche.RealEstate
        ? 'You help real estate agents qualify leads, follow up on viewings, answer property questions, and move buyers/sellers to the next appointment.'
        : 'You help B2B SaaS support agencies triage tickets, protect SLA quality, clarify product issues, and give account-aware replies.';

    return [
      nicheBrief,
      'Return only valid JSON matching the schema.',
      'Be useful, specific, and commercially aware.',
      'Never promise legal, financial, medical, refund, or availability outcomes unless the provided business rules explicitly allow it.',
      'Replies should be ready to send but should not invent facts missing from the input.',
    ].join(' ');
  }

  private workflowSchema() {
    return {
      type: 'object',
      additionalProperties: false,
      required: [
        'intent',
        'urgency',
        'sentiment',
        'summary',
        'historySummary',
        'detectedSignals',
        'suggestedTags',
        'nextActions',
        'followUp',
        'replies',
      ],
      properties: {
        intent: { type: 'string' },
        urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
        sentiment: {
          type: 'string',
          enum: ['positive', 'neutral', 'negative'],
        },
        summary: { type: 'string' },
        historySummary: { type: 'string' },
        detectedSignals: {
          type: 'object',
          additionalProperties: false,
          required: ['unpaidInvoice', 'complaint', 'refundRequest', 'lead'],
          properties: {
            unpaidInvoice: { type: 'boolean' },
            complaint: { type: 'boolean' },
            refundRequest: { type: 'boolean' },
            lead: { type: 'boolean' },
          },
        },
        suggestedTags: {
          type: 'array',
          items: { type: 'string' },
        },
        nextActions: {
          type: 'array',
          items: { type: 'string' },
        },
        followUp: {
          type: 'object',
          additionalProperties: false,
          required: ['required', 'dueInHours', 'reason'],
          properties: {
            required: { type: 'boolean' },
            dueInHours: { type: 'integer' },
            reason: { type: 'string' },
          },
        },
        replies: {
          type: 'object',
          additionalProperties: false,
          required: ['professional', 'friendly', 'assertive'],
          properties: {
            professional: { type: 'string' },
            friendly: { type: 'string' },
            assertive: { type: 'string' },
          },
        },
      },
    };
  }

  private extractOutputText(data: OpenAiResponseBody): string {
    if (typeof data.output_text === 'string') {
      return data.output_text;
    }

    const text = data.output
      ?.flatMap((item) => item.content ?? [])
      ?.find((content) => content.type === 'output_text')?.text;

    if (!text) {
      throw new ServiceUnavailableException('OpenAI response had no text.');
    }

    return text;
  }

  private generateFallback(
    dto: GenerateReplyDto,
    niche: BusinessNiche,
  ): AiWorkflowResponse {
    const text = dto.message.toLowerCase();
    const urgency = this.detectUrgency(text);
    const sentiment = this.detectSentiment(text);
    const intent = this.detectIntent(text, niche);
    const detectedSignals = this.detectSignals(text, niche);
    const dueInHours = urgency === 'high' ? 2 : urgency === 'medium' ? 12 : 24;

    return {
      niche,
      source: 'fallback',
      intent,
      urgency,
      sentiment,
      summary: this.summarize(dto.message, intent),
      historySummary: this.summarizeHistory(dto.history ?? []),
      detectedSignals,
      suggestedTags: this.tagsFor(intent, urgency, niche, detectedSignals),
      nextActions: this.nextActionsFor(intent, urgency, niche),
      followUp: {
        required: true,
        dueInHours,
        reason: `Follow up within ${dueInHours} hours because this looks like a ${urgency}-urgency ${intent} conversation.`,
      },
      replies: this.repliesFor(dto.message, intent, niche),
    };
  }

  private detectUrgency(text: string): Urgency {
    if (
      ['urgent', 'asap', 'immediately', 'today', 'down', 'blocked'].some(
        (keyword) => text.includes(keyword),
      )
    ) {
      return 'high';
    }

    if (
      ['tomorrow', 'soon', 'issue', 'problem', 'concern', 'follow up'].some(
        (keyword) => text.includes(keyword),
      )
    ) {
      return 'medium';
    }

    return 'low';
  }

  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (
      ['angry', 'bad', 'unhappy', 'frustrated', 'not working'].some((word) =>
        text.includes(word),
      )
    ) {
      return 'negative';
    }

    if (
      ['thanks', 'great', 'interested', 'happy'].some((word) =>
        text.includes(word),
      )
    ) {
      return 'positive';
    }

    return 'neutral';
  }

  private detectIntent(text: string, niche: BusinessNiche): string {
    if (niche === BusinessNiche.RealEstate) {
      if (
        ['viewing', 'visit', 'tour', 'showing'].some((word) =>
          text.includes(word),
        )
      ) {
        return 'property-viewing';
      }
      if (
        ['price', 'budget', 'loan', 'mortgage'].some((word) =>
          text.includes(word),
        )
      ) {
        return 'buyer-qualification';
      }
      return 'real-estate-follow-up';
    }

    if (
      ['bug', 'error', 'not working', 'down'].some((word) =>
        text.includes(word),
      )
    ) {
      return 'technical-support';
    }
    if (
      ['invoice', 'billing', 'refund', 'payment'].some((word) =>
        text.includes(word),
      )
    ) {
      return 'billing-support';
    }
    return 'saas-customer-follow-up';
  }

  private summarize(message: string, intent: string): string {
    return `Client message classified as ${intent}: "${message}"`;
  }

  private detectSignals(text: string, niche: BusinessNiche) {
    return {
      unpaidInvoice:
        ['unpaid', 'overdue', 'past due', 'invoice due'].some((word) =>
          text.includes(word),
        ) ||
        (text.includes('invoice') && text.includes('not paid')),
      complaint: ['complaint', 'angry', 'unhappy', 'frustrated'].some((word) =>
        text.includes(word),
      ),
      refundRequest: ['refund', 'credit', 'chargeback'].some((word) =>
        text.includes(word),
      ),
      lead:
        niche === BusinessNiche.RealEstate &&
        ['interested', 'budget', 'viewing', 'property', 'buy', 'sell'].some(
          (word) => text.includes(word),
        ),
    };
  }

  private summarizeHistory(history: GenerateReplyDto['history']): string {
    if (!history?.length) {
      return 'No prior conversation history was provided.';
    }

    const recent = history.slice(-4);
    return recent
      .map((item) => `${item.role}: ${item.message}`)
      .join(' | ')
      .slice(0, 500);
  }

  private tagsFor(
    intent: string,
    urgency: Urgency,
    niche: BusinessNiche,
    signals: AiWorkflowResponse['detectedSignals'],
  ): string[] {
    const tags = [niche, intent, `${urgency}-urgency`];

    if (signals.unpaidInvoice) tags.push('unpaid-invoice');
    if (signals.complaint) tags.push('complaint');
    if (signals.refundRequest) tags.push('refund-request');
    if (signals.lead) tags.push('lead');

    return tags;
  }

  private nextActionsFor(
    intent: string,
    urgency: Urgency,
    niche: BusinessNiche,
  ): string[] {
    if (niche === BusinessNiche.RealEstate) {
      return [
        'Confirm property, preferred time, and buyer/seller requirements.',
        'Capture budget, location preference, and timeline.',
        urgency === 'high'
          ? 'Call the lead before sending a long written response.'
          : 'Schedule a follow-up reminder after the reply.',
      ];
    }

    return [
      'Confirm the user impact, account, and affected feature.',
      'Check SLA priority and route to the right support queue.',
      intent === 'technical-support'
        ? 'Ask for reproduction steps, screenshots, or logs.'
        : 'Verify billing rules before promising a refund or credit.',
    ];
  }

  private repliesFor(
    message: string,
    intent: string,
    niche: BusinessNiche,
  ): Record<ReplyTone, string> {
    if (niche === BusinessNiche.RealEstate) {
      return {
        professional: `Thank you for reaching out. I have noted your request about "${message}". Could you share your preferred location, budget range, and timeline so I can guide you properly?`,
        friendly: `Thanks for messaging. I can help with this. Send me your preferred area, budget, and timing, and I will suggest the best next step.`,
        assertive: `I can move this forward. Please share your budget, preferred location, and ideal timing, and I will confirm the next available option.`,
      };
    }

    return {
      professional: `Thanks for the details. I have classified this as ${intent} and will review the account context before recommending the next step.`,
      friendly: `Thanks for flagging this. I will check the context and help get this moving in the right queue.`,
      assertive: `I have received your message about "${message}". I will verify the relevant details and route this according to priority.`,
    };
  }
}
