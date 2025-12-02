import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { PetProfile, UserProfile } from 'src/app/shared/models/profile.model';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {

  profile?: UserProfile;
  isSaving = false;
  locationNote = '';
  locationLabel = '';
  map?: any;
  marker?: any;

  profileForm = this.fb.nonNullable.group({
    ownerName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
    clinic: ['', Validators.required],
    notifications: this.fb.group({
      email: [true],
      sms: [false],
      push: [true]
    }),
    pets: this.fb.array([])
  });

  get petsFormArray(): FormArray {
    return this.profileForm.get('pets') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.profileService.ready;
    this.profile = this.profileService.getProfile();
    this.profileForm.patchValue({
      ownerName: this.profile.ownerName,
      email: this.profile.email,
      phone: this.profile.phone,
      clinic: this.profile.clinic,
      notifications: this.profile.notifications
    });
    this.profile.pets.forEach(pet => this.addPetForm(pet));
  }

  async setLocation(): Promise<void> {
    const fallback = { lat: -33.4489, lng: -70.6693 }; // Respaldo demo (Santiago)
    const setCoords = (lat: number, lng: number, prefix = 'Ubicacion guardada'): void => {
      const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      this.locationNote = `${prefix}: ${coords}`;
      const clinicValue = this.profileForm.get('clinic')?.value?.toString().trim();
      if (!clinicValue) {
        this.profileForm.patchValue({ clinic: `Ubicacion ${coords}` });
      }
      this.locationLabel = '';
      this.reverseGeocode(lat, lng);
      this.renderMap(lat, lng);
    };

    // En dispositivo usar plugin; en web usar geolocalizador del navegador.
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location === 'denied' || perm.location === 'prompt-with-rationale') {
          setCoords(fallback.lat, fallback.lng, 'Permiso de ubicacion denegado. Usando coords demo');
          return;
        }
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        setCoords(position.coords.latitude, position.coords.longitude);
        return;
      } catch {
        setCoords(fallback.lat, fallback.lng, 'No se pudo obtener la ubicacion (plugin). Usando coords demo');
        return;
      }
    } else {
      if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setCoords(pos.coords.latitude, pos.coords.longitude),
          () => setCoords(fallback.lat, fallback.lng, 'No se pudo obtener la ubicacion (web). Usando coords demo')
        );
        return;
      }
      setCoords(fallback.lat, fallback.lng, 'No se pudo obtener la ubicacion (sin API). Usando coords demo');
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      this.locationLabel = data?.display_name ?? '';
    } catch {
      this.locationLabel = '';
    }
  }

  private renderMap(lat: number, lng: number): void {
    setTimeout(() => {
      if (!this.map) {
        this.map = L.map('profile-map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(this.map);
      } else {
        this.map.setView([lat, lng], 15);
      }
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.circleMarker([lat, lng], { radius: 8, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.8 }).addTo(this.map);
    }, 100);
  }

  private createPetForm(pet?: PetProfile) {
    return this.fb.nonNullable.group({
      id: [pet?.id ?? `pet-${Date.now()}`],
      name: [pet?.name ?? '', Validators.required],
      species: [pet?.species ?? 'perro', Validators.required],
      breed: [pet?.breed ?? ''],
      birthdate: [pet?.birthdate ?? ''],
      favorite: [pet?.favorite ?? false]
    });
  }

  addPetForm(pet?: PetProfile): void {
    this.petsFormArray.push(this.createPetForm(pet));
  }

  async removePet(index: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar mascota',
      message: '¿Seguro que deseas remover esta mascota del perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.petsFormArray.removeAt(index)
        }
      ]
    });
    alert.present();
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.profileForm.getRawValue();
    const pets = this.petsFormArray.controls.map(ctrl => ctrl.value as PetProfile);
    const profileToSave: UserProfile = {
      ownerName: formValue.ownerName,
      email: formValue.email,
      phone: formValue.phone,
      clinic: formValue.clinic,
      notifications: formValue.notifications as UserProfile['notifications'],
      pets,
      vets: this.profile?.vets ?? this.profileService.getProfile().vets
    };
    this.profileService.updateProfile(profileToSave);
    this.profile = this.profileService.getProfile();
    this.isSaving = false;

    const toast = await this.toastController.create({
      message: 'Perfil actualizado correctamente.',
      duration: 2000,
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    toast.present();
  }

}
