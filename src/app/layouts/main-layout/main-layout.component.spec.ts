import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { AuthService } from '../../core/services/auth/auth.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Create mock components for dependencies
@Component({
  selector: 'app-container',
  template: '<div><ng-content></ng-content></div>',
  standalone: true
})
class MockContainerComponent {}

@Component({
  selector: 'app-theme-toggle',
  template: '<div></div>',
  standalone: true
})
class MockThemeToggleComponent {}

@Component({
  selector: 'app-user-menu',
  template: '<div></div>',
  standalone: true
})
class MockUserMenuComponent {}

// Create a mock AuthService
class MockAuthService {
  isAuthenticated$ = of(false);
  user$ = of(null);
  
  login() {}
  logout() {}
  getUser() { return of(null); }
  isAuthenticated() { return of(false); }
}

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainLayoutComponent,
        RouterTestingModule,
        MockContainerComponent,
        MockThemeToggleComponent,
        MockUserMenuComponent,
        HttpClientTestingModule
      ],
      providers: [
        provideMockStore({ initialState: {} }),
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year in footer', () => {
    const currentYear = new Date().getFullYear().toString();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(currentYear);
  });
});
