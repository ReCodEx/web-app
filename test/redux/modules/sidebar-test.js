import { expect } from 'chai';
import { Map } from 'immutable';
import reducer, { actionTypes, toggleSize, toggleVisibility } from '../../../src/redux/modules/sidebar';

describe('Opening and closing the sidebar', () => {
  describe('(Action creators)', () => {
    it('must create correct toggle size action', () => {
      const action = toggleSize();
      expect(action).to.eql({
        type: actionTypes.TOGGLE_SIZE,
        payload: undefined
      });
    });

    it('must create correct toggle visibility action', () => {
      const action = toggleVisibility();
      expect(action).to.eql({
        type: actionTypes.TOGGLE_VISIBILITY,
        payload: undefined
      });
    });
  });

  describe('(Reducer)', () => {
    it('must create correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.eql(Map({
        visible: false,
        collapsed: false
      }));
    });

    it('must create toggle visibility', () => {
      let state = reducer(undefined, {});
      expect(state.get('visible')).to.equal(false);
      state = reducer(state, toggleVisibility());
      expect(state.get('visible')).to.equal(true);
      state = reducer(state, toggleVisibility());
      expect(state.get('visible')).to.equal(false);
    });

    it('must create toggle size', () => {
      let state = reducer(undefined, {});
      expect(state.get('collapsed')).to.equal(false);
      state = reducer(state, toggleSize());
      expect(state.get('collapsed')).to.equal(true);
      state = reducer(state, toggleSize());
      expect(state.get('collapsed')).to.equal(false);
    });
  });
});
