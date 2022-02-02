/*
 *
 * Search reducer
 *
 */
import produce from 'immer';
import { LOAD_SEARCH, LOAD_SEARCH_SUCCESS } from './constants';

export const initialState = {
  loading: true,
  query: '',
  address: {
    balance: [],
  },
  asset: [],
  tx: {},
};

/* eslint-disable default-case, no-param-reassign, no-undef */
const searchReducer = (state = initialState, { payload, type, query } = action) =>
  produce(state, draft => {
    switch (type) {
      case LOAD_SEARCH:
        draft.loading = true;
        draft.query = query;
        break;
      case LOAD_SEARCH_SUCCESS:
        draft.loading = false;
        draft.address = payload.data.address;
        draft.asset = payload.data.asset;
        draft.tx = payload.data.tx;
        break;
    }
  });

export default searchReducer;
