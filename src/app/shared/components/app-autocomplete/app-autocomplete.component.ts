import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './app-autocomplete.component.html',
  styleUrls: ['./app-autocomplete.component.css']
})
export class AutocompleteComponent<T> implements OnInit, OnDestroy {
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() items$: Observable<T[]> | null = null;
  @Input() displayFn: (item: T) => string = (item: any) => item?.toString() || '';
  @Input() emptyMessage: string = 'Aucun résultat trouvé';
  @Input() minChars: number = 0;
  @Input() disabled: boolean = false;
  @Input() initialValue: string = '';

  @Output() itemSelected = new EventEmitter<T>();

  inputControl = new FormControl('');
  showDropdown = false;
  filteredItems: T[] = [];
  loading = false;

  private readonly searchTerms = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeInputControl();
    this.setupSearchObservable();
    this.configureDisabledState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: Event): void {
    if (this.disabled) return;

    const value = (event.target as HTMLInputElement).value;
    this.searchTerms.next(value);
    this.showDropdown = value.length >= this.minChars;
  }

  onFocus(): void {
    if (this.disabled) return;

    const currentValue = this.inputControl.value || '';
    if (currentValue.length >= this.minChars) {
      this.searchTerms.next(currentValue);
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown = false, 200);
  }

  selectItem(item: T): void {
    if (this.disabled) return;

    this.inputControl.setValue(this.displayFn(item));
    this.itemSelected.emit(item);
    this.showDropdown = false;
  }

  private initializeInputControl(): void {
    if (this.initialValue) {
      this.inputControl.setValue(this.initialValue);
    }
  }

  private configureDisabledState(): void {
    if (this.disabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }

  private setupSearchObservable(): void {
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(searchTerm => this.filterItems(searchTerm)),
      tap(() => this.loading = false)
    ).subscribe(items => {
      this.filteredItems = items;
    });
  }

  private filterItems(searchTerm: string): Observable<T[]> {
    if (!this.items$) {
      return of([]);
    }

    return this.items$.pipe(
      map(items => this.filterItemsBySearchTerm(items, searchTerm))
    );
  }

  private filterItemsBySearchTerm(items: T[], searchTerm: string): T[] {
    return items.filter(item =>
      this.displayFn(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
