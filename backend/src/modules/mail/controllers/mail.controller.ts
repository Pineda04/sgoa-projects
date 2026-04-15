import { Controller, Post, Get, Body } from '@nestjs/common';
import { EUserRole } from 'src/common/enums';
import { Roles } from 'src/common/decorators';
import { MailService } from '../services/mail.service';
import { EmailDto } from '../dto/email.dto';

@Controller('mail')
@Roles(EUserRole.ADMIN)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  test() {
    return this.mailService.test();
  }

  @Post()
  create(@Body() emailDto: EmailDto) {
    return this.mailService.sendMail({ to: emailDto.email });
  }
}
