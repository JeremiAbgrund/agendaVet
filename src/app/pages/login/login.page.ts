import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
    private router: Router
  ) {}

  ngOnInit() {
    const cached = localStorage.getItem(this.SESSION_KEY);
    if (cached) {
      try {
        const session = JSON.parse(cached);
        this.loginForm.patchValue({
          email: session.email ?? '',
          remember: true
        });
      } catch {
        // si hay basura en el storage, lo ignoramos
        localStorage.removeItem(this.SESSION_KEY);
      }
    }
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
    this.loginForm.patchValue({
      email: 'demo@agendavet.cl',
      password: 'ClaveDemo1',
      acceptTerms: true
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, remember } = this.loginForm.getRawValue();

    // Simula un request
    await new Promise(resolve => setTimeout(resolve, 800));

    if (remember) {
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify({ email, timestamp: new Date().toISOString() })
      );
    } else {
      localStorage.removeItem(this.SESSION_KEY);
    }

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

}
