import { expect } from 'chai';
import { Map, List } from 'immutable';
import reducer, {
  initialState,
  addNotification,
  hideNotification,
  hideAll
} from '../../../src/redux/modules/notifications';

describe('App notifications', () => {
  describe('(Action creators)', () => {
    it('must create correct "add notification" action', () => {
      const time = Date.now();
      const action = addNotification('Hello world!!', true, 'abc', time);
      expect(action).to.eql({
        type: 'recovid/notifications/ADD_NOTIFICATION',
        payload: {
          id: 'abc',
          msg: 'Hello world!!',
          successful: true,
          time
        }
      });
    });

    it('add current timestamp to the "add notification" action', () => {
      const action = addNotification('Hello world!!');
      expect(Date.now() - action.payload.time).to.be.below(10); // the test might run slowly - 10ms tolerance
    });

    it('must create correct "hide notification" action', () => {
      const action = hideNotification('abc');
      expect(action).to.eql({
        type: 'recovid/notifications/HIDE_NOTIFICATION',
        payload: {
          id: 'abc'
        }
      });
    });

    it('must create correct "hide all" action', () => {
      const action = hideAll();
      expect(action).to.eql({
        type: 'recovid/notifications/HIDE_ALL'
      });
    });
  });

  describe('(Reducer)', () => {
    it('must create correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.eql(
        Map({
          visible: List(),
          hidden: List()
        })
      );
    });

    it('must add a new notification', () => {
      const time = 123456;
      const state = reducer(
        initialState,
        addNotification('XYZ', false, 'abc', time)
      );
      expect(state.get('hidden').size).to.equal(0);
      expect(state.get('visible').size).to.equal(1);
      expect(state.get('visible').first()).to.eql({
        id: 'abc',
        msg: 'XYZ',
        successful: false,
        time,
        count: 1
      });
    });

    it('must group notifications with same messages', () => {
      const time = 123456;
      let state = reducer(
        initialState,
        addNotification('XYZ', false, 'abc', time)
      );
      state = reducer(state, addNotification('XYZ', false, 'cba', time));
      expect(state.get('hidden').size).to.equal(0);
      expect(state.get('visible').size).to.equal(1);
      expect(state.get('visible').first()).to.eql({
        id: 'abc',
        msg: 'XYZ',
        successful: false,
        time,
        count: 2
      });
    });

    it('must remove a notification', () => {
      let state = Map({
        visible: List([{ id: 'abc' }]),
        hidden: List()
      });

      state = reducer(state, hideNotification('abc'));
      expect(state.get('visible').size).to.equal(0);
      expect(state.get('hidden').size).to.equal(1);
      expect(state.get('hidden').first()).to.eql({ id: 'abc' });
    });

    it('must remove all notifications', () => {
      let state = Map({
        visible: List([{ id: 'abc' }, { id: 'def' }]),
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
