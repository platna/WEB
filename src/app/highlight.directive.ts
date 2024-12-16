import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appHighlight]',
    standalone: false
})
export class HighlightDirective {
  @Input() appHighlight: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.setBackgroundColor('#f0f8ff');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setBackgroundColor('#ffffff');
  }

  ngOnChanges() {
    if (this.appHighlight) {
      this.setBorder('2px solid red');
    } else {
      this.setBorder('1px solid #ccc');
    }
  }

  private setBackgroundColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
  }

  private setBorder(style: string) {
    this.renderer.setStyle(this.el.nativeElement, 'border', style);
  }
}
