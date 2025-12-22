import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private readonly SESSION_KEY = 'agendavet_session';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.waitForDatabase();
    const sessionEmail = await this.readSessionEmail();
    return sessionEmail ? true : this.router.parseUrl('/login');
  }

  private async waitForDatabase(): Promise<void> {
    await firstValueFrom(
      this.databaseService.getDatabaseState().pipe(
        filter(isReady => isReady === true),
        take(1)
      )
    );
  }

  private async readSessionEmail(): Promise<string | null> {
    const stored = await this.storageService.get<{ email?: string; expiresAt?: string }>(this.SESSION_KEY);
    if (stored?.email) {
      if (this.isExpired(stored.expiresAt)) {
        await this.storageService.remove(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      return stored.email;
    }

    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data?.email ?? null;
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  private isExpired(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    return new Date().getTime() > new Date(expiresAt).getTime();
  }
}
