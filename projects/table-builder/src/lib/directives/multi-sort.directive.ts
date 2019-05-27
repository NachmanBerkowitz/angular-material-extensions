import { Directive, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSort, Sort, MatSortable } from '@angular/material';
import { Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[multiSort]',
  exportAs: 'multiSort',
  inputs: ['disabled: matSortDisabled'],
  providers: [
    { provide: MatSort, useExisting: MultiSortDirective }
  ]
})
export class MultiSortDirective extends MatSort implements OnInit, OnDestroy{
  @Output('multiSortChange') readonly rulesChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();

  @Input() rules$: Subject<Sort[]> = new Subject();
  rules: Sort[] = [];

  private SubRef: Subscription;

  ngOnInit() {
    this.SubRef = this.rules$.subscribe( rules => {
      if (rules.length) {
        const firstRule = rules.shift();
        this.rules = rules;
        this.sort({id: firstRule.active, start: firstRule.direction || 'asc', disableClear: false});
      }
    });
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.SubRef.unsubscribe();
    super.ngOnDestroy();
  }

  sort(sortable: MatSortable): void {

    if (this.active !== sortable.id) {
      this.rules.unshift({ active: sortable.id, direction: sortable.start ? sortable.start : this.start });
    } else {
      const newDirection = this.getNextSortDirection(sortable);
      this.rules = this.rules.filter(r => r.active != this.active);
      if (newDirection) {
        this.rules.unshift({ active: this.active, direction: newDirection });
      }
    }

    super.sort(sortable);
    this.rulesChange.emit(this.rules);
  }
}