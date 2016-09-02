import chai from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);

const expect = chai.expect;

import reducer, {
  submissionStatus,
  actionTypes,
  initialState,

  init,
  addFile,
  changeNote,
  removeFile,
  removeFailedFile,
  returnFile,
  uploadSuccessful,
  uploadFailed,
  finishProcessing
} from '../../../src/redux/modules/submission';

import { Map, List } from 'immutable';

describe('Submission of user\'s solution', () => {
  describe('(Action creators)', () => {
    it('must initialize the submission', () => {
      const userId = 'abcdefg';
      const assignmentId = 'yzsdalkj';
      expect(init(userId, assignmentId)).to.eql({
        type: actionTypes.INIT,
        payload: { userId, assignmentId }
      });
    });

    it('must place the note in the payload', () => {
      const note = 'bla bla bla';
      expect(changeNote(note)).to.eql({
        type: actionTypes.CHANGE_NOTE,
        payload: note
      });
    });

    it('must remove one file', () => {
      const file = { name: 'XYZ.jpg', size: 123456789 };
      expect(removeFile(file)).to.eql({
        type: actionTypes.REMOVE_FILE,
        payload: file
      });
    });
  });

  describe('(Reducer)', () => {
    it('must have correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.equal(initialState);
      expect(state).to.be.an('object');
      expect(state).to.be.an.instanceof(Map);
      expect(state).to.equal(Map({
        submissionId: null,
        userId: null,
        assignmentId: null,
        submittedOn: null,
        note: '',
        files: Map({
          uploading: List(),
          failed: List(),
          removed: List(),
          uploaded: List()
        }),
        status: submissionStatus.NONE,
        warningMsg: null
      }));
    });

    it('must initialize the state with user and assignment IDs', () => {
      const userId = 'asdad123';
      const assignmentId = 'asdajhaskjh45655';
      const state = reducer(initialState, init(userId, assignmentId));
      expect(state).to.equal(Map({
        submissionId: null,
        userId,
        assignmentId,
        submittedOn: null,
        note: '',
        files: Map({
          uploading: List(),
          failed: List(),
          removed: List(),
          uploaded: List()
        }),
        status: submissionStatus.CREATING,
        warningMsg: null
      }));
    });

    it('must initialize the state with user and assignment IDs even when the state is not the initial state', () => {
      const userId = 'asdad123';
      const assignmentId = 'asdajhaskjh45655';
      const oldState = Map({
        submissionId: null,
        userId,
        assignmentId,
        submittedOn: null,
        note: '',
        files: Map({
          uploading: List([ 'a', 'b', 'c' ]),
          failed: List(),
          removed: List(),
          uploaded: List()
        }),
        status: submissionStatus.PROCESSING,
        warningMsg: 'This is not gonna end well!'
      });

      const state = reducer(oldState, init(userId, assignmentId));
      expect(state).to.equal(Map({
        submissionId: null,
        userId,
        assignmentId,
        submittedOn: null,
        note: '',
        files: Map({
          uploading: List(),
          failed: List(),
          removed: List(),
          uploaded: List()
        }),
        status: submissionStatus.CREATING,
        warningMsg: null
      }));
    });

    it('must change the note of the state and nothing else', () => {
      const note = 'bla bla bla';
      const action = changeNote(note);
      const state = reducer(initialState, action);
      expect(state.get('note')).to.equal(note);
      expect(state.set('note', '')).to.equal(initialState);
    });

    describe('file uploading', () => {
      it('must add file among other files for upload', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const action = {
          type: actionTypes.UPLOAD_PENDING,
          payload: {
            [file.name]: file
          }
        };
        const state = reducer(initialState, action);
        const filesToUpload = state.getIn(['files', 'uploading']);
        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(1);
        expect(filesToUpload.first()).to.eql({
          name: file.name,
          file
        });
      });

      it('must mark file as uploaded', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        let state = reducer(initialState, addFile(file));
        state = reducer(state, uploadSuccessful(file));
        const filesToUpload = state.getIn(['files', 'uploading']);
        const uploadedFiles = state.getIn(['files', 'uploaded']);

        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(0);

        expect(uploadedFiles).to.be.an.instanceof(List);
        expect(uploadedFiles.size).to.equal(1);
        expect(uploadedFiles.first()).to.eql({
          name: file.name,
          file
        });
      });

      it('must mark file as failed', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const action = addFile(file);
        let state = reducer(initialState, action);
        state = reducer(state, uploadFailed(file));
        const filesToUpload = state.getIn(['files', 'uploading']);
        const failedFiles = state.getIn(['files', 'failed']);

        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(0);

        expect(failedFiles).to.be.an.instanceof(List);
        expect(failedFiles.size).to.equal(1);
        expect(failedFiles.first()).to.eql({
          name: file.name,
          file
        });
      });

      it('must remove file from the list of uploaded files and add it to the list of removed files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        let state = reducer(initialState, addFile(file));
        state = reducer(state, uploadSuccessful(file));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFile(file));
        const uploadedFiles = state.getIn([ 'files', 'uploaded' ]);
        const removedFiles = state.getIn([ 'files', 'removed' ]);
        expect(uploadedFiles.size).to.equal(0);
        expect(removedFiles.size).to.equal(1);
        expect(removedFiles.first()).to.eql(file);
      });

      it('must return a removed uploaded file among the other uploaded files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        let state = reducer(initialState, addFile(file));
        state = reducer(state, uploadSuccessful(file));
        state = reducer(state, removeFile(file));

        // now that the file is removed, return it back
        state = reducer(state, returnFile(file));
        const removedFiles = state.getIn([ 'files', 'removed' ]);
        const uploadedFiles = state.getIn([ 'files', 'uploaded' ]);
        expect(removedFiles.size).to.equal(0);
        expect(uploadedFiles.size).to.equal(1);
        expect(uploadedFiles.first()).to.eql(file);
      });

      it('must remove file from the list of failed files and throw it away definitelly', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        let state = reducer(initialState, addFile(file));
        state = reducer(state, uploadFailed(file));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFailedFile(file));
        const failedFiles = state.getIn([ 'files', 'failed' ]);
        expect(failedFiles.size).to.equal(0);
      });
    });

    describe('solution submission', () => {
      it('must update status of submission and store submission ID when it is available', () => {
        let state = reducer(initialState, init('bla', '123'));
        expect(state.get('status')).to.equal(submissionStatus.CREATING);

        state = reducer(state, { type: actionTypes.SUBMIT_PENDING });
        expect(state.get('status')).to.equal(submissionStatus.SENDING);

        state = reducer(state, { type: actionTypes.SUBMIT_FAILED });
        expect(state.get('status')).to.equal(submissionStatus.CREATING);

        state = reducer(state, { type: actionTypes.SUBMIT_PENDING });
        expect(state.get('status')).to.equal(submissionStatus.SENDING);

        state = reducer(state, { type: actionTypes.SUBMIT_FULFILLED, payload: { submission: { id: '123' } } });
        expect(state.get('status')).to.equal(submissionStatus.PROCESSING);
        expect(state.get('submissionId')).to.equal('123');

        state = reducer(state, finishProcessing());
        expect(state.get('status')).to.equal(submissionStatus.FINISHED);
      });
    });
  });
});
