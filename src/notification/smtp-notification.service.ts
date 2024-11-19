import { inject, injectable } from 'inversify';
import { getLogger } from '@oclif/core';
import nodemailer from 'nodemailer';
import ejs from 'ejs';

import { TYPES } from '../inversify.types.js';
import { IntegrationConfig, UserSummary } from '../types.js';
import { roleFromConfig } from '../util/role.util.js';

@injectable()
/**
 *
 */
export class SmtpNotificationService {
  private readonly console = getLogger('SmtpNotificationService');
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.NotificationSmtp) private readonly notificationSmtp: any,
    @inject(TYPES.NotificationOption) private readonly notificationOption: any,
  ) {}

  public async notifyUsers(
    config: IntegrationConfig,
    summaries: UserSummary[],
  ) {
    if (summaries.length === 0) {
      return;
    }

    const transporter = nodemailer.createTransport(this.notificationSmtp);
    const subject = ejs.render(this.notificationOption.subject, {
      config,
    });

    const addRoleTextMap = config.roles.reduce((pv, cv) => {
      if (!cv.onAdd?.templateText) {
        return pv;
      }
      return {
        [roleFromConfig(cv)]: cv.onAdd?.templateText,
        ...pv,
      };
    }, {});
    const addRoleHtmlMap = config.roles.reduce((pv, cv) => {
      if (!cv.onAdd?.templateHtml) {
        return pv;
      }
      return {
        [roleFromConfig(cv)]: cv.onAdd?.templateHtml,
        ...pv,
      };
    }, {});

    for (const summary of summaries) {
      if (!summary.user.email) {
        continue;
      }

      // Set up email data
      const mailOptions = {
        from: this.notificationOption.from,
        to: summary.user.email,
        subject,
        text: ejs.render(this.notificationOption.text, {
          config,
          summary,
          addRoleMap: addRoleTextMap,
        }), // Plain text body
        html: ejs.render(this.notificationOption.html, {
          config,
          summary,
          addRoleMap: addRoleHtmlMap,
        }), // HTML body
      };

      // Send mail
      // this.console.debug(mailOptions);
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return this.console.error('Error occurred: ' + error.message);
        }
        this.console.info('Message sent: %s', info.messageId);
      });
    }
  }
}
