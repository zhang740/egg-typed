// tslint:disable
/// <reference path="./typings.d.ts" />

import request from './base';

export class MetaService {

  /** 首页 */
  async index(
    params: {
      // query
      id?: string;
      n?: number;
      e?: string;
      d?: any;
      }
  ): Promise<any> {
    return request(`/meta/index`, {
      method: `GET`,
      params,
    });
  }

  /** 简写 */
  async sort(
  ): Promise<any> {
    return request(`/meta/sort`, {
      method: `GET`,
    });
  }

  /** post */
  async postData(
    body: {
      param?: any,
    }
  ): Promise<any> {
    return request(`/meta/post`, {
      method: `POST`,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  }

  /** put */
  async put(
    body: {
      id?: number,
    }
  ): Promise<any> {
    return request(`/meta/put`, {
      method: `PUT`,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  }

  }

export const metaService = new MetaService();
export default metaService;
