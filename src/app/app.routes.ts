import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { CallbackComponent } from './features/auth/callback/callback.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UserPreferencesComponent } from './features/user-preferences/user-preferences.component';
import { authGuard } from './core/guards/auth.guard';
import { homeGuard } from './core/guards/home.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [homeGuard],
        title: 'LNYQE - Home'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        title: 'LNYQE - Dashboard'
      },
      {
        path: 'preferences',
        component: UserPreferencesComponent,
        canActivate: [authGuard],
        title: 'LNYQE - User Preferences'
      },
      {
        path: 'features',
        loadChildren: () => import('./features/features.routes').then(m => m.FEATURES_ROUTES),
      }
    ]
  },
  // Keep the callback component route for future use, but we're handling auth in app.component now
  {
    path: 'callback',
    component: CallbackComponent,
    title: 'Authentication Callback'
  },
  // Fallback route for any unmatched routes
  { path: '**', redirectTo: '' }
];
