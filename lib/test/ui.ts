import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import * as URL from 'url';
import { TestReqData, TestBase, INFO_FILE_NAME } from './base';

export const REQ_GROUP_DIR = 'req-group';

export class ReqGroupTestBase extends TestBase {
  info: {
    id?: string;
    title: string;
    reqGroup: {
      method: string,
      pathname: 'string',
      title: 'string',
      mockData?: any[],
    }[];
  };

  reqGroupDir: string;

  constructor(dir: string) {
    super(dir);
    this.info = this.loadInfo();
    this.reqGroupDir = path.join(this.dir, REQ_GROUP_DIR);
    if (this.info) {
      this.info.reqGroup = (this.info.reqGroup || []).filter(
        reqInfo => fs.existsSync(this.getPath(reqInfo.method, reqInfo.pathname)),
      );
      this.loadMockData();
    }
  }

  getPath(method: string, pathname: string) {
    return path.join(this.reqGroupDir, `[${method}]${encodeURIComponent(pathname)}.json`);
  }

  loadMockData() {
    this.info.reqGroup.map(reqInfo => {
      reqInfo.mockData = JSON.parse(
        fs.readFileSync(path.join(this.reqGroupDir, `[${reqInfo.method}]${encodeURIComponent(reqInfo.pathname)}.json`), 'utf-8'),
      );
    });
  }

  saveInfo() {
    if (this.info) {
      super.saveInfo(this.info);
    }
  }

  saveReqGroup(reqGroup: TestReqData[]) {
    const infoReq: any[] = [];
    this.mkdir(this.reqGroupDir);
    reqGroup.forEach(req => {
      const url = URL.parse(req.url);
      const filepath = this.getPath(req.method, url.pathname);
      let fileContent = [];
      if (fs.existsSync(filepath)) {
        fileContent = this.readFile(filepath);
      } else {
        infoReq.push({
          title: req.title,
          method: req.method,
          pathname: url.pathname,
        });
      }
      fileContent.push(req);
      this.writeFile(filepath, fileContent);
    });
    this.info.reqGroup = infoReq;
    this.saveInfo();
  }
}

export class UiBase extends TestBase {
  info: {
    uiid: string;
    title: string;
    reqGroups: any[];
  };

  _reqGroupTests: ReqGroupTestBase[];

  constructor(dir: string) {
    super(dir);
    this.info = this.loadInfo();
    if (this.info) {
      this.info.reqGroups = Array.from(new Set(this.info.reqGroups.concat(fs.readdirSync(dir) || [])))
        .filter(reqGroupDir => fs.existsSync(path.join(dir, reqGroupDir)) &&
          fs.statSync(path.join(dir, reqGroupDir)).isDirectory());
      this.loadReqGroupTests();
    }
  }

  get reqGroupTests() {
    return this._reqGroupTests;
  }

  saveInfo() {
    if (this.info) {
      super.saveInfo(this.info);
    }
  }

  loadReqGroupTests() {
    this._reqGroupTests = this.info.reqGroups.map(gid => {
      return new ReqGroupTestBase(path.join(this.dir, gid));
    });
  }

  saveRegGroupTest(title: string, reqGroup: TestReqData[]) {
    const gid = uuid.v4();

    const reqGroupTest = new ReqGroupTestBase(path.join(this.dir, gid));
    reqGroupTest.info = { title, reqGroup: [] };
    reqGroupTest.saveInfo();
    reqGroupTest.saveReqGroup(reqGroup);

    this.info.reqGroups.push(gid);
    this.saveInfo();

    return reqGroupTest;
  }
}
