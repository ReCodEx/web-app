import { expect } from 'chai';

import reducer from '../../../src/redux/modules/groupExercises.js';

const actionType = 'recodex/resource/exercises/FETCH_MANY_FULFILLED';

describe('Group exercises', () => {
  it('will return the same state if the ', () => {
    const state = { X: ['Y'] };

    const newState = reducer(state, {
      type: actionType,
      meta: { endpoint: '/exercises' },
    });

    expect(newState).to.eql(state);
  });

  it('will create a new list with the ID of the exercise', () => {
    const state = {};
    const action = {
      type: actionType,
      payload: [{ id: 'A' }],
      meta: { endpoint: '/groups/X/exercises' },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ X: ['A'] });
  });

  it('will add the ID of the exercise among the list of the exercises for the group', () => {
    const state = { X: ['A', 'B'] };
    const action = {
      type: actionType,
      payload: [{ id: 'C' }],
      meta: { endpoint: '/groups/X/exercises' },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ X: ['A', 'B', 'C'] });
  });

  it('will not add the ID of the exercise among the list of the exercises for the group if it is already there', () => {
    const state = { X: ['A', 'B'] };
    const action = {
      type: actionType,
      payload: [{ id: 'A' }],
      meta: { endpoint: '/groups/X/exercises' },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ X: ['A', 'B'] });
  });

  it('will add the ID of the exercise among the list of the exercises for the group if it is already there but for a different group', () => {
    const state = { X: ['A', 'B'], Y: ['A'] };
    const action = {
      type: actionType,
      payload: [{ id: 'B' }],
      meta: { endpoint: '/groups/Y/exercises' },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ X: ['A', 'B'], Y: ['A', 'B'] });
  });

  it('will extract a guid and add it to the list of exercises', () => {
    const guid = 'c933db38-a69b-11e7-a937-00505601122b';
    const state = { [guid]: ['A', 'B'] };
    const action = {
      type: actionType,
      payload: [{ id: 'X' }],
      meta: { endpoint: `/groups/${guid}/exercises` },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ [guid]: ['A', 'B', 'X'] });
  });

  it('will add multiple IDs at once', () => {
    const state = { X: ['A', 'B'] };
    const action = {
      type: actionType,
      payload: [{ id: 'C' }, { id: 'D' }],
      meta: { endpoint: '/groups/X/exercises' },
    };

    const newState = reducer(state, action);

    expect(newState).to.eql({ X: ['A', 'B', 'C', 'D'] });
  });
});
