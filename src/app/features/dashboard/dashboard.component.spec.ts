import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { CardComponent } from '../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { SectionType } from './dashboard.types';
import { TitleCasePipe } from '@angular/common';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        CardComponent,
        ButtonComponent,
        TitleCasePipe
      ],
      // Enable change detection for testing
      providers: [
        { provide: ChangeDetectionStrategy, useValue: ChangeDetectionStrategy.Default }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    
    // Provide mock data
    component.userRole = 'admin';
    component.activeSection = 'overview';
    component.quickActions = [
      {
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
        label: 'New Task',
        action: 'createTask',
        variant: 'primary'
      }
    ];
    component.statCards = [
      {
        title: 'Open Tasks',
        value: '12',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        iconBg: 'bg-primary-100 dark:bg-primary-900',
        iconColor: 'text-primary-600 dark:text-primary-400',
        change: {
          value: '+2 Today',
          isPositive: true
        }
      }
    ];
    component.tasks = [
      {
        title: 'HVAC Maintenance',
        date: 'Scheduled for May 20, 2025',
        status: 'pending',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        iconBg: 'bg-amber-100 dark:bg-amber-900',
        iconColor: 'text-amber-600 dark:text-amber-400'
      }
    ];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show mobile navigation section', () => {
    const mobileNav = fixture.debugElement.query(By.css('.sm\\:hidden'));
    expect(mobileNav).toBeTruthy();
  });

  it('should show all four sections when userRole is admin', () => {
    component.userRole = 'admin';
    fixture.detectChanges();
    
    // Get all section buttons in mobile nav
    const sectionButtons = fixture.debugElement.queryAll(
      By.css('.sm\\:hidden button')
    );
    expect(sectionButtons.length).toBe(4); // Overview, Tasks, Schedule, Admin
  });

  it('should show only three sections when userRole is not admin', () => {
    component.userRole = 'user';
    fixture.detectChanges();
    
    // Get all section buttons in mobile nav
    const sectionButtons = fixture.debugElement.queryAll(
      By.css('.sm\\:hidden button')
    );
    expect(sectionButtons.length).toBe(3); // Overview, Tasks, Schedule (no Admin)
  });

  it('should emit sectionChange event when section is clicked', () => {
    spyOn(component.sectionChange, 'emit');
    
    // Click the Tasks button
    const tasksButton = fixture.debugElement.queryAll(
      By.css('.sm\\:hidden button')
    )[1]; // Tasks is the second button
    
    tasksButton.nativeElement.click();
    fixture.detectChanges();
    
    expect(component.sectionChange.emit).toHaveBeenCalledWith('tasks');
  });

  it('should handle action correctly when quick action is clicked', () => {
    spyOn(component, 'handleAction');
    
    const actionButton = fixture.debugElement.query(
      By.css('.grid.grid-cols-2 button')
    );
    
    actionButton.nativeElement.click();
    fixture.detectChanges();
    
    expect(component.handleAction).toHaveBeenCalledWith('createTask');
  });

  it('should emit correct action when handleAction is called', () => {
    spyOn(component.createTaskAction, 'emit');
    
    component.handleAction('createTask');
    
    expect(component.createTaskAction.emit).toHaveBeenCalled();
  });

  it('should conditionally display admin section', () => {
    // First check with admin role
    component.userRole = 'admin';
    component.activeSection = 'admin';
    fixture.detectChanges();
    
    let adminSection = fixture.debugElement.query(
      By.css('div[*ngIf="isSectionActive(SECTION_ADMIN) && userRole === \'admin\'"]')
    );
    expect(adminSection).toBeTruthy();
    
    // Then check with user role
    component.userRole = 'user';
    fixture.detectChanges();
    
    adminSection = fixture.debugElement.query(
      By.css('div[*ngIf="isSectionActive(SECTION_ADMIN) && userRole === \'admin\'"]')
    );
    expect(adminSection).toBeFalsy();
  });

  it('should return correct status class based on status', () => {
    expect(component.getStatusClass('urgent')).toContain('bg-red-100');
    expect(component.getStatusClass('in-progress')).toContain('bg-green-100');
    expect(component.getStatusClass('pending')).toContain('bg-amber-100');
    expect(component.getStatusClass('completed')).toContain('bg-blue-100');
    expect(component.getStatusClass('unknown')).toContain('bg-neutral-100');
  });

  it('should return correct notification icon based on type', () => {
    expect(component.getNotificationIcon('message')).toContain('M7 8h10M7 12h4m1');
    expect(component.getNotificationIcon('success')).toContain('M9 12l2 2 4-4m6');
    expect(component.getNotificationIcon('warning')).toContain('M15 17h5l-1.405');
    expect(component.getNotificationIcon('alert')).toContain('M12 9v2m0 4h.01m-6.938');
    expect(component.getNotificationIcon('unknown')).toContain('M13 16h-1v-4h-1m1-4h.01M21');
  });

  it('should correctly identify active section', () => {
    component.activeSection = 'tasks';
    expect(component.isSectionActive('tasks')).toBe(true);
    expect(component.isSectionActive('overview')).toBe(false);
  });
});