/* eslint-disable @typescript-eslint/no-empty-function */
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { delay, exhaustMap, filter, interval, timer } from 'rxjs';
import { GenerateController } from './generate.contoller';
import { AuthRoleSyncController } from './auth-role-sync.controller';
import { AuthMemberSyncController } from './auth-member-sync.controller';
import { TargetService } from '../services/target.service';

const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
const MONITOR_STARTUP_DELAY_MS = 5000;
const MONITOR_CACHE_RESET_INTERVAL_MS = 6 * 60 * 60 * 1000;
const MONITOR_CACHE_RESET_FULL_NTH = 4;

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
    const source$ = timer(0, MONITOR_INTERVAL_MS);
    const resetCacheInterval$ = interval(MONITOR_CACHE_RESET_INTERVAL_MS);
    const resetAllCacheInterval$ = interval(
      MONITOR_CACHE_RESET_INTERVAL_MS * MONITOR_CACHE_RESET_FULL_NTH,
    );
    console.log(`>>> Monitor - start`);

    // Skip every MONITOR_CACHE_RESET_FULL_NTH because it is a full reset
    resetCacheInterval$
      .pipe(filter((cnt) => cnt % MONITOR_CACHE_RESET_FULL_NTH === 0))
      .subscribe(() => {
        console.log(`---- Reset user cache`);
        this.targetService.resetUserCache(false);
      });
    resetAllCacheInterval$.subscribe(() => {
      console.log(`---- Reset user cache (all)`);
      this.targetService.resetUserCache(true);
    });

    source$
      .pipe(
        // Delay a bit so cach reset runs first
        delay(MONITOR_STARTUP_DELAY_MS),
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
