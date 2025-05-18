import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeContainerComponent } from './features/home/home-container.component';
import { DashboardContainerComponent } from './features/dashboard/dashboard-container.component';
import { UserPreferencesComponent } from './features/user-preferences/user-preferences.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeContainerComponent,
        title: 'LNYQE - Home'
      },
      {
        path: 'dashboard',
        component: DashboardContainerComponent,
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
  // Simple callback route that Auth0 can use
  {
    path: 'callback',
    component: HomeContainerComponent, // Use HomeContainer component as a landing page
    title: 'Authentication'
  },
  // Fallback route for any unmatched routes
  { path: '**', redirectTo: '' }
];
