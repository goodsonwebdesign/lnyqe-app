import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { userFeature } from '../../store/reducers/user.reducer';
import { UserEffects } from '../../store/effects/user.effects';

export const usersManagementProviders = [
  provideState(userFeature),
  provideEffects(UserEffects)
];
