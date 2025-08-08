// Action Types
export const SET_BREADCRUMB_ITEMS = 'SET_BREADCRUMB_ITEMS';

// Action Creators
export const setBreadcrumbItems = (title, items) => ({
  type: SET_BREADCRUMB_ITEMS,
  payload: { title, items }
}); 