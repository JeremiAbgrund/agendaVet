import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { PetProfile, UserProfile } from 'src/app/shared/models/profile.model';
import { ProfileService } from 'src/app/shared/services/profile.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,
})
export class PerfilPage implements OnInit {

  profile?: UserProfile;
  isSaving = false;

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

  ngOnInit() {
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
