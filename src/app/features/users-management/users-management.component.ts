import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserView } from '../../core/models/user.model';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersManagementComponent {
  @Input() users: UserView[] | null = [];
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Input() filterForm!: FormGroup;

  @Output() addUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<UserView>();
  @Output() deleteUser = new EventEmitter<UserView>();

  trackByUserId(index: number, user: UserView): number {
    return user.id;
  }
}
