import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail.service';
import { MailerService } from '@nestjs-modules/mailer';

export const mockMailService = {
  sendTeacherInvite: jest.fn().mockResolvedValue(undefined),
};

export const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue({}),
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        MailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
