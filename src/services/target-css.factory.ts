import axios from 'axios';
import qs from 'querystring';
import { getLogger } from '@oclif/core';
import { TargetCssService } from './impl/target-css.service.js';
import {
  cssClientIdDefault,
  cssClientSecretDefault,
  cssTokenUrlDefault,
} from '../flags.js';

const CSS_API_TOKEN_RENEWAL_MS = 250000;
const console = getLogger('factory');

let cssApiPromiseResolve: (
  value: TargetCssService | PromiseLike<TargetCssService>,
) => void;
const CSS_API_PROMISE = new Promise<TargetCssService>((resolve) => {
  cssApiPromiseResolve = resolve;
});
let CSS_API_INSTANCE: TargetCssService | null = null;

/**
 * CSS Api factory
 * @param cssTokenUrl
 * @param cssClientId
 * @param cssClientSecret
 * @returns
 */
export async function cssServiceFactory(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
): Promise<TargetCssService | null> {
  if (
    tokenUrl === cssTokenUrlDefault ||
    clientId === cssClientIdDefault ||
    clientSecret === cssClientSecretDefault
  ) {
    return null;
  }
  if (CSS_API_INSTANCE) {
    return CSS_API_PROMISE;
  }
  CSS_API_INSTANCE = new TargetCssService();
  const accessToken = await requestToken(tokenUrl, clientId, clientSecret);
  CSS_API_INSTANCE.setToken(accessToken);

  const timeoutId = setInterval(() => {
    void requestToken(tokenUrl, clientId, clientSecret).then((accessToken) => {
      CSS_API_INSTANCE?.setToken(accessToken);
    });
  }, CSS_API_TOKEN_RENEWAL_MS);
  // Use unref so that node quits
  timeoutId.unref();

  cssApiPromiseResolve(CSS_API_INSTANCE);
  return CSS_API_PROMISE;
}

async function requestToken(
  cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string,
) {
  const data = { grant_type: 'client_credentials' };
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    auth: {
      username: cssClientId,
      password: cssClientSecret,
    },
    data: qs.stringify(data),
    url: cssTokenUrl,
  };
  console.debug('>>> CSS: request token');
  const cssAdminApiResponse = await axios.request(options);
  return cssAdminApiResponse.data.access_token;
}
