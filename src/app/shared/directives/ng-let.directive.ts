import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";

// Directive pour le *ngLet
@Directive({
  selector: '[ngLet]',
  standalone: true
})
export class NgLetDirective<T> {
  @Input() ngLet!: T;

  constructor(
    private templateRef: TemplateRef<NgLetContext<T>>,
    private viewContainer: ViewContainerRef
  ) {
  }

  ngOnChanges() {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this.ngLet,
      ngLet: this.ngLet
    });
  }
}

interface NgLetContext<T> {
  $implicit: T;
  ngLet: T;
}
