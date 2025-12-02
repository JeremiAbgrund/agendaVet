import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ProfileService } from 'src/app/shared/services/profile.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage {

  readonly USER_KEY = 'agendavet_user';
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
    private profileService: ProfileService
  ) {}

  async registrar(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { ownerName, email, password, clinic, phone } = this.registerForm.getRawValue();

    const newUser = {
      name: ownerName,
      email,
      password,
      clinic: clinic?.trim() || undefined,
      phone: phone?.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ email, timestamp: new Date().toISOString() }));

    const currentProfile = this.profileService.getProfile();
    this.profileService.updateProfile({
      ...currentProfile,
      ownerName,
      email,
      clinic: clinic?.trim() || currentProfile.clinic,
      phone: phone?.trim() || currentProfile.phone
    });

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
