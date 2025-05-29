import { FlyoutComponent } from './flyout.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('FlyoutComponent', () => {
  let component: FlyoutComponent;
  let fixture: ComponentFixture<FlyoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlyoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
