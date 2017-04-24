import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';

import AttachedFilesTable from '../../components/Exercises/AttachedFilesTable';

import { reset } from '../../redux/modules/upload';
import {
  createGetUploadedFiles,
  createAllUploaded
} from '../../redux/selectors/upload';

class AttachedFilesTableContainer extends Component {
  componentWillMount() {
    AttachedFilesTableContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.uploadId !== newProps.uploadId) {
      AttachedFilesTableContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadFiles }) => {
    loadFiles();
  };

  render = () => <AttachedFilesTable {...this.props} />;
}

AttachedFilesTableContainer.propTypes = {
  uploadId: PropTypes.string.isRequired,
  attachments: ImmutablePropTypes.map,
  newFiles: ImmutablePropTypes.list,
  canSubmit: PropTypes.bool,
  addFiles: PropTypes.func
};

export default connect(
  (state, { uploadId }) => ({
    uploadId,
    newFiles: createGetUploadedFiles(uploadId)(state) || List(),
    canSubmit: createAllUploaded(uploadId)(state)
  }),
  (dispatch, { uploadId, addFiles }) => ({
    addFiles: files => addFiles(files.toJS()).then(dispatch(reset(uploadId)))
  })
)(AttachedFilesTableContainer);
