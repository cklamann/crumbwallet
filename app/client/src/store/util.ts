import { AnyAction, Action } from 'redux';

interface PayloadAction<T> extends AnyAction {
    payload: T;
}

export const makeAction = (type: string): Action => ({ type }),
    assignPayload = <T>(action: Action, payload: T): PayloadAction<T> => ({ ...action, payload });
