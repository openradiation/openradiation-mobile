import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AsyncStorageEngine } from '@ngxs-labs/async-storage-plugin';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements AsyncStorageEngine {
  constructor(private storage: Storage) {}

  length(): Observable<number> {
    return from(this.storage.length());
  }

  getItem(key: any): Observable<any> {
    return from(
      this.storage.get(key).then(val => {
        console.log('return get', key, val);
        return val;
      })
    );
  }

  setItem(key: any, val: any): void {
    console.log('set', key, val);
    this.storage.set(key, val);
  }

  removeItem(key: any): void {
    this.storage.remove(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(val: number): Observable<string> {
    return from(this.storage.keys().then((keys: any) => keys[val]));
  }
}
