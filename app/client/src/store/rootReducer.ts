import { compose, createStore, combineReducers } from 'redux';
import loadingReducer from './loadingReducer';

const rootReducer = () => combineReducers({ loadingReducer });

const Window = window as any;

export default createStore(rootReducer(), compose(Window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()));
