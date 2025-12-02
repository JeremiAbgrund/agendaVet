import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, from, map, tap } from 'rxjs';
import { VetProfile } from '../models/profile.model';
import { StorageService } from './storage.service';

export interface TipItem {
  id: number;
  title: string;
  completed: boolean;
}

const VETS_KEY = 'agendavet_remote_vets';
const TIPS_KEY = 'agendavet_remote_tips';
const CURATED_TIPS: TipItem[] = [
  { id: 1, title: 'Confirmar ayuno y traslado seguro antes de la cita', completed: false },
  { id: 2, title: 'Revisar carnet sanitario y vacunas al dia', completed: false },
  { id: 3, title: 'Hidratacion y descanso tras vacunacion', completed: false },
  { id: 4, title: 'Agendar control dental anual para perros y gatos', completed: false },
  { id: 5, title: 'Registrar alergias o reacciones previas en el perfil', completed: false }
];

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private storageService: StorageService) {}

  fetchVets(): Observable<VetProfile[]> {
    const url = 'https://jsonplaceholder.typicode.com/users';
    return this.http.get<any[]>(url).pipe(
      map(users => users.map(user => ({
        id: `vet-${user.id}`,
        name: user.name,
        specialty: user.company?.bs || 'Medicina general',
        available: Boolean(user.id % 2 === 0)
      }) as VetProfile)),
      tap(list => this.cache(VETS_KEY, list)),
      catchError(() => from(this.readCache<VetProfile[]>(VETS_KEY)))
    );
  }

  fetchTips(): Observable<TipItem[]> {
    const url = 'https://jsonplaceholder.typicode.com/todos?userId=1';
    return this.http.get<any[]>(url).pipe(
      map(items => {
        const curated = CURATED_TIPS.slice();
        return items.slice(0, 5).map((item, idx) => ({
          id: item.id,
          title: curated[idx]?.title ?? item.title,
          completed: !!item.completed
        }) as TipItem);
      }),
      tap(list => this.cache(TIPS_KEY, list)),
      catchError(() => from(this.readCache<TipItem[]>(TIPS_KEY)).pipe(
        map(cached => cached.length ? cached : CURATED_TIPS)
      ))
    );
  }

  private async cache(key: string, data: unknown): Promise<void> {
    try {
      await this.storageService.set(key, data);
    } catch {
      // Evitar romper flujo si falla storage
    }
  }

  private async readCache<T>(key: string): Promise<T> {
    try {
      const stored = await this.storageService.get<T>(key);
      return stored ?? ([] as unknown as T);
    } catch {
      return [] as unknown as T;
    }
  }
}
