import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private readonly SESSION_KEY = 'agendavet_session';

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const hasSession = this.hasActiveSession();
    return hasSession ? true : this.router.parseUrl('/login');
  }

  private hasActiveSession(): boolean {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      return Boolean(data?.email);
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return false;
    }
  }
}
