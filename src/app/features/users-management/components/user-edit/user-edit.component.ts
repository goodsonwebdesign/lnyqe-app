import { Component, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnChanges {
  @Input() user: User | null = null;
  @Output() formClose = new EventEmitter<void>();
  @Output() userUpdate = new EventEmitter<{ id: number; data: Partial<User> }>();
  @ViewChild('userForm') public userForm!: NgForm;

  editableUser: User | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.editableUser = { ...this.user };
    }
  }

  onSubmit(): void {
    if (!this.userForm?.valid || !this.user || !this.editableUser) {
      return;
    }

    const originalUser = this.user;
    const editedUser = this.editableUser;

    // Construct the full payload required by the backend.
    const userPayload: Partial<User> = {
      email: editedUser.email,
      first_name: editedUser.first_name,
      last_name: editedUser.last_name,
      role: editedUser.role,
      name: `${editedUser.first_name || ''} ${editedUser.last_name || ''}`.trim(),
    };

    // Check if any of the relevant fields have actually changed.
    const hasChanged = userPayload.email !== originalUser.email ||
                       userPayload.first_name !== originalUser.first_name ||
                       userPayload.last_name !== originalUser.last_name ||
                       userPayload.role !== originalUser.role;

    if (hasChanged && originalUser.id) {
      this.userUpdate.emit({ id: originalUser.id, data: userPayload });
    } else {
      this.formClose.emit();
    }
  }

  cancel(): void {
    this.formClose.emit();
  }
}
