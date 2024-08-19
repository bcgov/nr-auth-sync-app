/* eslint-disable @typescript-eslint/no-empty-function */
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { exhaustMap, filter, interval, timer } from 'rxjs';
import { GenerateController } from './generate.contoller';
import { AuthRoleSyncController } from './auth-role-sync.controller';
import { AuthMemberSyncController } from './auth-member-sync.controller';
import { TargetService } from '../services/target.service';

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
    @inject(TYPES.TargetService) private targetService: TargetService,
  ) {}

  /**
   * Monitor for changes
   * @returns
   */
  public async monitor(): Promise<void> {
    const source$ = timer(0, 30 * 60 * 1000);
    const resetCacheInterval$ = interval(6 * 60 * 60 * 1000);
    const resetAllCacheInterval$ = interval(12 * 60 * 60 * 1000);
    console.log(`>>> Monitor - start`);

    // Skip every 2nd because it is a full reset
    resetCacheInterval$.pipe(filter((cnt) => cnt % 2 === 0)).subscribe(() => {
      console.log(`---- Reset user cache`);
      this.targetService.resetUserCache(false);
    });
    resetAllCacheInterval$.subscribe(() => {
      console.log(`---- Reset user cache (all)`);
      this.targetService.resetUserCache(true);
    });

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
