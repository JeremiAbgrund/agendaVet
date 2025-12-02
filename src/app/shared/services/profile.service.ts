import { Injectable } from '@angular/core';
import { PetProfile, UserProfile } from '../models/profile.model';
import { StorageService } from './storage.service';

const PROFILE_KEY = 'agendavet_profile';

const DEFAULT_PROFILE: UserProfile = {
  ownerName: 'Jeremi Riquelme',
  email: 'jeremi@agendavet.cl',
  phone: '+56 9 1111 2222',
  clinic: 'Clinica Patitas Felices',
  notifications: {
    email: true,
    sms: false,
    push: true
  },
  vets: [
    { id: 'vet-1', name: 'Dra. Camila Herrera', specialty: 'Medicina general', available: true },
    { id: 'vet-2', name: 'Dr. Ortega', specialty: 'Odontologia', available: true },
    { id: 'vet-3', name: 'Dra. Rivas', specialty: 'Dermatologia', available: false },
    { id: 'vet-4', name: 'Dr. Marquez', specialty: 'Cirugia', available: true },
    { id: 'vet-5', name: 'Dra. Romero', specialty: 'Imagenes', available: true },
    { id: 'vet-6', name: 'Dr. Molina', specialty: 'Control general', available: false },
    { id: 'vet-7', name: 'Dra. Herrera', specialty: 'Rehabilitacion', available: true },
    { id: 'vet-8', name: 'Dr. Salinas', specialty: 'Urgencias', available: true }
  ],
  pets: [
    { id: 'pet-1', name: 'Luna', species: 'gato', breed: 'Siamesa', birthdate: '2021-03-18', favorite: true },
    { id: 'pet-2', name: 'Milo', species: 'perro', breed: 'Border Collie', birthdate: '2020-09-05' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profile: UserProfile = DEFAULT_PROFILE;
  readonly ready: Promise<void>;

  constructor(private storageService: StorageService) {
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      const stored = await this.storageService.get<UserProfile>(PROFILE_KEY);
      this.profile = stored ? this.normalize(stored) : DEFAULT_PROFILE;
      if (!stored) {
        await this.storageService.set(PROFILE_KEY, this.profile);
      }
    } catch {
      this.profile = DEFAULT_PROFILE;
    }
  }

  private normalize(profile: UserProfile): UserProfile {
    return {
      ...profile,
      vets: profile.vets && profile.vets.length ? profile.vets : DEFAULT_PROFILE.vets
    };
  }

  getProfile(): UserProfile {
    return this.profile;
  }

  updateProfile(profile: UserProfile): void {
    this.profile = this.normalize(profile);
    this.storageService.set(PROFILE_KEY, this.profile);
  }

  upsertPet(pet: PetProfile): UserProfile {
    const current = { ...this.profile, pets: [...this.profile.pets] };
    const index = current.pets.findIndex(p => p.id === pet.id);
    if (index >= 0) {
      current.pets[index] = pet;
    } else {
      current.pets.push(pet);
    }
    this.updateProfile(current);
    return current;
  }
}
