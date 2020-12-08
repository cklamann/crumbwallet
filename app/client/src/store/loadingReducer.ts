import {} from 'redux';
import { ApolloError } from 'apollo-client';

export interface LoadingState {
    loadingRequests: string[];
    error: ApolloError;
}

const defaultLoadingState: LoadingState = {
    error: undefined,
    loadingRequests: [],
};

const Reducer = (state: LoadingState = defaultLoadingState, action: { type: string; payload: any }) => {
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

    return state;
};

export default Reducer;

export const loadingStateSelector = (state: Record<'loadingReducer', LoadingState>) => state.loadingReducer;
