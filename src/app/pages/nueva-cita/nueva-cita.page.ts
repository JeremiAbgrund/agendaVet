import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { UserProfile, VetProfile } from 'src/app/shared/models/profile.model';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-nueva-cita',
  templateUrl: './nueva-cita.page.html',
  styleUrls: ['./nueva-cita.page.scss'],
  standalone: false,
})
export class NuevaCitaPage implements OnInit {

  vets: VetProfile[] = [];
  createForm = this.fb.nonNullable.group({
    petName: ['', Validators.required],
    ownerName: ['', Validators.required],
    type: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    vet: ['', Validators.required],
    notes: ['']
  });

  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService,
    private profileService: ProfileService,
    private toastController: ToastController,
    private navController: NavController,
    private apiService: ApiService
  ) { }

  async ngOnInit() {
    await this.profileService.ready;
    const profile = this.profileService.getProfile();
    if (profile) {
      this.vets = profile.vets;
      this.createForm.patchValue({
        ownerName: profile.ownerName,
        vet: profile.vets[0]?.name ?? ''
      });
    }

    this.loadVetsFromApi();
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  async submit(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const value = this.createForm.getRawValue();
    await this.appointmentsService.createAppointment({
      petName: value.petName,
      ownerName: value.ownerName,
      type: value.type,
      date: value.date,
      time: value.time,
      vet: value.vet,
      status: 'pendiente',
      notes: value.notes ?? ''
    });

    const toast = await this.toastController.create({
      message: 'Cita creada correctamente.',
      duration: 2000,
      icon: 'calendar-outline',
      color: 'success'
    });
    toast.present();
    this.navController.navigateBack('/listado');
  }

  private async loadVetsFromApi(): Promise<void> {
    const vets = await firstValueFrom(this.apiService.fetchVets());
    if (vets && vets.length) {
      this.vets = vets;
      this.createForm.patchValue({ vet: vets[0].name });

      const profile = this.profileService.getProfile();
      if (profile) {
        const profileToSave: UserProfile = { ...profile, vets };
        await this.profileService.updateProfile(profileToSave);
      }
    }
  }

}
