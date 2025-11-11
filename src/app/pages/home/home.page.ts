import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AlertController, AnimationController, NavController, ToastController } from '@ionic/angular';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  route: string;
}

interface Appointment {
  petName: string;
  type: string;
  date: string;
  time: string;
  vet: string;
  location: string;
  notes: string;
  status?: 'confirmada' | 'pendiente';
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  @ViewChild('heroBlock', { read: ElementRef }) heroBlock?: ElementRef<HTMLElement>;
  @ViewChildren('statCard', { read: ElementRef }) statCards?: QueryList<ElementRef<HTMLElement>>;

  user = {
    name: 'Jeremi',
    clinic: 'Clínica Patitas Felices',
    pets: 2,
    avatar: 'assets/img/pet-avatar.svg'
  };

  stats = [
    { label: 'Citas este mes', value: 0, icon: 'calendar-outline', color: 'tertiary' },
    { label: 'Vacunas al día', value: 0, icon: 'shield-checkmark-outline', color: 'success' },
    { label: 'Notas pendientes', value: 0, icon: 'alert-circle-outline', color: 'warning' }
  ];
  appointmentsCount = 0;
  vaccinesCount = 0;
  pendingNotesCount = 0;
  nextAppointment: Appointment = {
    petName: 'Luna',
    type: 'Control general + Vacuna',
    date: 'Martes 12 noviembre',
    time: '11:30 hrs',
    vet: 'Dra. Camila Herrera',
    location: 'Sala 2 · Sucursal Providencia',
    notes: 'Llegar 10 min antes y llevar carnet sanitario.',
    status: 'confirmada'
  };

  quickActions: QuickAction[] = [
    { label: 'Nueva cita', icon: 'add-circle-outline', color: 'primary', route: '/nueva-cita' },
    { label: 'Contactar vet', icon: 'chatbubbles-outline', color: 'secondary', route: '/contacto' },
    { label: 'Historial', icon: 'time-outline', color: 'tertiary', route: '/historial' },
    { label: 'Mi perfil', icon: 'person-circle-outline', color: 'warning', route: '/perfil' }
  ];

  reminders = [
    { id: 'rem-1', pet: 'Milo', task: 'Baño antipulgas', due: 'Hoy 17:00', icon: 'water-outline', done: false },
    { id: 'rem-2', pet: 'Luna', task: 'Recordar medicamentos', due: 'Mañana 08:00', icon: 'medkit-outline', done: false },
  ];
  remindersMuted = false;

  upcomingAppointments: Appointment[] = [
    {
      petName: 'Milo',
      type: 'Odontología preventiva',
      date: 'Jueves 14 · 15:00',
      time: '15:00',
      vet: 'Dr. Ortega',
      location: 'Sala Dental',
      notes: 'Ayuno de 6 horas',
      status: 'pendiente'
    },
    {
      petName: 'Luna',
      type: 'Control post operatorio',
      date: 'Viernes 15 · 10:00',
      time: '10:00',
      vet: 'Dra. Herrera',
      location: 'Sala Recuperación',
      notes: 'Revisar suturas',
      status: 'confirmada'
    }
  ];

  constructor(
    private animationCtrl: AnimationController,
    private appointmentsService: AppointmentsService,
    private toastController: ToastController,
    private navController: NavController,
    private profileService: ProfileService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  handleRefresh(event: CustomEvent): void {
    setTimeout(() => {
      event.detail.complete();
    }, 800);
  }

  ionViewDidEnter(): void {
    this.animateHero();
    this.animateStats();
  }

  private animateHero(): void {
    if (!this.heroBlock) {
      return;
    }
    this.animationCtrl.create()
      .addElement(this.heroBlock.nativeElement)
      .duration(500)
      .easing('ease-out')
      .fromTo('transform', 'translateY(20px)', 'translateY(0)')
      .fromTo('opacity', '0', '1')
      .play();
  }

  private animateStats(): void {
    if (!this.statCards) {
      return;
    }
    this.statCards.forEach((card, index) => {
      this.animationCtrl.create()
        .addElement(card.nativeElement)
        .delay(index * 80)
        .duration(400)
        .fromTo('transform', 'scale(0.9)', 'scale(1)')
        .fromTo('opacity', '0', '1')
        .play();
    });
  }

  handleQuickAction(action: QuickAction): void {
    this.navController.navigateForward(action.route);
  }

  toggleReminder(reminder: { done: boolean }, event: CustomEvent): void {
    reminder.done = event.detail.checked;
    this.updatePendingNotes();
  }

  toggleMuteReminders(): void {
    this.remindersMuted = !this.remindersMuted;
  }

  async addReminderPrompt(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nuevo recordatorio',
      inputs: [
        { name: 'pet', type: 'text', placeholder: 'Nombre mascota' },
        { name: 'task', type: 'text', placeholder: 'Actividad' },
        { name: 'date', type: 'date', placeholder: 'Fecha' },
        { name: 'time', type: 'time', placeholder: 'Hora' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: data => {
            if (!data.pet || !data.task || !data.date || !data.time) {
              return false;
            }
            this.reminders.push({
              id: `rem-${Date.now()}`,
              pet: data.pet,
              task: data.task,
              due: `${new Date(data.date).toLocaleDateString('es-CL')} · ${data.time}`,
              icon: 'notifications-outline',
              done: false
            });
            this.updatePendingNotes();
            return true;
          }
        }
      ]
    });
    alert.present();
  }

  async removeReminder(reminderId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Eliminar recordatorio?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.reminders = this.reminders.filter(r => r.id !== reminderId);
            this.updatePendingNotes();
          }
        }
      ]
    });
    alert.present();
  }

  private loadStats(refreshAppointments = false): void {
    if (refreshAppointments) {
      this.appointmentsCount = this.appointmentsService.list().length;
    } else if (!this.appointmentsCount) {
      this.appointmentsCount = this.appointmentsService.list().length;
    }
    if (!this.vaccinesCount) {
      this.vaccinesCount = this.profileService.getProfile().pets.length;
    }
    this.updatePendingNotes();
  }

  private updatePendingNotes(): void {
    this.pendingNotesCount = this.reminders.filter(r => !r.done).length;
    this.updateStatsArray();
  }

  private updateStatsArray(): void {
    this.stats[0].value = this.appointmentsCount;
    this.stats[1].value = this.vaccinesCount;
    this.stats[2].value = this.pendingNotesCount;
  }

}
