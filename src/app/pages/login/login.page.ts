import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { filter, firstValueFrom } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  readonly SESSION_KEY = 'agendavet_session';
  isSubmitting = false;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
    acceptTerms: [false, Validators.requiredTrue]
  });

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private databaseService: DatabaseService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    await this.restoreCachedSession();
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return !!control && control.invalid && control.touched;
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!control && control.invalid && control.touched;
  }

  get termsInvalid(): boolean {
    const control = this.loginForm.get('acceptTerms');
    return !!control && control.invalid && control.touched;
  }

  fillDemoCredentials(): void {
    // Rellenar credenciales demo (normalizar correo)
    this.loginForm.patchValue({
      email: 'demo@agendavet.cl',
      password: 'ClaveDemo1',
      acceptTerms: true
    });
    const emailCtrl = this.loginForm.get('email');
    if (emailCtrl) {
      emailCtrl.setValue((emailCtrl.value ?? '').toString().trim().toLowerCase());
    }
  }

  async onSubmit(): Promise<void> {
    // Validar formulario y mostrar mensajes específicos en caso de campos inválidos
    if (this.loginForm.invalid) {
      if (this.loginForm.get('acceptTerms')?.invalid) {
        const toast = await this.toastController.create({
          message: 'Debes aceptar los términos y condiciones para continuar.',
          duration: 2500,
          color: 'warning',
          icon: 'warning-outline'
        });
        toast.present();
      } else if (this.loginForm.get('email')?.invalid) {
        const toast = await this.toastController.create({
          message: 'Introduce un correo electrónico válido.',
          duration: 2500,
          color: 'warning',
          icon: 'mail-unread-outline'
        });
        toast.present();
      } else if (this.loginForm.get('password')?.invalid) {
        const toast = await this.toastController.create({
          message: 'La contraseña debe tener al menos 6 caracteres.',
          duration: 2500,
          color: 'warning',
          icon: 'lock-closed-outline'
        });
        toast.present();
      }
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Esperar a que la base de datos esté lista
    await firstValueFrom(this.databaseService.getDatabaseState().pipe(filter(isReady => isReady)));

    const { password, remember } = this.loginForm.getRawValue();
    const email = (this.loginForm.get('email')?.value ?? '').toString().trim().toLowerCase();

    const user = await this.databaseService.getUserByEmail(email);

    if (!user || user.password_hash !== password) {
      this.isSubmitting = false;
      const toast = await this.toastController.create({
        message: 'Correo o contraseña incorrectos.',
        duration: 2500,
        color: 'danger',
        icon: 'alert-circle-outline'
      });
      toast.present();
      return;
    }

    if (remember) {
      // Conserva la sesi¢n en almacenamiento web para auto-rellenar
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify({ email, timestamp: new Date().toISOString(), remember })
      );
    }

    await this.persistSession(email, remember);

    this.isSubmitting = false;

    const toast = await this.toastController.create({
      message: 'Login exitoso. ¡Bienvenido a AgendaVet!',
      duration: 2000,
      color: 'success',
      icon: 'paw-outline'
    });
    toast.present();

    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private async restoreCachedSession(): Promise<void> {
    const stored = await this.storageService.get<{ email?: string; remember?: boolean; expiresAt?: string }>(this.SESSION_KEY);
    const session = stored ?? this.readLegacySession();

    if (session?.email) {
      this.loginForm.patchValue({
        email: session.email.toString().trim().toLowerCase(),
        remember: session.remember ?? true
      });
    }
  }

  private readLegacySession(): { email?: string; remember?: boolean } | null {
    const cached = localStorage.getItem(this.SESSION_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  private async persistSession(email: string, remember: boolean): Promise<void> {
    const now = new Date();
    const expiresAt = remember ? undefined : new Date(now.getTime() + (12 * 60 * 60 * 1000)).toISOString(); // 12 horas
    await this.storageService.set(this.SESSION_KEY, { email, timestamp: now.toISOString(), remember, expiresAt });
  }

}
