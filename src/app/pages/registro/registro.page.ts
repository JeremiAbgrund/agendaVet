import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { ProfileService } from 'src/app/shared/services/profile.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage {

  readonly SESSION_KEY = 'agendavet_session';
  isSubmitting = false;

  registerForm = this.fb.nonNullable.group({
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    clinic: [''],
    phone: [''],
    acceptTerms: [false, Validators.requiredTrue]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private profileService: ProfileService,
    private databaseService: DatabaseService
  ) {}

  async registrar(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { ownerName, email, password, clinic, phone } = this.registerForm.getRawValue();

    try {
      // Guardar credenciales en la BD. Usar un hash en un proyecto real.
      await this.databaseService.addUser({ email, password_hash: password });
    } catch (e) {
      this.isSubmitting = false;
      const toast = await this.toastController.create({
        message: 'El correo electrónico ya está en uso.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
      return;
    }

    // Aún se usa para pre-rellenar el email en el login
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ email, timestamp: new Date().toISOString() }));

    const currentProfile = this.profileService.getProfile();
    if (currentProfile) {
      await this.profileService.updateProfile({
        ...currentProfile,
        ownerName,
        email,
        clinic: clinic?.trim() || currentProfile.clinic,
        phone: phone?.trim() || currentProfile.phone
      });
    }

    const toast = await this.toastController.create({
      message: 'Cuenta creada. Puedes iniciar sesión con tus datos.',
      duration: 2500,
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    toast.present();

    this.isSubmitting = false;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

}
