import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { ToastController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/shared/services/storage.service';

class MockDatabaseService {
  getDatabaseState() { return of(true); }
  getUserByEmail(email: string) { return Promise.resolve({ email, password_hash: 'ClaveDemo1' }); }
}

class MockToast {
  present = jasmine.createSpy('present');
}

class MockToastController {
  create(opts?: any) { return Promise.resolve(new MockToast()); }
}

class MockRouter {
  events = of(null);
  navigateByUrl = jasmine.createSpy('navigateByUrl');
}

class MockStorageService {
  private store = new Map<string, any>();
  get<T>(key: string): Promise<T | undefined> {
    return Promise.resolve(this.store.get(key));
  }
  set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }
  remove(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }
}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let db: MockDatabaseService;
  let toastCtrl: MockToastController;
  let router: MockRouter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [ReactiveFormsModule, IonicModule.forRoot()],
      providers: [
        { provide: DatabaseService, useClass: MockDatabaseService },
        { provide: ToastController, useClass: MockToastController },
        { provide: Router, useClass: MockRouter },
        { provide: StorageService, useClass: MockStorageService }
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(LoginPage);
      component = fixture.componentInstance;
      db = TestBed.inject(DatabaseService) as unknown as MockDatabaseService;
      toastCtrl = TestBed.inject(ToastController) as unknown as MockToastController;
      router = TestBed.inject(Router) as unknown as MockRouter;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should normalize email and call getUserByEmail with lowercased email', async () => {
    const spy = spyOn(db, 'getUserByEmail').and.callThrough();
    // Usar correo con mayúsculas (sin espacios) para pasar validación y comprobar normalización a minúsculas
    component.loginForm.patchValue({ email: 'Demo@AgendaVet.CL', password: 'ClaveDemo1', acceptTerms: true });
    await component.onSubmit();
    expect(spy).toHaveBeenCalledWith('demo@agendavet.cl');
  });

  it('should show warning when acceptTerms is not checked', async () => {
    const spy = spyOn(toastCtrl, 'create').and.callThrough();
    component.loginForm.patchValue({ email: 'demo@agendavet.cl', password: 'ClaveDemo1', acceptTerms: false });
    await component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to home on successful login', async () => {
    component.loginForm.patchValue({ email: 'demo@agendavet.cl', password: 'ClaveDemo1', acceptTerms: true, remember: false });
    await component.onSubmit();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('should show password length warning for short passwords', async () => {
    const spy = spyOn(toastCtrl, 'create').and.callThrough();
    component.loginForm.patchValue({ email: 'demo@agendavet.cl', password: '123', acceptTerms: true });
    await component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

});
