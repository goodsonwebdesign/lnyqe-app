import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/auth.selectors';
import { User } from '../../core/models/user.model';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { UserActions } from '../../store/actions/user.actions';

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent],
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss'],
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
  isEditing = false;
  user: User | null = null;
  userForm!: FormGroup;
  private store = inject(Store);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private subscriptions = new Subscription();

  currentTheme: Theme = 'system';
  themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' },
  ];

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
    });

    this.subscriptions.add(
      this.store.select(selectCurrentUser).subscribe((user) => {
        if (user) {
          this.user = user;
          this.userForm.patchValue({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          });
        }
      })
    );

    this.currentTheme = this.themeService.currentTheme();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.userForm.valid && this.userForm.dirty) {
      const updatedUser: Partial<User> = {
        ...this.userForm.value,
      };
      this.store.dispatch(UserActions.updateMe({ user: updatedUser }));
      this.userForm.markAsPristine();
      this.isEditing = false;
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.user) {
      this.userForm.reset({
        email: this.user.email,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
      });
    }
  }

  exitProfile(): void {
    this.router.navigate(['/dashboard']);
  }

  changeTheme(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const theme = select.value as Theme;
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
  }
}
