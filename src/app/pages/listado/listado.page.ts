import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AnimationController, NavController, ToastController } from '@ionic/angular';
import { AppointmentItem } from 'src/app/shared/models/appointment.model';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: false,
})
export class ListadoPage implements OnInit {

  @ViewChildren('appointmentCard', { read: ElementRef }) appointmentCardRefs?: QueryList<ElementRef<HTMLElement>>;

  appointments: AppointmentItem[] = [];
  filteredAppointments: AppointmentItem[] = [];
  searchTerm = '';
  statusFilter: 'todos' | 'confirmada' | 'pendiente' = 'todos';

  constructor(
    private appointmentsService: AppointmentsService,
    private toastController: ToastController,
    private navController: NavController,
    private animationCtrl: AnimationController
  ) {}

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments(): Promise<void> {
    this.appointments = await this.appointmentsService.list();
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(item => {
      const matchesSearch =
        !this.searchTerm ||
        item.petName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.ownerName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === 'todos' || item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    setTimeout(() => this.animateList(), 0);
  }

  onSearchChanged(event: CustomEvent): void {
    this.searchTerm = event.detail.value ?? '';
    this.applyFilters();
  }

  onStatusChanged(event: CustomEvent): void {
    this.statusFilter = event.detail.value;
    this.applyFilters();
  }

  async goToDetail(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Vista detallada deshabilitada. Revisa los datos desde Home.',
      duration: 2000,
      icon: 'information-circle-outline'
    });
    toast.present();
  }

  async toggleFavorite(appointment: AppointmentItem): Promise<void> {
    const updated = await this.appointmentsService.toggleFavorite(appointment.id);
    if (updated) {
      // Actualizamos el appointment en la lista local para no recargar todo
      const index = this.appointments.findIndex(a => a.id === updated.id);
      if (index > -1) {
        this.appointments[index] = updated;
        this.applyFilters(); // Re-aplicar filtros para actualizar la vista
      }

      const toast = await this.toastController.create({
        message: updated.favorite
          ? `${updated.petName} marcada como favorita.`
          : `${updated.petName} ya no es favorita.`,
        duration: 2000,
        icon: updated.favorite ? 'heart' : 'heart-outline'
      });
      toast.present();
    }
  }

  trackByAppointment(_index: number, item: AppointmentItem): string {
    return item.id;
  }

  private animateList(): void {
    if (!this.appointmentCardRefs) {
      return;
    }
    this.appointmentCardRefs.forEach((card, index) => {
      this.animationCtrl.create()
        .addElement(card.nativeElement)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(15px)', 'translateY(0)')
        .delay(index * 60)
        .duration(300)
        .play();
    });
  }

}
