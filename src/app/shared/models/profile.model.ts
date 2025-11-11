export interface PetProfile {
  id: string;
  name: string;
  species: 'perro' | 'gato' | 'ave' | 'otro';
  breed?: string;
  birthdate?: string;
  favorite?: boolean;
}

export interface UserProfile {
  ownerName: string;
  email: string;
  phone: string;
  clinic: string;
  vets: VetProfile[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  pets: PetProfile[];
}

export interface VetProfile {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}
