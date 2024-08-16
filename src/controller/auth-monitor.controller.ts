/* eslint-disable @typescript-eslint/no-empty-function */
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { exhaustMap, timer } from 'rxjs';
import { GenerateController } from './generate.contoller';
import { AuthRoleSyncController } from './auth-role-sync.controller';
import { AuthMemberSyncController } from './auth-member-sync.controller';

@injectable()
/**
 * Auth monitor controller
 */
export class AuthMonitorController {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.GenerateController) private generate: GenerateController,
    @inject(TYPES.AuthRoleSyncController) private role: AuthRoleSyncController,
    @inject(TYPES.AuthMemberSyncController)
    private member: AuthMemberSyncController,
  ) {}

  /**
   * Monitor for changes
   * @returns
   */
  public async monitor(): Promise<void> {
    const source$ = timer(0, 30 * 60 * 1000);
    console.log(`>>> Monitor - start`);
    source$
      .pipe(
        exhaustMap(async () => {
          const startMs = Date.now();
          const integrationConfigs = await this.generate.generate();
          if (integrationConfigs) {
            await this.role.sync(integrationConfigs);
            await this.member.sync(integrationConfigs);
          }
          console.log(`---- sync end [${Date.now() - startMs}]`);
        }),
      )
      .subscribe(() => {});
  }
}
