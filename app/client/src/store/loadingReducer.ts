import { ApolloError } from 'apollo-client';
import { makeAction } from './util';

export interface LoadingState {
    loadingRequests: string[];
    error: ApolloError;
}

const defaultLoadingState: LoadingState = {
    error: undefined,
    loadingRequests: [],
};

export const clearError = () => makeAction('CLEAR_ERROR');

const reducer = (state: LoadingState = defaultLoadingState, action: { type: string; payload: any }) => {
    const { type, payload } = action;
    if (type === 'LOADING') {
        return { ...state, loadingRequests: state.loadingRequests.concat([payload]) };
    }

    if (type === 'LOADED') {
        return { ...state, loadingRequests: state.loadingRequests.filter((id: string) => id != payload) };
    }

    if (type === 'ERROR') {
        return { ...state, error: payload };
    }

    if (type === 'CLEAR_ERROR') {
        return { ...state, error: undefined };
    }

    return state;
};

export default reducer;

export const loadingStateSelector = (state: Record<'loadingReducer', LoadingState>) => state.loadingReducer;
