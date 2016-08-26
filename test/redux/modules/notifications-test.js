import { expect } from 'chai';
import { Map, List } from 'immutable';
import reducer, {
  initialState,
  actionTypes,
  addNotification,
  hideNotification,
  hideAll
} from '../../../src/redux/modules/notifications';

describe('App notifications', () => {
  describe('(Action creators)', () => {
    it('must create correct "add notification" action', () => {
      const time = Date.now();
      const action = addNotification('abc', 'Hello world!!', time);
      expect(action).to.eql({
        type: 'recodex/notifications/ADD_NOTIFICATION',
        payload: {
          id: 'abc',
          msg: 'Hello world!!',
          time
        }
      });
    });

    it('add current timestamp to the "add notification" action', () => {
      const action = addNotification('abc', 'Hello world!!');
      expect(Date.now() - action.payload.time).to.be.below(10); // the test might run slowly - 10ms tolerance
    });

    it('must create correct "hide notification" action', () => {
      const action = hideNotification('abc');
      expect(action).to.eql({
        type: 'recodex/notifications/HIDE_NOTIFICATION',
        payload: {
          id: 'abc'
        }
      });
    });

    it('must create correct "hide all" action', () => {
      const action = hideAll();
      expect(action).to.eql({
        type: 'recodex/notifications/HIDE_ALL',
        payload: undefined
      });
    });
  });

  describe('(Reducer)', () => {
    it('must create correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.eql(Map({
        visible: List(),
        hidden: List()
      }));
    });

    it('must add a new notification', () => {
      const time = 123456;
      const state = reducer(initialState, addNotification('abc', 'XYZ', time));
      expect(state.get('hidden').size).to.equal(0);
      expect(state.get('visible').size).to.equal(1);
      expect(state.get('visible').first()).to.eql({ id: 'abc', msg: 'XYZ', time });
    });

    it('must remove a notification', () => {
      let state = Map({
        visible: List([
          { id: 'abc' }
        ]),
        hidden: List()
      });

      state = reducer(state, hideNotification('abc'));
      expect(state.get('visible').size).to.equal(0);
      expect(state.get('hidden').size).to.equal(1);
      expect(state.get('hidden').first()).to.eql({ id: 'abc' });
    });

    it('must remove all notifications', () => {
      let state = Map({
        visible: List([
          { id: 'abc' },
          { id: 'def' }
        ]),
        hidden: List()
      });

      state = reducer(state, hideAll());
      expect(state.get('visible').size).to.equal(0);
      expect(state.get('hidden').size).to.equal(2);

      const abc = state.get('hidden').find(item => item.id === 'abc');
      expect(abc.id).to.eql('abc');

      const def = state.get('hidden').find(item => item.id === 'def');
      expect(def.id).to.eql('def');
    });
  });
});
