import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AlertController, AnimationController, NavController, ToastController } from '@ionic/angular';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { ApiService, TipItem } from 'src/app/shared/services/api.service';
import { UserProfile } from 'src/app/shared/models/profile.model';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  route: string;
}

// Se mantiene para la data hardcodeada de la UI
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

  userProfile?: UserProfile;

  stats = [
    { label: 'Citas este mes', value: 0, icon: 'calendar-outline', color: 'tertiary' },
    { label: 'Mascotas', value: 0, icon: 'paw-outline', color: 'success' },
    { label: 'Notas pendientes', value: 0, icon: 'alert-circle-outline', color: 'warning' }
  ];

  // Datos que aun son mocked en esta pagina
  nextAppointment: Appointment = {
    petName: 'Luna',
    type: 'Control general + Vacuna',
    date: 'Martes 12 noviembre',
    time: '11:30 hrs',
    vet: 'Dra. Camila Herrera',
    location: 'Sala 2 - Sucursal Providencia',
    notes: 'Llegar 10 min antes y llevar carnet sanitario.',
    status: 'confirmada'
  };
  reminders = [
    { id: 'rem-1', pet: 'Milo', task: 'Bano antipulgas', due: 'Hoy 17:00', icon: 'water-outline', done: false },
    { id: 'rem-2', pet: 'Luna', task: 'Recordar medicamentos', due: 'Manana 08:00', icon: 'medkit-outline', done: false },
  ];
  remindersMuted = false;
  remoteTips: TipItem[] = [];
  remoteTipsFromCache = false;
  upcomingAppointments: Appointment[] = [
    { petName: 'Milo', type: 'Odontologia preventiva', date: 'Jueves 14 - 15:00', time: '15:00', vet: 'Dr. Ortega', location: 'Sala Dental', notes: 'Ayuno de 6 horas', status: 'pendiente' },
    { petName: 'Luna', type: 'Control post operatorio', date: 'Viernes 15 - 10:00', time: '10:00', vet: 'Dra. Herrera', location: 'Sala Recuperacion', notes: 'Revisar suturas', status: 'confirmada' }
  ];
  quickActions: QuickAction[] = [
    { label: 'Nueva cita', icon: 'add-circle-outline', color: 'primary', route: '/nueva-cita' },
    { label: 'Contactar vet', icon: 'chatbubbles-outline', color: 'secondary', route: '/contacto' },
    { label: 'Historial', icon: 'time-outline', color: 'tertiary', route: '/historial' },
    { label: 'Mi perfil', icon: 'person-circle-outline', color: 'warning', route: '/perfil' }
  ];


  constructor(
    private animationCtrl: AnimationController,
    private appointmentsService: AppointmentsService,
    private navController: NavController,
    private profileService: ProfileService,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    await Promise.all([this.appointmentsService.ready, this.profileService.ready]);
    this.userProfile = this.profileService.getProfile();
    await this.loadStats();
    this.loadRemoteTips();
  }

  handleRefresh(event: CustomEvent): void {
    setTimeout(async () => {
      await this.loadStats(true);
      this.loadRemoteTips();
      event.detail.complete();
    }, 800);
  }

  ionViewDidEnter(): void {
    this.animateHero();
    this.animateStats();
    this.loadStats(true);
  }

  private animateHero(): void {
    if (!this.heroBlock) return;
    this.animationCtrl.create()
      .addElement(this.heroBlock.nativeElement)
      .duration(500).easing('ease-out').fromTo('transform', 'translateY(20px)', 'translateY(0)').fromTo('opacity', '0', '1').play();
  }

  private animateStats(): void {
    if (!this.statCards) return;
    this.statCards.forEach((card, index) => {
      this.animationCtrl.create()
        .addElement(card.nativeElement)
        .delay(index * 80).duration(400).fromTo('transform', 'scale(0.9)', 'scale(1)').fromTo('opacity', '0', '1').play();
    });
  }

  handleQuickAction(action: QuickAction): void {
    this.navController.navigateForward(action.route);
  }

  goHome(): void {
    this.navController.navigateRoot('/home');
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
            if (!data.pet || !data.task || !data.date || !data.time) return false;
            this.reminders.push({ id: `rem-${Date.now()}`, pet: data.pet, task: data.task, due: `${new Date(data.date).toLocaleDateString('es-CL')} - ${data.time}`, icon: 'notifications-outline', done: false });
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
      header: 'Eliminar recordatorio?',
      message: 'Esta accion no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
            this.reminders = this.reminders.filter(r => r.id !== reminderId);
            this.updatePendingNotes();
        }}
      ]
    });
    alert.present();
  }

  private async loadStats(refreshAppointments = false): Promise<void> {
    if (refreshAppointments) {
      this.stats[0].value = (await this.appointmentsService.list()).length;
    }
    const profile = this.profileService.getProfile();
    if (profile) {
      this.userProfile = profile;
      this.stats[1].value = profile.pets.length;
    }
    this.updatePendingNotes();
  }

  private updatePendingNotes(): void {
    this.stats[2].value = this.reminders.filter(r => !r.done).length;
  }

  private loadRemoteTips(): void {
    this.apiService.fetchTips().subscribe(tips => {
      this.remoteTips = tips;
      this.remoteTipsFromCache = !navigator.onLine || !tips?.length;
    });
  }
}

















