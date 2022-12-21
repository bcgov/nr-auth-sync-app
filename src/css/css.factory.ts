import axios from 'axios';
import qs from 'querystring';
import {CssAdminApi} from './css-admin.api';

const CSS_API_TOKEN_RENEWAL_MS = 250000;

let cssApiPromiseResolve: (value: CssAdminApi | PromiseLike<CssAdminApi>) => void;
const CSS_API_PROMISE = new Promise<CssAdminApi>((resolve) => {
  cssApiPromiseResolve = resolve;
});
let CSS_API_INSTANCE: CssAdminApi | null = null;

/**
 * CSS Api factory
 * @param cssTokenUrl
 * @param cssClientId
 * @param cssClientSecret
 * @returns
 */
export async function cssAdminApiFactory(
  cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string): Promise<CssAdminApi> {
  if (CSS_API_INSTANCE) {
    return CSS_API_PROMISE;
  }
  CSS_API_INSTANCE = new CssAdminApi();
  const accessToken = await requestToken(cssTokenUrl, cssClientId, cssClientSecret);
  CSS_API_INSTANCE.setToken(accessToken);

  const timeoutId = setInterval(() => {
    void requestToken(cssTokenUrl, cssClientId, cssClientSecret)
      .then((accessToken) => {
        CSS_API_INSTANCE?.setToken(accessToken);
      });
  }, CSS_API_TOKEN_RENEWAL_MS);
  // Use unref so that node quits
  timeoutId.unref();

  cssApiPromiseResolve(CSS_API_INSTANCE);
  return CSS_API_PROMISE;
}

async function requestToken(cssTokenUrl: string,
  cssClientId: string,
  cssClientSecret: string) {
  const data = {'grant_type': 'client_credentials'};
  const options = {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    auth: {
      username: cssClientId,
      password: cssClientSecret,
    },
    data: qs.stringify(data),
    url: cssTokenUrl,
  };
  console.log('>>> CSS: request token');
  const cssAdminApiResponse = await axios.request(options);
  return cssAdminApiResponse.data.access_token;
}
