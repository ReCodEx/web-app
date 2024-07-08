import reducer, {
  actionTypes,
  initialState,
  init,
  testAddFile,
  removeFile,
  removeFailedFile,
  restoreRemovedFile,
  finalizeUpload,
  manuallyFailUpload,
} from '../../../src/redux/modules/upload.js';

import { fromJS, Map } from 'immutable';

import * as chai from 'chai';
import chaiImmutable from 'chai-immutable';

chai.use(chaiImmutable);

const expect = chai.expect;

describe('Uploading', () => {
  describe('(Action creators)', () => {
    it('must initialize the submission', () => {
      expect(init('blablabla')).to.eql({
        type: actionTypes.INIT,
        payload: 'blablabla',
      });
    });

    it('must remove one file', () => {
      const file = { name: 'XYZ.jpg', size: 123456789 };
      const containerId = '123';
      expect(removeFile(containerId, file.name)).to.eql({
        type: actionTypes.REMOVE_FILE,
        payload: { containerId, fileName: file.name },
      });
    });
  });

  describe('(Reducer)', () => {
    it('must have correct initial state', () => {
      const state = reducer(undefined, {});
      expect(state).to.equal(initialState);
      expect(state).to.be.an('object');
      expect(state).to.be.an.instanceof(Map);
      expect(state).to.equal(Map({}));
    });

    describe('file uploading', () => {
      it('must initialise a specific upload process', () => {
        const containerId = 'alsdjlaskjdalskjd';
        const state = reducer(undefined, {});
        expect(reducer(state, init(containerId))).to.eql(
          fromJS({
            [containerId]: {
              uploaded: {},
              uploading: {},
              failed: {},
              removed: {},
            },
          })
        );
      });

      it('must add file among other files for upload', () => {
        const containerId = 'abc123';
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const action = {
          type: actionTypes.START_UPLOAD_PENDING,
          meta: { containerId, file },
        };

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, action);
        const filesToUpload = state.getIn([containerId, 'uploading']);
        expect(filesToUpload).to.be.an.instanceof(Map);
        expect(filesToUpload.size).to.equal(1);
        expect(filesToUpload.get(file.name)).to.equal(
          fromJS({
            file,
            partialFile: null,
            uploadedFile: null,
            cancelRequested: false,
            canceling: false,
            completing: false,
          })
        );
      });

      it('must mark file as uploaded', () => {
        const containerId = 'abc123';
        const file = { name: 'XYZ.jpg', size: 123456789 };

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, testAddFile(containerId, file));
        state = reducer(state, finalizeUpload(containerId, file));

        const filesToUpload = state.getIn([containerId, 'uploading']);
        const uploadedFiles = state.getIn([containerId, 'uploaded']);

        expect(filesToUpload).to.be.an.instanceof(Map);
        expect(filesToUpload.size).to.equal(0);

        expect(uploadedFiles).to.be.an.instanceof(Map);
        expect(uploadedFiles.size).to.equal(1);
      });

      it('must mark file as failed', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const containerId = 'abc123';

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, testAddFile(containerId, file));
        state = reducer(state, manuallyFailUpload(containerId, file, 'the msg'));

        const filesToUpload = state.getIn([containerId, 'uploading']);
        const failedFiles = state.getIn([containerId, 'failed']);

        expect(filesToUpload).to.be.an.instanceof(Map);
        expect(filesToUpload.size).to.equal(0);

        expect(failedFiles).to.be.an.instanceof(Map);
        expect(failedFiles.size).to.equal(1);
        expect(failedFiles.first()).to.equal(
          fromJS({
            file,
            error: { message: 'the msg' },
          })
        );
      });

      it('must remove file from the list of uploaded files and add it to the list of removed files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const containerId = 'abc123';

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, testAddFile(containerId, file));
        state = reducer(state, finalizeUpload(containerId, file));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFile(containerId, file.name));
        const uploadedFiles = state.getIn([containerId, 'uploaded']);
        const removedFiles = state.getIn([containerId, 'removed']);
        expect(uploadedFiles.size).to.equal(0);
        expect(removedFiles.size).to.equal(1);
      });

      it('must return a removed uploaded file among the other uploaded files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const containerId = 'abc123';

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, testAddFile(containerId, file));
        state = reducer(state, finalizeUpload(containerId, file));
        state = reducer(state, removeFile(containerId, file.name));

        // now that the file is removed, return it back
        state = reducer(state, restoreRemovedFile(containerId, file.name));
        const removedFiles = state.getIn([containerId, 'removed']);
        const uploadedFiles = state.getIn([containerId, 'uploaded']);
        expect(removedFiles.size).to.equal(0);
        expect(uploadedFiles.size).to.equal(1);
      });

      it('must remove file from the list of failed files and throw it away definitelly', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const containerId = 'abc123';

        let state = reducer(reducer(undefined, {}), init(containerId));
        state = reducer(state, testAddFile(containerId, file));
        state = reducer(state, manuallyFailUpload(containerId, file, 'the msg'));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFailedFile(containerId, file.name));
        const failedFiles = state.getIn([containerId, 'failed']);
        expect(failedFiles.size).to.equal(0);
      });
    });
  });
});
