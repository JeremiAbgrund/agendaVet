import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AppointmentItem } from 'src/app/shared/models/appointment.model';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';

@Component({
  selector: 'app-gestionar-citas',
  templateUrl: './gestionar-citas.page.html',
  styleUrls: ['./gestionar-citas.page.scss'],
  standalone: false,
})
export class GestionarCitasPage implements OnInit {

  appointments: AppointmentItem[] = [];

  constructor(
    private appointmentsService: AppointmentsService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointments = this.appointmentsService.list();
  }

  async postponeAppointment(item: AppointmentItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Posponer cita',
      message: `${item.petName} · ${item.type}`,
      inputs: [
        { name: 'date', type: 'date', value: item.date },
        { name: 'time', type: 'time', value: item.time }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: data => {
            if (!data.date || !data.time) {
              return false;
            }
            this.appointmentsService.updateAppointment(item.id, {
              date: data.date,
              time: data.time
            });
            this.loadAppointments();
            this.presentToast('Cita actualizada');
            return true;
          }
        }
      ]
    });
    alert.present();
  }

  async deleteAppointment(item: AppointmentItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar cita',
      message: `¿Deseas eliminar la cita de ${item.petName}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.appointmentsService.deleteAppointment(item.id);
            this.loadAppointments();
            this.presentToast('Cita eliminada');
          }
        }
      ]
    });
    alert.present();
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }
}
