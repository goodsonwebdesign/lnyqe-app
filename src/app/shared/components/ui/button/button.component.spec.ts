import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit buttonClick event when clicked', () => {
    spyOn(component.buttonClick, 'emit');
    const event = new MouseEvent('click');
    component.onClick(event);
    expect(component.buttonClick.emit).toHaveBeenCalledWith(event);
  });

  it('should not emit buttonClick when disabled', () => {
    component.disabled = true;
    spyOn(component.buttonClick, 'emit');
    const event = new MouseEvent('click');
    component.onClick(event);
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });

  it('should not emit buttonClick when loading', () => {
    component.loading = true;
    spyOn(component.buttonClick, 'emit');
    const event = new MouseEvent('click');
    component.onClick(event);
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });
});
