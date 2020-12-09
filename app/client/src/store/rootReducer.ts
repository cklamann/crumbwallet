import { compose, createStore, combineReducers } from 'redux';
import loadingReducer from './loadingReducer';
import { get, noop } from 'lodash';

const rootReducer = () => combineReducers({ loadingReducer });

export default createStore(rootReducer(), compose(get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', noop).call()));
