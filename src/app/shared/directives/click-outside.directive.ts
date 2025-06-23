import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() readonly clickOutside = new EventEmitter<void>();

  private readonly elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event.target'])
  public onClick(target: Node): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
