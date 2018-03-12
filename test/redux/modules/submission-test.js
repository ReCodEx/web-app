import chai from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

const expect = chai.expect;

import reducer, {
  submissionStatus,
  actionTypes,
  initialState,
  init,
  changeNote,
  finishProcessing
} from '../../../src/redux/modules/submission';

import { Map } from 'immutable';

describe("Submission of user's solution", () => {
  describe('(Action creators)', () => {
    it('must initialize the submission', () => {
      const userId = 'abcdefg';
      const id = 'yzsdalkj';
      expect(init(userId, id)).to.eql({
        type: actionTypes.INIT,
        payload: { userId, id }
      });
    });

    it('must place the note in the payload', () => {
      const note = 'bla bla bla';
      expect(changeNote(note)).to.eql({
        type: actionTypes.CHANGE_NOTE,
        payload: note
      });
    });
  });

  describe('(Reducer)', () => {
    it('must have correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.equal(initialState);
      expect(state).to.be.an('object');
      expect(state).to.be.an.instanceof(Map);
      expect(state).to.equal(
        Map({
          submissionId: null,
          userId: null,
          id: null,
          submittedOn: null,
          note: '',
          monitor: null,
          status: submissionStatus.NONE,
          warningMsg: null,
          presubmit: null
        })
      );
    });

    it('must initialize the state with user and assignment IDs', () => {
      const userId = 'asdad123';
      const id = 'asdajhaskjh45655';
      const state = reducer(initialState, init(userId, id));
      expect(state).to.equal(
        Map({
          submissionId: null,
          userId,
          id,
          submittedOn: null,
          note: '',
          monitor: null,
          status: submissionStatus.CREATING,
          warningMsg: null,
          presubmit: null
        })
      );
    });

    it('must initialize the state with user and assignment IDs even when the state is not the initial state', () => {
      const userId = 'asdad123';
      const id = 'asdajhaskjh45655';
      const oldState = Map({
        submissionId: null,
        userId,
        id,
        submittedOn: null,
        note: '',
        monitor: null,
        status: submissionStatus.PROCESSING,
        warningMsg: 'This is not gonna end well!',
        presubmit: []
      });

      const state = reducer(oldState, init(userId, id));
      expect(state).to.equal(
        Map({
          submissionId: null,
          userId,
          id,
          submittedOn: null,
          note: '',
          monitor: null,
          status: submissionStatus.CREATING,
          warningMsg: null,
          presubmit: null
        })
      );
    });

    it('must change the note of the state and the state to creating', () => {
      const note = 'bla bla bla';
      const action = changeNote(note);
      const state = reducer(initialState, action);
      expect(state.get('note')).to.equal(note);
      expect(state.get('status')).to.equal(submissionStatus.CREATING);
      expect(
        state.set('note', '').set('status', submissionStatus.NONE)
      ).to.equal(initialState);
    });

    describe('solution submission', () => {
      it('must update status of submission and store submission ID when it is available', () => {
        let state = reducer(initialState, init('bla', '123'));
        expect(state.get('status')).to.equal(submissionStatus.CREATING);

        state = reducer(state, { type: actionTypes.SUBMIT_PENDING });
        expect(state.get('status')).to.equal(submissionStatus.SENDING);

        state = reducer(state, { type: actionTypes.SUBMIT_REJECTED });
        expect(state.get('status')).to.equal(submissionStatus.FAILED);

        state = reducer(state, { type: actionTypes.SUBMIT_PENDING });
        expect(state.get('status')).to.equal(submissionStatus.SENDING);

        state = reducer(state, {
          type: actionTypes.SUBMIT_FULFILLED,
          payload: {
            submission: { id: '123' },
            webSocketChannel: { monitorUrl: 'ws://xyz.cz' }
          },
          meta: { submissionType: 'assignmentSolution' }
        });
        expect(state.get('status')).to.equal(submissionStatus.PROCESSING);
        expect(state.get('submissionId')).to.equal('123');

        state = reducer(state, finishProcessing());
        expect(state.get('status')).to.equal(submissionStatus.FINISHED);
      });
    });
  });
});
