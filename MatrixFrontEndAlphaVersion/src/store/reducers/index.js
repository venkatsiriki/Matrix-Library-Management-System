import { combineReducers } from 'redux';
import { SET_BREADCRUMB_ITEMS } from '../actions';

const initialState = {
  title: '',
  items: []
};

const breadcrumbReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BREADCRUMB_ITEMS:
      return {
        ...state,
        title: action.payload.title,
        items: action.payload.items
      };
    default:
      return state;
  }
};

export default combineReducers({
  breadcrumb: breadcrumbReducer
}); 