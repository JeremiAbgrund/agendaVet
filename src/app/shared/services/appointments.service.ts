import { Injectable } from '@angular/core';
import { AppointmentItem } from '../models/appointment.model';

const APPOINTMENTS_KEY = 'agendavet_appointments';

const SEED_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'cita-101',
    petName: 'Luna',
    ownerName: 'Jeremi Riquelme',
    type: 'Vacuna anual',
    date: 'Martes 12 Nov',
    time: '11:30',
    vet: 'Dra. Camila Herrera',
    notes: 'Llegar 10 min antes',
    status: 'confirmada',
    favorite: true
  },
  {
    id: 'cita-102',
    petName: 'Milo',
    ownerName: 'Jeremi Riquelme',
    type: 'Control dental',
    date: 'Jueves 14 Nov',
    time: '15:00',
    vet: 'Dr. Ortega',
    status: 'pendiente'
  },
  {
    id: 'cita-103',
    petName: 'Canela',
    ownerName: 'Fernanda Soto',
    type: 'Baño medicado',
    date: 'Viernes 15 Nov',
    time: '09:30',
    vet: 'Dra. Rivas',
    status: 'confirmada'
  },
  {
    id: 'cita-104',
    petName: 'Rocky',
    ownerName: 'Pablo Vera',
    type: 'Cirugía menor',
    date: 'Viernes 15 Nov',
    time: '14:30',
    vet: 'Dr. Márquez',
    status: 'pendiente'
  },
  {
    id: 'cita-105',
    petName: 'Gaia',
    ownerName: 'Loreto Díaz',
    type: 'Ecografía',
    date: 'Sábado 16 Nov',
    time: '12:00',
    vet: 'Dra. Romero',
    status: 'confirmada'
  },
  {
    id: 'cita-106',
    petName: 'Neko',
    ownerName: 'Diego Araya',
    type: 'Chequeo general',
    date: 'Domingo 17 Nov',
    time: '10:45',
    vet: 'Dr. Molina',
    status: 'confirmada'
  },
  {
    id: 'cita-107',
    petName: 'Kiara',
    ownerName: 'Paula Gutiérrez',
    type: 'Desparasitación',
    date: 'Lunes 18 Nov',
    time: '09:00',
    vet: 'Dra. Herrera',
    status: 'pendiente'
  },
  {
    id: 'cita-108',
    petName: 'Bongo',
    ownerName: 'Leo Muñoz',
    type: 'Radiografía',
    date: 'Lunes 18 Nov',
    time: '13:00',
    vet: 'Dr. Ortega',
    status: 'confirmada'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  private readAppointments(): AppointmentItem[] {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      localStorage.removeItem(APPOINTMENTS_KEY);
    }
    this.writeAppointments(SEED_APPOINTMENTS);
    return SEED_APPOINTMENTS;
  }

  private writeAppointments(data: AppointmentItem[]): void {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(data));
  }

  list(): AppointmentItem[] {
    return this.readAppointments();
  }

  getById(id: string): AppointmentItem | undefined {
    return this.readAppointments().find(item => item.id === id);
  }

  toggleFavorite(id: string): AppointmentItem | undefined {
    const appointments = this.readAppointments();
    const appointment = appointments.find(item => item.id === id);
    if (appointment) {
      appointment.favorite = !appointment.favorite;
      this.writeAppointments(appointments);
    }
    return appointment;
  }

  createAppointment(data: Omit<AppointmentItem, 'id'>): AppointmentItem {
    const appointments = this.readAppointments();
    const newAppointment: AppointmentItem = {
      ...data,
      id: `cita-${Date.now()}-${Math.floor(Math.random() * 999)}`
    };
    appointments.unshift(newAppointment);
    this.writeAppointments(appointments);
    return newAppointment;
  }

  updateAppointment(id: string, changes: Partial<AppointmentItem>): AppointmentItem | undefined {
    const appointments = this.readAppointments();
    const appointment = appointments.find(item => item.id === id);
    if (appointment) {
      Object.assign(appointment, changes);
      this.writeAppointments(appointments);
    }
    return appointment;
  }

  deleteAppointment(id: string): void {
    const appointments = this.readAppointments().filter(item => item.id !== id);
    this.writeAppointments(appointments);
  }
}
