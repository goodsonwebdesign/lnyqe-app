import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,

} from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { ToastComponent } from './shared/components/ui/toast/toast.component';
import { Observable, Subscription } from 'rxjs'; // Removed BehaviorSubject, filter; Added Observable
import { Store } from '@ngrx/store';
import { AuthActions } from './store/actions/auth.actions';
import { selectAuthLoading } from './store/selectors/auth.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'lnyqe-app';

  isLoading$!: Observable<boolean>; // Added non-null assertion operator

  private subscription = new Subscription(); // Keep for other potential subscriptions
  private router = inject(Router); // Keep for other router logic
  private store = inject(Store);

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectAuthLoading);
    this.store.dispatch(AuthActions.initAuth());

    // Router event-based loading logic has been removed.
    // NgRx store (selectAuthLoading) now drives the global loading indicator
    // primarily for the initial authentication check.
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
