import { Injectable } from '@angular/core';
import { AppointmentItem } from '../models/appointment.model';
import { StorageService } from './storage.service';

const APPOINTMENTS_KEY = 'agendavet_appointments';

const SEED_APPOINTMENTS: AppointmentItem[] = [
  { id: 'cita-101', petName: 'Luna', ownerName: 'Jeremi Riquelme', type: 'Vacuna anual', date: 'Martes 12 Nov', time: '11:30', vet: 'Dra. Camila Herrera', notes: 'Llegar 10 min antes', status: 'confirmada', favorite: true },
  { id: 'cita-102', petName: 'Milo', ownerName: 'Jeremi Riquelme', type: 'Control dental', date: 'Jueves 14 Nov', time: '15:00', vet: 'Dr. Ortega', status: 'pendiente' },
  { id: 'cita-103', petName: 'Canela', ownerName: 'Fernanda Soto', type: 'Bano medicado', date: 'Viernes 15 Nov', time: '09:30', vet: 'Dra. Rivas', status: 'confirmada' },
  { id: 'cita-104', petName: 'Rocky', ownerName: 'Pablo Vera', type: 'Cirugia menor', date: 'Viernes 15 Nov', time: '14:30', vet: 'Dr. Marquez', status: 'pendiente' },
  { id: 'cita-105', petName: 'Gaia', ownerName: 'Loreto Diaz', type: 'Ecografia', date: 'Sabado 16 Nov', time: '12:00', vet: 'Dra. Romero', status: 'confirmada' },
  { id: 'cita-106', petName: 'Neko', ownerName: 'Diego Araya', type: 'Chequeo general', date: 'Domingo 17 Nov', time: '10:45', vet: 'Dr. Molina', status: 'confirmada' },
  { id: 'cita-107', petName: 'Kiara', ownerName: 'Paula Gutierrez', type: 'Desparasitacion', date: 'Lunes 18 Nov', time: '09:00', vet: 'Dra. Herrera', status: 'pendiente' },
  { id: 'cita-108', petName: 'Bongo', ownerName: 'Leo Munoz', type: 'Radiografia', date: 'Lunes 18 Nov', time: '13:00', vet: 'Dr. Ortega', status: 'confirmada' }
];

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  private cache: AppointmentItem[] = SEED_APPOINTMENTS;
  readonly ready: Promise<void>;

  constructor(private storageService: StorageService) {
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      const stored = await this.storageService.get<AppointmentItem[]>(APPOINTMENTS_KEY);
      if (stored && stored.length) {
        this.cache = stored;
      } else {
        await this.persist(SEED_APPOINTMENTS);
      }
    } catch {
      this.cache = SEED_APPOINTMENTS;
    }
  }

  private async persist(data: AppointmentItem[]): Promise<void> {
    this.cache = data;
    await this.storageService.set(APPOINTMENTS_KEY, data);
  }

  list(): AppointmentItem[] {
    return this.cache;
  }

  getById(id: string): AppointmentItem | undefined {
    return this.cache.find(item => item.id === id);
  }

  toggleFavorite(id: string): AppointmentItem | undefined {
    const appointment = this.cache.find(item => item.id === id);
    if (appointment) {
      appointment.favorite = !appointment.favorite;
      this.persist([...this.cache]);
    }
    return appointment;
  }

  createAppointment(data: Omit<AppointmentItem, 'id'>): AppointmentItem {
    const newAppointment: AppointmentItem = {
      ...data,
      id: `cita-${Date.now()}-${Math.floor(Math.random() * 999)}`
    };
    this.cache = [newAppointment, ...this.cache];
    this.persist(this.cache);
    return newAppointment;
  }

  updateAppointment(id: string, changes: Partial<AppointmentItem>): AppointmentItem | undefined {
    const appointment = this.cache.find(item => item.id === id);
    if (appointment) {
      Object.assign(appointment, changes);
      this.persist([...this.cache]);
    }
    return appointment;
  }

  deleteAppointment(id: string): void {
    this.cache = this.cache.filter(item => item.id !== id);
    this.persist(this.cache);
  }
}
