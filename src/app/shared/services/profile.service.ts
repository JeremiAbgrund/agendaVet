import { Injectable } from '@angular/core';
import { PetProfile, UserProfile } from '../models/profile.model';

const PROFILE_KEY = 'agendavet_profile';

const DEFAULT_PROFILE: UserProfile = {
  ownerName: 'Jeremi Riquelme',
  email: 'jeremi@agendavet.cl',
  phone: '+56 9 1111 2222',
  clinic: 'Clínica Patitas Felices',
  notifications: {
    email: true,
    sms: false,
    push: true
  },
  vets: [
    { id: 'vet-1', name: 'Dra. Camila Herrera', specialty: 'Medicina general', available: true },
    { id: 'vet-2', name: 'Dr. Ortega', specialty: 'Odontología', available: true },
    { id: 'vet-3', name: 'Dra. Rivas', specialty: 'Dermatología', available: false },
    { id: 'vet-4', name: 'Dr. Márquez', specialty: 'Cirugía', available: true },
    { id: 'vet-5', name: 'Dra. Romero', specialty: 'Imágenes', available: true },
    { id: 'vet-6', name: 'Dr. Molina', specialty: 'Control general', available: false },
    { id: 'vet-7', name: 'Dra. Herrera', specialty: 'Rehabilitación', available: true },
    { id: 'vet-8', name: 'Dr. Salinas', specialty: 'Urgencias', available: true }
  ],
  pets: [
    {
      id: 'pet-1',
      name: 'Luna',
      species: 'gato',
      breed: 'Siamesa',
      birthdate: '2021-03-18',
      favorite: true
    },
    {
      id: 'pet-2',
      name: 'Milo',
      species: 'perro',
      breed: 'Border Collie',
      birthdate: '2020-09-05'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private normalize(profile: UserProfile): UserProfile {
    return {
      ...profile,
      vets: profile.vets && profile.vets.length ? profile.vets : DEFAULT_PROFILE.vets
    };
  }

  private readProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? this.normalize(JSON.parse(stored)) : DEFAULT_PROFILE;
    } catch {
      localStorage.removeItem(PROFILE_KEY);
      return DEFAULT_PROFILE;
    }
  }

  getProfile(): UserProfile {
    return this.readProfile();
  }

  updateProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.normalize(profile)));
  }

  upsertPet(pet: PetProfile): UserProfile {
    const profile = this.readProfile();
    const index = profile.pets.findIndex(p => p.id === pet.id);
    if (index >= 0) {
      profile.pets[index] = pet;
    } else {
      profile.pets.push(pet);
    }
    this.updateProfile(profile);
    return profile;
  }
}
