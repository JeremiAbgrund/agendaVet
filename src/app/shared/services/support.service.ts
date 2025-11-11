import { Injectable } from '@angular/core';
import { SupportRequest } from '../models/support-request.model';

const STORAGE_KEY = 'agendavet_support_requests';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private readStore(): SupportRequest[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private writeStore(data: SupportRequest[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async submitRequest(payload: Omit<SupportRequest, 'id' | 'createdAt'>): Promise<SupportRequest> {
    const request: SupportRequest = {
      ...payload,
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    const current = this.readStore();
    current.unshift(request);
    this.writeStore(current);

    // Simular latencia
    await new Promise(resolve => setTimeout(resolve, 900));
    return request;
  }

  getHistory(): SupportRequest[] {
    return this.readStore();
  }
}
