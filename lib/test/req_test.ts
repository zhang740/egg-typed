import * as request from 'request';
import { ReqTestBase } from './base';

export class ReqTest extends ReqTestBase {
  async runTest() {
    const { info } = this;
    this.startMockData();
    return new Promise<{ status: number, body: any, err: any }>((resolve, _reject) => {
      const isFormData = info.header['content-type'] === 'application/x-www-form-urlencoded';

      const req = request(info.url, {
        baseUrl: `http://${info.header.host}`,
        method: info.method,
        headers: info.header,
        formData: isFormData ? info.body : undefined,
        body: isFormData ? undefined : JSON.stringify(info.body),
      }, (err, res, body) => {
        this.stopMockData();
        resolve({
          status: res && res.statusCode,
          body,
          err: JSON.parse(JSON.stringify(err)),
        });
      });
    });
  }
}
