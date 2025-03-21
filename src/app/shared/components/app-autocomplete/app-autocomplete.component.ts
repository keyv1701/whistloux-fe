import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app-autocomplete.component.html',
  styleUrls: ['./app-autocomplete.component.css']
})
export class AutocompleteComponent<T> implements OnInit {
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() items$: Observable<T[]> | null = null;
  @Input() displayFn: (item: T) => string = (item: any) => item?.toString() || '';
  @Input() emptyMessage: string = 'Aucun résultat trouvé';
  @Input() minChars: number = 0;

  @Output() itemSelected = new EventEmitter<T>();

  inputControl = new FormControl('');
  showDropdown = false;
  filteredItems: T[] = [];
  loading = false;
  private searchTerms = new Subject<string>();

  ngOnInit(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.loading = true;
        return this.items$ ? this.items$.pipe(
          map(items => items.filter(item =>
            this.displayFn(item).toLowerCase().includes(term.toLowerCase())
          ))
        ) : [];
      })
    ).subscribe(items => {
      this.filteredItems = items;
      this.loading = false;
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerms.next(value);
    this.showDropdown = value.length >= this.minChars;
  }

  onFocus(): void {
    const currentValue = this.inputControl.value || '';
    if (currentValue.length >= this.minChars) {
      this.searchTerms.next(currentValue);
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    // Délai pour permettre la sélection avant fermeture
    setTimeout(() => this.showDropdown = false, 200);
  }

  selectItem(item: T): void {
    this.inputControl.setValue(this.displayFn(item));
    this.itemSelected.emit(item);
    this.showDropdown = false;
  }
}
