import { authGuard } from './core/guards/auth.guard';
import { homeGuard } from './core/guards/home.guard';
import { AuthDebugComponent } from './features/auth/auth-debug/auth-debug.component';
import { CallbackComponent } from './features/auth/callback/callback.component';
import { HomeContainerComponent } from './features/home/home-container.component';
import { UserPreferencesComponent } from './features/user-preferences/user-preferences.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Auth0 callback route - must be outside MainLayout
  {
    path: 'callback',
    component: CallbackComponent,
    title: 'Authentication',
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeContainerComponent,
        canActivate: [homeGuard],
        title: 'LNYQE - Home',
        pathMatch: 'full',
      },
      {
        path: 'preferences',
        component: UserPreferencesComponent,
        canActivate: [authGuard],
        title: 'LNYQE - User Preferences',
      },
      {
        path: 'auth-debug',
        component: AuthDebugComponent,
        canActivate: [authGuard],
        title: 'LNYQE - Auth Debugging',
      },
      // Lazy-load feature routes under the main layout
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/features.routes').then((m) => m.FEATURES_ROUTES),
      },
    ],
  },
  // Fallback route for any unmatched routes
  { path: '**', redirectTo: '' },
];
