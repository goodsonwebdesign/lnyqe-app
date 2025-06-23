import { InputComponent } from './input.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.type).toBe('text');
    expect(component.size).toBe('md');
    expect(component.required).toBe(false);
    expect(component.disabled).toBe(false);
  });

  it('should emit changes on input', () => {
    spyOn(component, 'onChange');

    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'test';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value).toBe('test');
    expect(component.onChange).toHaveBeenCalledWith('test');
  });

  it('should mark as touched on blur', () => {
    spyOn(component, 'onTouched');
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(component.touched).toBe(false);

    inputElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.touched).toBe(true);
    expect(component.onTouched).toHaveBeenCalled();
  });
});
