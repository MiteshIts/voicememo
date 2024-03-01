import { applyMiddleware} from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './reducers';
import { legacy_createStore as createStore} from 'redux'

let store = createStore(rootReducer, applyMiddleware(thunk));

export default store;