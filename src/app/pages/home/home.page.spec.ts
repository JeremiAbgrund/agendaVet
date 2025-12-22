import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsService } from 'src/app/shared/services/appointments.service';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { of } from 'rxjs';
import { HomePage } from './home.page';
import { StorageService } from 'src/app/shared/services/storage.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      providers: [
        { provide: AppointmentsService, useValue: { list: () => [] } },
        { provide: ProfileService, useValue: { getProfile: () => ({ ownerName: 'Mock', vets: [] }), ready: Promise.resolve(true) } },
        { provide: ApiService, useValue: { fetchTips: () => of([]) } },
        { provide: StorageService, useClass: MockStorageService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
