import { Injectable } from '@angular/core';
import { SupportRequest } from '../models/support-request.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'agendavet_support_requests';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private cache: SupportRequest[] = [];
  readonly ready: Promise<void>;

  constructor(private storageService: StorageService) {
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      const stored = await this.storageService.get<SupportRequest[]>(STORAGE_KEY);
      this.cache = stored ?? [];
    } catch {
      this.cache = [];
    }
  }

  private async persist(): Promise<void> {
    await this.storageService.set(STORAGE_KEY, this.cache);
  }

  async submitRequest(payload: Omit<SupportRequest, 'id' | 'createdAt'>): Promise<SupportRequest> {
    const request: SupportRequest = {
      ...payload,
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    this.cache = [request, ...this.cache];
    await this.persist();

    // Simular latencia breve para UX
    await new Promise(resolve => setTimeout(resolve, 900));
    return request;
  }

  getHistory(): SupportRequest[] {
    return this.cache;
  }
}
