import { ThemeService } from '../../core/services/theme.service';
import { UserPreferencesComponent } from './user-preferences.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

describe('UserPreferencesComponent', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    mockThemeService = jasmine.createSpyObj('ThemeService', ['currentTheme', 'setTheme']);
    mockThemeService.currentTheme.and.returnValue('system');

    await TestBed.configureTestingModule({
      imports: [UserPreferencesComponent],
      providers: [
        provideMockStore({
          initialState: {
            auth: {
              currentUser: null,
            },
          },
        }),
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
