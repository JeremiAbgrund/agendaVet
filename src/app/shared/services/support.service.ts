import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SupportRequest } from '../models/support-request.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  readonly ready: Promise<void>;

  constructor(private databaseService: DatabaseService) {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await firstValueFrom(this.databaseService.getDatabaseState());
    console.log('SupportService is ready');
  }

  async submitRequest(payload: Omit<SupportRequest, 'id' | 'createdAt'>): Promise<SupportRequest> {
    const request: SupportRequest = {
      ...payload,
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    await this.databaseService.addSupportRequest(request);

    // Simular latencia breve para UX
    await new Promise(resolve => setTimeout(resolve, 900));
    return request;
  }

  async getHistory(): Promise<SupportRequest[]> {
    return this.databaseService.getSupportRequests();
  }
}
