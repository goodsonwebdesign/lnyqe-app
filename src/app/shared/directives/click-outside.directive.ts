import { Directive, ElementRef, EventEmitter, HostListener, Output, OnInit } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit {
  @Output('appClickOutside') clickOutside = new EventEmitter<void>();

  private listening = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Delay setting the listening flag to ignore the click that created the component
    setTimeout(() => {
      this.listening = true;
    }, 50); // A small delay is sufficient
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    if (!this.listening) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
