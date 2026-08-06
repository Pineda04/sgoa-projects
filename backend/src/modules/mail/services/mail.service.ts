import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';
import { TEMPLATE } from '../constants';
import { envs } from 'src/config';

const logger = new Logger('MailService');

interface ISendMail {
  to: string;
  message?: string;
  subject?: string;
  html?: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
    const promise: Promise<boolean> = Promise.resolve(this.test());

    promise
      .then((value: boolean) => {
        if (!value) throw new Error('Error starting the mail service');

        return logger.log('MailService running');
      })
      .catch((err) => logger.error(err));
  }

  async test() {
    return await this.mailerService.verifyAllTransporters();
  }

  async sendMail({
    to,
    message = 'Email service SGOA.',
    subject = `How to Send Emails with Nodemailer`,
    html,
  }: ISendMail): Promise<SentMessageInfo> {
    const email = envs.email;

    if (!email) throw new Error('Environment variable EMAIL is not set!');

    return await this.mailerService.sendMail({
      from: `Desarrollo SGOA <${email}>`,
      to,
      subject,
      text: message,
      html,
    });
  }

  async sendResetPassword(to: string, token: string): Promise<SentMessageInfo> {
    const resetPasswordLink = `${envs.feUrl}/auth/reset-password?token=${token}`;

    return await this.sendMail({
      to,
      subject: 'Solicitud de cambio de contraseña.',
      html: TEMPLATE(resetPasswordLink),
    });
  }
}
