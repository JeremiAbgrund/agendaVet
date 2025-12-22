import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IonModal, NavController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { UserProfile, VetProfile } from 'src/app/shared/models/profile.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraPermissionState, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-nueva-cita',
  templateUrl: './nueva-cita.page.html',
  styleUrls: ['./nueva-cita.page.scss'],
  standalone: false,
})
export class NuevaCitaPage implements OnInit {

  readonly CameraSource = CameraSource;
  @ViewChild('cameraModal') cameraModal?: IonModal;
  @ViewChild('previewVideo') previewVideo?: ElementRef<HTMLVideoElement>;

  vets: VetProfile[] = [];
  createForm = this.fb.nonNullable.group({
    petName: ['', Validators.required],
    ownerName: ['', Validators.required],
    type: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    photo: [''],
    vet: ['', Validators.required],
    species: ['perro', Validators.required],
    breed: [''],
    notes: ['']
  });
  private cameraStream?: MediaStream;
  showCameraPreview = false;
  isCapturing = false;

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
      notes: value.notes ?? '',
      avatar: value.photo || undefined
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

  async onTakePhoto(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      const allowed = await this.ensurePermissions();
      if (!allowed) return;
      await this.openCameraPreview();
      return;
    }
    await this.captureNative(CameraSource.Camera);
  }

  async onPickFromGallery(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      const dataUrl = await this.pickFromFileInput();
      if (dataUrl) {
        this.createForm.patchValue({ photo: dataUrl });
      }
      return;
    }
    await this.captureNative(CameraSource.Photos);
  }

  private async captureNative(source: CameraSource): Promise<void> {
    const allowed = await this.ensurePermissions();
    if (!allowed) return;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 70,
        promptLabelPhoto: 'Elegir de la galeria',
        promptLabelPicture: 'Tomar foto ahora',
        promptLabelCancel: 'Cancelar'
      });
      this.createForm.patchValue({ photo: photo.dataUrl ?? '' });
    } catch {
      await this.presentWarning('No se pudo abrir la cámara/galería. Intenta nuevamente o revisa permisos del dispositivo.');
    }
  }

  private pickFromFileInput(): Promise<string | null> {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  private async openCameraPreview(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      await this.presentWarning('Tu navegador no soporta captura de cámara.');
      return;
    }
    try {
      this.isCapturing = true;
      this.showCameraPreview = true;
      this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (this.previewVideo?.nativeElement) {
        this.previewVideo.nativeElement.srcObject = this.cameraStream;
        await this.previewVideo.nativeElement.play();
      }
    } catch {
      this.showCameraPreview = false;
      this.stopCameraStream();
      await this.presentWarning('No se pudo acceder a la cámara. Revisa permisos.');
    } finally {
      this.isCapturing = false;
    }
  }

  async captureSnapshot(): Promise<void> {
    if (!this.previewVideo?.nativeElement) return;
    const video = this.previewVideo.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    this.createForm.patchValue({ photo: dataUrl });
    this.closeCameraPreview();
  }

  closeCameraPreview(): void {
    this.showCameraPreview = false;
    this.stopCameraStream();
    this.cameraModal?.dismiss();
  }

  private stopCameraStream(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = undefined;
    }
  }

  private async presentWarning(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'warning'
    });
    toast.present();
  }

  private async ensurePermissions(): Promise<boolean> {
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalhost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);
    const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;
    const webAllowed = isSecure || isLocalhost;

    if (!isNative && !webAllowed) {
      const toast = await this.toastController.create({
        message: 'La c\u00e1mara solo funciona en https, localhost o la app Android/iOS. Abre la app en https o en Android.',
        duration: 3000,
        color: 'warning'
      });
      toast.present();
      return false;
    }

    // En web el plugin no expone permisos; forzamos getUserMedia para que el navegador pida acceso.
    if (!isNative) {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true });
        }
        return true;
      } catch (e) {
        const toast = await this.toastController.create({
          message: 'No se pudo solicitar permisos de c\u00e1mara en el navegador. Verifica que el sitio tenga acceso a video.',
          duration: 2500,
          color: 'warning'
        });
        toast.present();
        return false;
      }
    }

    try {
      const permissions = await Camera.requestPermissions();
      const cameraAllowed = this.isGranted(permissions.camera);
      const photosAllowed = this.isGranted(permissions.photos);

      if (cameraAllowed || photosAllowed) {
        return true;
      }

      const toast = await this.toastController.create({
        message: 'Se necesita permiso de c\u00e1mara o galer\u00eda para adjuntar fotos.',
        duration: 2500,
        color: 'warning'
      });
      toast.present();
      return false;
    } catch (e) {
      const toast = await this.toastController.create({
        message: 'No se pudo solicitar permisos de c\u00e1mara/galer\u00eda.',
        duration: 2500,
        color: 'warning'
      });
      toast.present();
      return false;
    }
  }

  private isGranted(state: CameraPermissionState | undefined): boolean {
    return state === 'granted' || state === 'limited';
  }

}
