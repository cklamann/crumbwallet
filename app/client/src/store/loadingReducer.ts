import { ApolloError } from 'apollo-client';
import { assignPayload, makeAction } from './util';
import { GraphQLError } from 'graphql';

export interface LoadingState {
    loadingRequests: string[];
    error: ApolloError;
}

const defaultLoadingState: LoadingState = {
    error: undefined,
    loadingRequests: [],
};

const clearErrorAction = makeAction('global/clear-loading-error'),
    setLoadingAction = makeAction('global/set-loading'),
    setLoadedAction = makeAction('global/set-loaded'),
    setLoadingErrorAction = makeAction('global/set-loading-error');

export const makeClearLoadingAction = () => clearErrorAction,
    makeSetLoadingAction = (queryId: number) => assignPayload(setLoadingAction, queryId),
    makeSetLoadedAction = (queryId: number) => assignPayload(setLoadedAction, queryId),
    makeSetLoadingErrorAction = (error: Readonly<GraphQLError[]> | ApolloError) =>
        assignPayload(setLoadingErrorAction, error);

const reducer = (state: LoadingState = defaultLoadingState, action: { type: string; payload: any }) => {
    const { type, payload } = action;

    switch (type) {
        case setLoadingAction.type:
            return { ...state, loadingRequests: state.loadingRequests.concat([payload]) };
        case setLoadedAction.type:
            return { ...state, loadingRequests: state.loadingRequests.filter((id: string) => id !== payload) };
        case setLoadingErrorAction.type:
            return { ...state, error: payload };
        case clearErrorAction.type:
            return { ...state, error: undefined };
        default:
            return state;
    }
};

export default reducer;

export const loadingStateSelector = (state: Record<'loadingReducer', LoadingState>) => state.loadingReducer;
