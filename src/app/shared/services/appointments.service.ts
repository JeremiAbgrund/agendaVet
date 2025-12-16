import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppointmentItem } from '../models/appointment.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  // La propiedad 'ready' ahora se basa en el estado de la base de datos.
  readonly ready: Promise<void>;

  constructor(private databaseService: DatabaseService) {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await firstValueFrom(this.databaseService.getDatabaseState());
    console.log('AppointmentsService is ready');
  }

  async list(): Promise<AppointmentItem[]> {
    await this.ready;
    return this.databaseService.getAppointments();
  }

  async getById(id: string): Promise<AppointmentItem | undefined> {
    await this.ready;
    return this.databaseService.getAppointmentById(id);
  }

  async toggleFavorite(id: string): Promise<AppointmentItem | undefined> {
    await this.ready;
    const appointment = await this.getById(id);
    if (appointment) {
      const newStatus = !appointment.favorite;
      await this.databaseService.updateAppointment({ id, favorite: newStatus });
      return { ...appointment, favorite: newStatus };
    }
    return undefined;
  }

  async createAppointment(data: Omit<AppointmentItem, 'id'>): Promise<AppointmentItem> {
    await this.ready;
    const newAppointment: AppointmentItem = {
      ...data,
      id: `cita-${Date.now()}-${Math.floor(Math.random() * 999)}`
    };
    await this.databaseService.addAppointment(newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: string, changes: Partial<Omit<AppointmentItem, 'id'>>): Promise<AppointmentItem | undefined> {
    await this.ready;
    const itemToUpdate = { ...changes, id };
    await this.databaseService.updateAppointment(itemToUpdate);
    return this.getById(id);
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.ready;
    await this.databaseService.deleteAppointment(id);
  }
}
