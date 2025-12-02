import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private store!: Storage;
  private ready: Promise<void>;

  constructor(private storage: Storage) {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    this.store = await this.storage.create();
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.ready;
    return this.store.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ready;
    await this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ready;
    await this.store.remove(key);
  }
}
