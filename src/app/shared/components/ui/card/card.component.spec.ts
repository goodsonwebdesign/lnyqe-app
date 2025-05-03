import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.shadow).toBe('md');
    expect(component.rounded).toBe('lg');
    expect(component.border).toBe(true);
  });

  it('should render header when provided', () => {
    component.header = 'Test Header';
    fixture.detectChanges();
    const headerEl = fixture.nativeElement.querySelector('.text-lg.font-semibold');
    expect(headerEl.textContent).toContain('Test Header');
  });
});
