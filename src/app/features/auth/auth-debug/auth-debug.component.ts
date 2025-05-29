import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { map, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="mb-6 text-2xl font-bold">Auth Debugging Tools</h1>

      <div class="mb-6 rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 class="mb-4 text-xl font-semibold">Authentication Status</h2>
        <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p class="font-semibold">Is Authenticated:</p>
            <p>{{ isAuthenticated ? 'Yes ✅' : 'No ❌' }}</p>
          </div>
          <div>
            <p class="font-semibold">User Email:</p>
            <p>{{ userEmail || 'Not logged in' }}</p>
          </div>
        </div>
        <button
          (click)="checkAuthStatus()"
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Refresh Status
        </button>
      </div>

      <div class="mb-6 rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 class="mb-4 text-xl font-semibold">Generate API Token</h2>
        <form [formGroup]="tokenForm" class="mb-4">
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium">API Audience</label>
            <input
              type="text"
              formControlName="audience"
              class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
            />
          </div>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium">Scope</label>
            <input
              type="text"
              formControlName="scope"
              class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
            />
          </div>
        </form>
        <div class="flex space-x-3">
          <button
            (click)="generateApiToken()"
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Generate API Token
          </button>
          <button
            (click)="generateTestToken()"
            class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            Test Auth0 Token
          </button>
        </div>
      </div>

      <div *ngIf="apiToken" class="mb-6 rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 class="mb-4 text-xl font-semibold">API Token</h2>
        <div class="mb-4">
          <p class="font-semibold">Token (first 50 chars):</p>
          <p class="break-all rounded bg-gray-100 p-2 dark:bg-neutral-700">
            {{ apiToken.substring(0, 50) }}...
          </p>
        </div>

        <div class="mb-4">
          <p class="font-semibold">Decoded Token Header:</p>
          <pre class="max-h-40 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-700">{{
            decodedHeader
          }}</pre>
        </div>

        <div class="mb-4">
          <p class="font-semibold">Decoded Token Payload:</p>
          <pre class="max-h-60 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-700">{{
            decodedPayload
          }}</pre>
        </div>

        <button
          (click)="copyToken()"
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Copy Full Token
        </button>
      </div>

      <div *ngIf="tokenError" class="mb-6 rounded-lg bg-red-100 p-6 shadow dark:bg-red-900">
        <h2 class="mb-4 text-xl font-semibold text-red-800 dark:text-red-200">
          Error Generating Token
        </h2>
        <pre class="max-h-60 overflow-auto rounded bg-white p-4 dark:bg-neutral-800">{{
          tokenError
        }}</pre>
      </div>

      <div class="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <h2 class="mb-4 text-xl font-semibold">Test Your Backend API</h2>
        <form [formGroup]="apiForm" class="mb-4">
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium">API URL</label>
            <input
              type="text"
              formControlName="apiUrl"
              class="w-full rounded border p-2 dark:border-neutral-600 dark:bg-neutral-700"
            />
          </div>
        </form>
        <button
          (click)="testApiCall()"
          [disabled]="!apiToken"
          class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Test API Call
        </button>

        <div *ngIf="apiResult" class="mt-4">
          <p class="font-semibold">API Response:</p>
          <pre class="max-h-60 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-700">{{
            apiResult
          }}</pre>
        </div>

        <div *ngIf="apiError" class="mt-4">
          <p class="font-semibold text-red-600 dark:text-red-400">API Error:</p>
          <pre class="max-h-60 overflow-auto rounded bg-red-50 p-2 dark:bg-red-900">{{
            apiError
          }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AuthDebugComponent implements OnInit {
  private authService = inject(AuthService);
  private auth0Service = inject(Auth0Service);
  private fb = inject(FormBuilder);

  tokenForm!: FormGroup;
  apiForm!: FormGroup;

  isAuthenticated = false;
  userEmail = '';
  apiToken: string | null = null;
  decodedHeader = '';
  decodedPayload = '';
  tokenError: string | null = null;
  apiResult: string | null = null;
  apiError: string | null = null;

  ngOnInit(): void {
    this.tokenForm = this.fb.group({
      audience: ['https://api.lynqe.com'],
      scope: ['openid profile email offline_access'],
    });

    this.apiForm = this.fb.group({
      apiUrl: [''],
    });

    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.auth0Service.isAuthenticated$
      .pipe(tap((isAuth) => (this.isAuthenticated = isAuth)))
      .subscribe();

    this.auth0Service.user$
      .pipe(map((user) => user?.email || ''))
      .subscribe((email) => (this.userEmail = email));
  }

  async generateApiToken(): Promise<void> {
    const audience = this.tokenForm.get('audience')?.value;
    const scope = this.tokenForm.get('scope')?.value;

    this.apiToken = null;
    this.tokenError = null;
    this.decodedHeader = '';
    this.decodedPayload = '';

    try {
      // First try with current auth service method
      const token = await this.authService.getApiAccessToken(audience);
      this.apiToken = token;
      this.decodeToken(token);
      console.log('Token generated successfully');
    } catch (error) {
      console.error('Error generating token:', error);
      this.tokenError = JSON.stringify(error, null, 2);

      // Try alternative method as fallback
      try {
        console.log('Trying alternative token method...');
        const token = await firstValueFrom(
          this.auth0Service.getAccessTokenSilently({
            authorizationParams: {
              audience,
              scope,
            },
          }),
        );
        this.apiToken = token;
        this.decodeToken(token);
        console.log('Token generated using alternative method');
        this.tokenError = 'Primary method failed, but fallback succeeded';
      } catch (fallbackError) {
        console.error('Fallback token method also failed:', fallbackError);
        this.tokenError = `Primary error: ${JSON.stringify(error)}\n\nFallback error: ${JSON.stringify(fallbackError)}`;
      }
    }
  }

  async generateTestToken(): Promise<void> {
    this.apiToken = null;
    this.tokenError = null;

    try {
      await this.authService.testApiTokenRequest(this.tokenForm.get('audience')?.value);
      console.log('Test token generated - check browser console for details');
    } catch (error) {
      console.error('Error in test token generation:', error);
      this.tokenError = JSON.stringify(error, null, 2);
    }
  }

  decodeToken(token: string): void {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode header (first part)
      const header = JSON.parse(atob(parts[0]));
      this.decodedHeader = JSON.stringify(header, null, 2);

      // Decode payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      this.decodedPayload = JSON.stringify(payload, null, 2);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.tokenError = `Error decoding token: ${error}`;
    }
  }

  copyToken(): void {
    if (this.apiToken) {
      navigator.clipboard
        .writeText(this.apiToken)
        .then(() => {
          console.log('Token copied to clipboard');
          alert('Token copied to clipboard!');
        })
        .catch((err) => {
          console.error('Could not copy token:', err);
          alert('Error copying token: ' + err);
        });
    }
  }

  async testApiCall(): Promise<void> {
    if (!this.apiToken) {
      this.apiError = 'No token available. Generate a token first.';
      return;
    }

    const apiUrl = this.apiForm.get('apiUrl')?.value;
    if (!apiUrl) {
      this.apiError = 'Please enter an API URL to test';
      return;
    }

    this.apiResult = null;
    this.apiError = null;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${JSON.stringify(data)}`);
      }

      this.apiResult = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('API call error:', error);
      this.apiError = String(error);
    }
  }
}
