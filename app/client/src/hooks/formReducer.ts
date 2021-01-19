import { useReducer, Reducer } from 'react';

export default <S>(intialState: S) => {
    const [state, dispatch] = useReducer<Reducer<S, any>>(reducer, intialState);

    return [
        state,
        (field: keyof S) => (value: S[keyof S]) => dispatch({ type: 'update', payload: { [field]: value } }),
    ] as const;
};

const reducer = <S, A extends { type: string; payload: { [K in keyof S]: S[K] } }>(state: S, action: A) => {
    switch (action.type) {
        case 'update':
            return { ...state, ...action.payload };
        default:
            return state;
    }
};
