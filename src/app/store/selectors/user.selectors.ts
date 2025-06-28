import { createSelector, createFeatureSelector } from '@ngrx/store';
import { userAdapter, UserState, userFeature } from '../reducers/user.reducer';

export const selectUsersState = createFeatureSelector<UserState>(userFeature.name);

const { selectAll, selectEntities, selectIds, selectTotal } = userAdapter.getSelectors();

export const selectAllUsers = createSelector(
    selectUsersState,
    selectAll
);

export const selectUserEntities = createSelector(
    selectUsersState,
    selectEntities
);

export const selectUserIds = createSelector(
    selectUsersState,
    selectIds
);

export const selectUserTotal = createSelector(
    selectUsersState,
    selectTotal
);

export const selectCurrentUserId = createSelector(
    selectUsersState,
    (state: UserState) => state.selectedUserId
);

export const selectCurrentUser = createSelector(
    selectUserEntities,
    selectCurrentUserId,
    (userEntities, userId) => userId && userEntities[userId]
);

export const selectUsersLoading = createSelector(
    selectUsersState,
    (state: UserState) => state.loading
);

export const selectUsersError = createSelector(
    selectUsersState,
    (state: UserState) => state.error
);

export const selectUserLastLoaded = createSelector(
    selectUsersState,
    (state: UserState) => state.lastLoaded
);


// selectUsers is now an alias for selectAllUsers, which returns User[]
export const selectUsers = selectAllUsers;
