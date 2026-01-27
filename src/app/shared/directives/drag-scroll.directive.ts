import { Directive, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective implements OnInit, OnDestroy {
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDraggingCard = false;

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.cursor = 'grab';
  }

  ngOnInit() {
    // Слушаем события CDK drag
    document.addEventListener('mousedown', this.checkCdkDrag);
    document.addEventListener('mouseup', this.resetCdkDrag);
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.checkCdkDrag);
    document.removeEventListener('mouseup', this.resetCdkDrag);
  }

  private checkCdkDrag = (e: MouseEvent) => {
    // Проверяем, началось ли перетаскивание карточки
    const target = e.target as HTMLElement;
    if (target.closest('.cdk-drag')) {
      this.isDraggingCard = true;
    }
  };

  private resetCdkDrag = () => {
    this.isDraggingCard = false;
  };

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    // Не начинаем скролл, если перетаскиваем карточку
    if (this.isDraggingCard) return;
    
    const target = e.target as HTMLElement;
    // Не начинаем скролл, если клик по карточке
    if (target.closest('.cdk-drag')) return;

    this.isDown = true;
    this.el.nativeElement.style.cursor = 'grabbing';
    this.startX = e.pageX - this.el.nativeElement.offsetLeft;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isDown = false;
    if (!this.isDraggingCard) {
      this.el.nativeElement.style.cursor = 'grab';
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    this.isDown = false;
    if (!this.isDraggingCard) {
      this.el.nativeElement.style.cursor = 'grab';
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDown || this.isDraggingCard) return;
    e.preventDefault();
    const x = e.pageX - this.el.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;
    this.el.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}