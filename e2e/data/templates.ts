import { Data } from '../protractor-stories/director';

interface IExample {
  title: string; // ensure all data of this type has a title
}

// all data objects must have a Id. this is the name used inside test scripts
export class Example implements Data {
  constructor(public dataID: string, requestData: IExample) {
    Object.assign(this, requestData);
  }
}

export class File implements Data {
  constructor(public dataID: string, public path: string) {
  }
}
