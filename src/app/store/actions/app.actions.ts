import { createActionGroup, emptyProps } from '@ngrx/store';

// App actions group
export const AppActions = createActionGroup({
  source: 'App',
  events: {
    'Loading Started': emptyProps(),
    'Loading Completed': emptyProps(),
  },
});

// For backward compatibility during migration
export const appLoading = AppActions.loadingStarted;
export const appLoaded = AppActions.loadingCompleted;
