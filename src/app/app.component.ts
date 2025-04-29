import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as CounterActions from './store/actions/counter.actions';
import { selectCount } from './store/selectors/counter.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'lnyqe-app';
  
  private store = inject(Store);
  count$: Observable<number> = this.store.select(selectCount);
  inputCount = 0;

  increment(): void {
    this.store.dispatch(CounterActions.increment());
  }

  decrement(): void {
    this.store.dispatch(CounterActions.decrement());
  }

  reset(): void {
    this.store.dispatch(CounterActions.reset());
  }

  setCustomCount(): void {
    this.store.dispatch(CounterActions.setCount({ count: this.inputCount }));
  }
}
