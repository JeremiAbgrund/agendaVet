import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PetProfile, UserProfile } from '../models/profile.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profile?: UserProfile;
  readonly ready: Promise<void>;

  constructor(private databaseService: DatabaseService) {
    this.ready = this.loadProfileData();
  }

  private async loadProfileData(): Promise<void> {
    await firstValueFrom(this.databaseService.getDatabaseState());
    this.profile = await this.databaseService.getFullUserProfile();
    console.log('ProfileService is ready');
  }

  getProfile(): UserProfile | undefined {
    return this.profile;
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    await this.databaseService.saveFullUserProfile(profile);
    // Recargamos el perfil local para mantener la consistencia
    this.profile = await this.databaseService.getFullUserProfile();
  }

  async removePet(petId: string): Promise<void> {
    await this.databaseService.deletePet(petId);
    // Recargamos el perfil local para mantener la consistencia
    this.profile = await this.databaseService.getFullUserProfile();
  }
}
