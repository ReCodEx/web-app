import reducer, {
  actionTypes,
  initialState,
  init,
  addFile,
  removeFile,
  removeFailedFile,
  returnFile,
  uploadSuccessful,
  uploadFailed,
} from '../../../src/redux/modules/upload';

import { fromJS, Map, List } from 'immutable';

import chai from 'chai';
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
      const id = '123';
      expect(removeFile(id, file)).to.eql({
        type: actionTypes.REMOVE_FILE,
        payload: file,
        meta: { id },
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
        const id = 'alsdjlaskjdalskjd';
        const state = reducer(undefined, {});
        expect(reducer(state, init(id))).to.eql(
          fromJS({
            [id]: {
              uploaded: [],
              uploading: [],
              failed: [],
              removed: [],
            },
          })
        );
      });

      it('must add file among other files for upload', () => {
        const id = 'abc123';
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const action = {
          type: actionTypes.UPLOAD_PENDING,
          payload: {
            [file.name]: file,
          },
          meta: { id, fileName: file.name },
        };

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, action);
        const filesToUpload = state.getIn([id, 'uploading']);
        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(1);
        expect(filesToUpload.first()).to.eql({
          name: file.name,
          file,
        });
      });

      it('must mark file as uploaded', () => {
        const id = 'abc123';
        const file = { name: 'XYZ.jpg', size: 123456789 };

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, addFile(id, file));
        state = reducer(state, uploadSuccessful(id, file));

        const filesToUpload = state.getIn([id, 'uploading']);
        const uploadedFiles = state.getIn([id, 'uploaded']);

        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(0);

        expect(uploadedFiles).to.be.an.instanceof(List);
        expect(uploadedFiles.size).to.equal(1);
        expect(uploadedFiles.first()).to.eql({
          name: file.name,
          file,
        });
      });

      it('must mark file as failed', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const id = 'abc123';

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, addFile(id, file));
        state = reducer(state, uploadFailed(id, file));

        const filesToUpload = state.getIn([id, 'uploading']);
        const failedFiles = state.getIn([id, 'failed']);

        expect(filesToUpload).to.be.an.instanceof(List);
        expect(filesToUpload.size).to.equal(0);

        expect(failedFiles).to.be.an.instanceof(List);
        expect(failedFiles.size).to.equal(1);
        expect(failedFiles.first()).to.eql({
          name: file.name,
          file,
        });
      });

      it('must remove file from the list of uploaded files and add it to the list of removed files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const id = 'abc123';

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, addFile(id, file));
        state = reducer(state, uploadSuccessful(id, file));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFile(id, file));
        const uploadedFiles = state.getIn([id, 'uploaded']);
        const removedFiles = state.getIn([id, 'removed']);
        expect(uploadedFiles.size).to.equal(0);
        expect(removedFiles.size).to.equal(1);
        expect(removedFiles.first()).to.eql(file);
      });

      it('must return a removed uploaded file among the other uploaded files', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const id = 'abc123';

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, addFile(id, file));
        state = reducer(state, uploadSuccessful(id, file));
        state = reducer(state, removeFile(id, file));

        // now that the file is removed, return it back
        state = reducer(state, returnFile(id, file));
        const removedFiles = state.getIn([id, 'removed']);
        const uploadedFiles = state.getIn([id, 'uploaded']);
        expect(removedFiles.size).to.equal(0);
        expect(uploadedFiles.size).to.equal(1);
        expect(uploadedFiles.first()).to.eql(file);
      });

      it('must remove file from the list of failed files and throw it away definitelly', () => {
        const file = { name: 'XYZ.jpg', size: 123456789 };
        const id = 'abc123';

        let state = reducer(reducer(undefined, {}), init(id));
        state = reducer(state, addFile(id, file));
        state = reducer(state, uploadFailed(id, file));

        // now that the file is in the list, remove it!
        state = reducer(state, removeFailedFile(id, file));
        const failedFiles = state.getIn([id, 'failed']);
        expect(failedFiles.size).to.equal(0);
      });
    });
  });
});
