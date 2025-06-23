import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth/auth.service';
import { SsoService } from '../../../core/services/sso/sso.service';
import { DomainMapping } from '../../../core/models/identity-provider.model';

@Component({
  selector: 'app-sso-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sso-entry.component.html',
  styleUrls: ['./sso-entry.component.scss'],
})
export class SsoEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private ssoService = inject(SsoService);
  private router = inject(Router);

  ssoForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  detectedOrganization: string | null = null;

  get emailControl() {
    return this.ssoForm.get('email') as FormControl;
  }

  ngOnInit(): void {
    this.ssoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.ssoForm.invalid) {
      return;
    }

    const email = this.emailControl.value;
    this.isLoading = true;
    this.error = null;

    try {
      // Extract domain from email
      const domain = this.ssoService.extractDomainFromEmail(email);

      // Check if domain is linked to an organization in Auth0
      this.ssoService
        .checkDomainForSso(domain)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
        )
        .subscribe({
          next: (mapping: DomainMapping | null) => {
            if (mapping) {
              this.detectedOrganization = mapping.displayName;

              // Redirect to Auth0 login with the organization context
              setTimeout(() => {
                this.authService.login(mapping.organizationId);
              }, 1000); // Small delay to show the organization name to the user
            } else {
              // Domain not recognized for SSO
              this.error =
                "We couldn't find an SSO configuration for this email domain. Please try another email or log in with password.";
            }
          },
          error: (err: unknown) => {
            console.error('Error checking domain for SSO:', err);
            this.error =
              'An error occurred while checking your domain. Please try again or log in with password.';
          },
        });
    } catch {
      // The error is intentionally ignored as the user is simply notified of an invalid email.
      this.isLoading = false;
      this.error = 'Please enter a valid email address.';
    }
  }

  loginWithPassword(): void {
    // Reset SSO state and redirect to regular login
    this.ssoService.resetSsoState();

    // Navigate to regular login page or trigger regular Auth0 login
    this.authService.login();
  }
}
