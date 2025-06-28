import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersManagementComponent {
  @Input() users: User[] | null = [];
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Input() isAdmin = false;
  @Input() filterForm!: FormGroup;

  @Output() addUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();

  trackByUser(index: number, user: User): string {
    return user.email;
  }
}
