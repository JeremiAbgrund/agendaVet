import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { VetProfile } from '../models/profile.model';

export interface TipItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface BreedOption {
  id: string;
  name: string;
  temperament?: string;
  origin?: string;
}

const VETS_KEY = 'agendavet_remote_vets';
const TIPS_KEY = 'agendavet_remote_tips';
const DOG_BREEDS_KEY = 'agendavet_dog_breeds';
const CURATED_TIPS: TipItem[] = [
  { id: 1, title: 'Confirmar ayuno y traslado seguro antes de la cita', completed: false },
  { id: 2, title: 'Revisar carnet sanitario y vacunas al dia', completed: false },
  { id: 3, title: 'Hidratacion y descanso tras vacunacion', completed: false },
  { id: 4, title: 'Agendar control dental anual para perros y gatos', completed: false },
  { id: 5, title: 'Registrar alergias o reacciones previas en el perfil', completed: false }
];
const CURATED_DOG_BREEDS: BreedOption[] = [
  { id: 'labrador', name: 'Labrador Retriever', temperament: 'Amigable, activo', origin: 'Canada' },
  { id: 'border_collie', name: 'Border Collie', temperament: 'Inteligente, energico', origin: 'Reino Unido' },
  { id: 'german_shepherd', name: 'Pastor Aleman', temperament: 'Leal, protector', origin: 'Alemania' },
  { id: 'poodle', name: 'Poodle', temperament: 'Activo, alerta', origin: 'Francia' },
  { id: 'golden', name: 'Golden Retriever', temperament: 'Dulce, obediente', origin: 'Escocia' }
];

const CURATED_VETS: VetProfile[] = [
  { id: 'vet-1', name: 'Dra. Camila Herrera', specialty: 'Medicina general', available: true },
  { id: 'vet-2', name: 'Dr. Felipe Ortega', specialty: 'Cirugia y trauma', available: true },
  { id: 'vet-3', name: 'Dra. Isabel Mendez', specialty: 'Dermatologia veterinaria', available: false },
  { id: 'vet-4', name: 'Dr. Tomas Silva', specialty: 'Odontologia veterinaria', available: true },
  { id: 'vet-5', name: 'Dra. Antonia Rios', specialty: 'Cardiologia', available: false }
];

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  fetchVets(): Observable<VetProfile[]> {
    // Retornar lista curada 100% veterinaria; se evita depender de APIs genéricas
    const vets = CURATED_VETS;
    this.cache(VETS_KEY, vets);
    return of(vets);
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
      catchError(() => {
        const cached = this.readCache<TipItem[]>(TIPS_KEY);
        return cached.length ? of(cached) : of(CURATED_TIPS);
      })
    );
  }

  fetchDogBreeds(): Observable<BreedOption[]> {
    const url = 'https://api.thedogapi.com/v1/breeds';
    return this.http.get<any[]>(url).pipe(
      map(items => {
        if (!items?.length) return CURATED_DOG_BREEDS;
        return items.map((item, idx) => ({
          id: (item.id ?? idx).toString(),
          name: item.name,
          temperament: item.temperament,
          origin: item.origin
        }) as BreedOption);
      }),
      tap(list => this.cache(DOG_BREEDS_KEY, list)),
      catchError(() => {
        const cached = this.readCache<BreedOption[]>(DOG_BREEDS_KEY);
        return cached.length ? of(cached) : of(CURATED_DOG_BREEDS);
      })
    );
  }

  private cache(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // sin acción, solo se evita romper el flujo
    }
  }

  private readCache<T>(key: string): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : ([] as unknown as T);
    } catch {
      return [] as unknown as T;
    }
  }
}
