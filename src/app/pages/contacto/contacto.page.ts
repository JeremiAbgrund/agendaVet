import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { SupportRequest } from 'src/app/shared/models/support-request.model';
import { SupportService } from 'src/app/shared/services/support.service';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: false,
})
export class ContactoPage implements OnInit {

  readonly MAX_MESSAGE_LENGTH = 400;
  isSubmitting = false;

  topics = [
    { value: 'agendamiento' as const, label: 'Agendamiento' },
    { value: 'facturacion' as const, label: 'Facturación' },
    { value: 'tecnico' as const, label: 'Soporte técnico' },
    { value: 'sugerencia' as const, label: 'Sugerencia' }
  ];

  channels = [
    { value: 'email' as const, label: 'Correo electrónico' },
    { value: 'telefono' as const, label: 'Llamada telefónica' }
  ];

  supportHistory: SupportRequest[] = [];

  contactForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9+\s-]{6,15}$/)]],
    topic: [this.topics[0].value, Validators.required],
    preferredChannel: [this.channels[0].value, Validators.required],
    ccCopy: [false],
    message: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(this.MAX_MESSAGE_LENGTH)]]
  });

  faqs = [
    {
      question: '¿Cuánto tardan en responder?',
      answer: 'Nuestro tiempo de respuesta promedio es de menos de 24 horas hábiles.'
    },
    {
      question: '¿Dónde veo mis solicitudes anteriores?',
      answer: 'En la sección de historial podrás revisar las últimas solicitudes enviadas desde la app.'
    },
    {
      question: '¿Puedo reagendar una cita desde aquí?',
      answer: 'Sí, selecciona el tipo de consulta "Agendamiento" y cuéntanos la nueva disponibilidad.'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.supportHistory = this.supportService.getHistory().slice(0, 3);
  }

  get remainingChars(): number {
    return this.MAX_MESSAGE_LENGTH - (this.contactForm.get('message')?.value?.length ?? 0);
  }

  async submit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { phone, ...rest } = this.contactForm.getRawValue();

    try {
      const newRequest = await this.supportService.submitRequest({
        ...rest,
        phone: phone?.trim() ? phone : undefined
      });

      this.supportHistory = [newRequest, ...this.supportHistory].slice(0, 3);
      this.contactForm.reset({
        topic: this.topics[0].value,
        preferredChannel: this.channels[0].value
      });

      const toast = await this.toastController.create({
        message: 'Hemos recibido tu solicitud, te contactaremos pronto.',
        duration: 2500,
        color: 'success',
        icon: 'checkmark-circle-outline'
      });
      toast.present();
    } catch {
      const toast = await this.toastController.create({
        message: 'Ocurrió un error inesperado. Inténtalo nuevamente.',
        duration: 2500,
        color: 'danger',
        icon: 'alert-circle-outline'
      });
      toast.present();
    } finally {
      this.isSubmitting = false;
    }
  }

}
