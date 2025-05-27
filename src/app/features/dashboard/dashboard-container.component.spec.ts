import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { DashboardContainerComponent } from './dashboard-container.component';
import { DashboardComponent } from './dashboard.component';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
import { selectUserViewModel } from '../../store/selectors/user.selectors';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';

// Create a mock Auth0 service
const mockAuth0Service = {
  isAuthenticated$: of(true),
  user$: of({ name: 'Test User', email: 'test@example.com' }),
  loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
  logout: jasmine.createSpy('logout'),
  getAccessTokenSilently: jasmine.createSpy('getAccessTokenSilently').and.returnValue(of('mock-token')),
  idTokenClaims$: of({
    __raw: 'mock-id-token',
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: 'openid profile email'
  })
};

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;
  let fixture: ComponentFixture<DashboardContainerComponent>;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  const initialState = {
    auth: {
      user: {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'admin'
      }
    },
    user: {
      users: [],
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardContainerComponent, DashboardComponent],
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: selectCurrentUser, value: initialState.auth.user },
            { selector: selectUserViewModel, value: { users: [], loading: false, error: null } }
          ]
        }),
        { provide: AuthService, useValue: mockAuth0Service }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user from store on initialization', () => {
    expect(component.user).toEqual(initialState.auth.user);
  });

  it('should provide quickActions to the dashboard component', () => {
    expect(component.quickActions.length).toBeGreaterThan(0);
    const dashboardDebugEl = fixture.debugElement.query(By.directive(DashboardComponent));
    const dashboardComponent = dashboardDebugEl.componentInstance;
    expect(dashboardComponent.quickActions).toEqual(component.quickActions);
  });

  it('should provide adminActions to the dashboard component', () => {
    expect(component.adminActions.length).toBeGreaterThan(0);
    const dashboardDebugEl = fixture.debugElement.query(By.directive(DashboardComponent));
    const dashboardComponent = dashboardDebugEl.componentInstance;
    expect(dashboardComponent.adminActions).toEqual(component.adminActions);
  });

  it('should have setActiveSection method that can change activeSection', () => {
    // First confirm the initial state
    expect(component.activeSection).toBe('admin');

    // Store original value and call the method
    const originalValue = component.activeSection;

    // Create a new variable to store the new section value
    const newSection: any = 'tasks';

    // Directly call the original implementation
    component.setActiveSection(newSection);
    fixture.detectChanges();

    // Verify the method worked correctly
    expect(component.activeSection).toBe(newSection);
    expect(component.activeSection).not.toBe(originalValue);
  });

  it('should handle createTask action', () => {
    spyOn(console, 'log');
    component.createTask();
    expect(console.log).toHaveBeenCalledWith('Create task action triggered');
  });

  it('should handle scheduleEvent action', () => {
    spyOn(console, 'log');
    component.scheduleEvent();
    expect(console.log).toHaveBeenCalledWith('Schedule event action triggered');
  });

  it('should handle addUser action', () => {
    spyOn(console, 'log');
    component.addUser();
    expect(console.log).toHaveBeenCalledWith('Add user action triggered');
  });

  it('should handle manageRoles action', () => {
    spyOn(console, 'log');
    component.manageRoles();
    expect(console.log).toHaveBeenCalledWith('Manage roles action triggered');
  });

  it('should handle systemSettings action', () => {
    spyOn(console, 'log');
    component.systemSettings();
    expect(console.log).toHaveBeenCalledWith('System settings action triggered');
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
