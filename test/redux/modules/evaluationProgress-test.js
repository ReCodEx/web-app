import chai from 'chai';
import spies from 'chai-spies';
import { Map, List } from 'immutable';

import reducer, {
  actionTypes,
  initialState,
  init,
  completedTask,
  skippedTask,
  failedTask
} from '../../../src/redux/modules/evaluationProgress';
import { actionTypes as submissionActionTypes } from '../../../src/redux/modules/submission';

chai.use(spies);
const expect = chai.expect;

describe('Evaluation progress', () => {
  it('must have correct initial state', () => {
    const state = reducer(undefined, {});
    expect(state).to.eql(initialState);
    expect(initialState).to.be.an.instanceof(Map);
    expect(initialState).to.equal(
      Map({
        webSocketChannelId: null,
        expectedTasksCount: 0,
        isFinished: false,
        soFarSoGood: true,
        progress: Map({
          total: 0,
          completed: 0,
          skipped: 0,
          failed: 0
        }),
        messages: List(),
        progressObserverId: null
      })
    );
  });

  describe('(Action creators)', () => {
    it('must init the process with default values', () => {
      expect(init('abcdefgh', 5)).to.eql({
        type: actionTypes.INIT,
        payload: {
          webSocketChannelId: 'abcdefgh',
          expectedTasksCount: 5
        }
      });
    });

    it('must create action for completed task', () => {
      expect(completedTask()).to.eql({
        type: actionTypes.COMPLETED_TASK
      });
    });

    it('must create action for skipped task', () => {
      expect(skippedTask()).to.eql({
        type: actionTypes.SKIPPED_TASK
      });
    });

    it('must create action for failed task', () => {
      expect(failedTask()).to.eql({
        type: actionTypes.FAILED_TASK
      });
    });
  });

  describe('(Reducer)', () => {
    it('must return correct initial state', () => {
      expect(reducer(undefined, {})).to.equal(initialState);
    });

    it('must initialise the state well', () => {
      const action = init('abc', 123);
      const state = reducer(initialState, action);

      expect(state.get('webSocketChannelId')).to.equal('abc');
      expect(state.get('expectedTasksCount')).to.equal(123);
      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(false);
      expect(state.getIn(['progress', 'total'])).to.equal(0);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);
    });

    it('must steal submission action and initialise the state well', () => {
      const action = {
        type: submissionActionTypes.SUBMIT_FULFILLED,
        payload: {
          submission: {},
          webSocketChannel: {
            id: 'abc',
            expectedTasksCount: 123
          }
        },
        meta: { submissionType: 'assignmentSolution' }
      };
      const state = reducer(initialState, action);

      expect(state.get('webSocketChannelId')).to.equal('abc');
      expect(state.get('expectedTasksCount')).to.equal(123);
      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(false);
      expect(state.getIn(['progress', 'total'])).to.equal(0);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);
    });

    it('must increase both the count of completed tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // complete first task => not finished yet, but so far so good
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);

      // complete the second task => it should be finished successfully now
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(2);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);
    });

    it('must increase both the count of skipped tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // skip first task => not finished yet and not good so far..
      state = reducer(state, skippedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(1);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);

      // complete the second task => it should be finished unsuccessfully now
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(1);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);
    });

    it('must increase both the count of failed tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // skip first task => not finished yet and not good so far..
      state = reducer(state, failedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(1);

      // complete the second task => it should be finished unsuccessfully now
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(1);
    });

    it('must increase both the count of skipped and failed tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // fail first task => not finished yet and not good so far..
      state = reducer(state, failedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(1);

      // skip the second task => it should be finished unsuccessfully now
      state = reducer(state, skippedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(0);
      expect(state.getIn(['progress', 'skipped'])).to.equal(1);
      expect(state.getIn(['progress', 'failed'])).to.equal(1);
    });

    it('must increase both the count of completed and failed tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // complete first task => not finished yet and so far so good
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);

      // fail the second task => it should be finished unsuccessfully now
      state = reducer(state, failedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(1);
    });

    it('must increase both the count of completed and skipped tasks and the total count of processed tasks', () => {
      let state = reducer(initialState, init('abc', 2));

      // complete first task => not finished yet and so far so good
      state = reducer(state, completedTask());

      expect(state.get('soFarSoGood')).to.equal(true);
      expect(state.get('isFinished')).to.equal(false);

      expect(state.getIn(['progress', 'total'])).to.equal(1);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(0);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);

      // skip the second task => it should be finished unsuccessfully now
      state = reducer(state, skippedTask());

      expect(state.get('soFarSoGood')).to.equal(false);
      expect(state.get('isFinished')).to.equal(true);

      expect(state.getIn(['progress', 'total'])).to.equal(2);
      expect(state.getIn(['progress', 'completed'])).to.equal(1);
      expect(state.getIn(['progress', 'skipped'])).to.equal(1);
      expect(state.getIn(['progress', 'failed'])).to.equal(0);
    });
  });
});
