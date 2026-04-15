import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../../services/mail.service';
import { MailController } from '../mail.controller';

describe('MailController', () => {
  let controller: MailController;

  const mockMailService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [MailService],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
