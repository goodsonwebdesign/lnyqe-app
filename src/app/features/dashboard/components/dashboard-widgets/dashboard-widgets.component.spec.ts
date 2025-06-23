import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardWidgetsComponent } from './dashboard-widgets.component';
import { DashboardService } from '../../services/dashboard.service';
import { UserService } from '@core/services/user/user.service';
import { User, UserRole } from '@core/models/user.model';

describe('DashboardWidgetsComponent', () => {
  let component: DashboardWidgetsComponent;
  let fixture: ComponentFixture<DashboardWidgetsComponent>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', [
      'getRecentMessages',
      'getWorkRequestsChartData',
      'getUserTasks',
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getMe']);

    mockDashboardService.getRecentMessages.and.returnValue(of([]));
    mockDashboardService.getWorkRequestsChartData.and.returnValue(of([]));
    mockDashboardService.getUserTasks.and.returnValue(of([]));
    const mockUser: User = {
      id: '1',
      auth0_id: 'auth0|123456',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      avatar: 'https://example.com/avatar.png',
      role: UserRole.ADMIN,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };
    mockUserService.getMe.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [DashboardWidgetsComponent],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: UserService, useValue: mockUserService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dashboard service methods on init', () => {
    expect(mockDashboardService.getRecentMessages).toHaveBeenCalled();
    expect(mockDashboardService.getWorkRequestsChartData).toHaveBeenCalled();
  });
});
