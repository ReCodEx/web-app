import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import FilesTable from '../../components/Exercises/FilesTable';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { reset } from '../../redux/modules/upload';
import { createGetUploadedFiles, createAllUploaded } from '../../redux/selectors/upload';
import { isLoadingState } from '../../redux/helpers/resourceManager/status';

class FilesTableContainer extends Component {
  componentDidMount() {
    FilesTableContainer.loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.uploadId !== prevProps.uploadId) {
      FilesTableContainer.loadData(this.props);
    }
  }

  static loadData = ({ loadFiles }) => {
    loadFiles();
  };

  render() {
    const { title, isOpen = true, files, fetchFilesStatus, ...restProps } = this.props;

    return (
      <Box title={title} collapsable isOpen={isOpen} unlimitedHeight>
        <ResourceRenderer
          resource={files.toArray()}
          returnAsArray
          forceLoading={fetchFilesStatus && isLoadingState(fetchFilesStatus)}>
          {filesJs => <FilesTable files={filesJs} {...restProps} />}
        </ResourceRenderer>
      </Box>
    );
  }
}

FilesTableContainer.propTypes = {
  uploadId: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  isOpen: PropTypes.bool,
  files: ImmutablePropTypes.map,
  usedFiles: PropTypes.instanceOf(Set),
  fetchFilesStatus: PropTypes.string,
  newFiles: PropTypes.array,
  canSubmit: PropTypes.bool,
  addFiles: PropTypes.func,
};

export default connect(
  (state, { uploadId }) => ({
    uploadId,
    newFiles: createGetUploadedFiles(uploadId)(state),
    canSubmit: createAllUploaded(uploadId)(state),
  }),
  (dispatch, { uploadId, addFiles }) => ({
    addFiles: files => addFiles(files).then(dispatch(reset(uploadId))),
  })
)(FilesTableContainer);
