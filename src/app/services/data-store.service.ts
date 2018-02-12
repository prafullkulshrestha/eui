import { Injectable } from '@angular/core';

@Injectable()
export class DataStoreService {

  private sourceInfo: any;
  private itemToCreate: any;

  getSourceInfo() {
    return this.sourceInfo;
  }

  setSourceInfo(value) {
    this.sourceInfo = value;
  }

  getItemToCreate() {
    return this.itemToCreate;
  }

  setItemToCreate(value) {
    this.itemToCreate = value;
  }
}
