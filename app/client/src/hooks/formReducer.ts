import { useReducer, Reducer } from 'react';

export default <S>(intialState: S) => {
    const [state, dispatch] = useReducer<Reducer<S, any>>(reducer, intialState);

    return [
        state,
        (field: keyof S) => (value: S[keyof S]) => dispatch({ type: 'update', payload: { [field]: value } }),
    ] as const;
};

//todo: wrap in a factory function that passes in an optional validator that will add values to the errors property of any field
const reducer = <S, A extends { type: string; payload: { [K in keyof S]: S[K] } }>(state: S, action: A) => {
    switch (action.type) {
        case 'update':
            //todo: replace with validator code that will either add value if valid or add to error property with message if not
            return { ...state, ...action.payload };
        default:
            return state;
    }
};
