import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import sidebar from './modules/sidebar';

export default combineReducers({
  routing: routerReducer,
  sidebar
});
