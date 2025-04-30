import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Create mock components for dependencies
@Component({
  selector: 'app-container',
  template: '<div><ng-content></ng-content></div>'
})
class MockContainerComponent {}

@Component({
  selector: 'app-theme-toggle',
  template: '<div></div>'
})
class MockThemeToggleComponent {}

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainLayoutComponent,
        RouterTestingModule
      ],
      declarations: [
        MockContainerComponent,
        MockThemeToggleComponent
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
