import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import Button from '../../components/AdminLTE/FlatButton';
import { DownloadIcon, LoadingIcon } from '../../components/Icons';

import { fetchFileIfNeeded, download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getFile, getFilesContent } from '../../redux/selectors/files';
import ResourceRenderer from '../../components/ResourceRenderer';
import SourceCodeViewer from '../../components/SourceCodeViewer';

class SourceCodeViewerContainer extends Component {
  componentWillMount() {
    const { fileId, loadAsync } = this.props;
    if (fileId !== null) {
      loadAsync();
    }
  }

  componentWillReceiveProps({ fileId, loadAsync }) {
    if (this.props.fileId !== fileId && fileId !== null) {
      loadAsync();
    }
  }

  render() {
    const { show, onHide, download, file, code } = this.props;
    return (
      <ResourceRenderer
        loading={
          <Modal show={show} onHide={onHide} bsSize="large">
            <Modal.Header closeButton>
              <Modal.Title>
                <LoadingIcon />
                {' '}
                <FormattedMessage
                  id="app.sourceCodeViewer.loading"
                  defaultMessage="Loading ..."
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SourceCodeViewer content="" name="" />
            </Modal.Body>
            <Modal.Footer>
              <Button disabled>
                <DownloadIcon />
                {' '}
                <FormattedMessage
                  id="app.sourceCodeViewer.downloadButton"
                  defaultMessage="Download file"
                />
              </Button>
            </Modal.Footer>
          </Modal>
        }
        resource={[file, code]}
      >
        {(file, code) => (
          <Modal show={show} onHide={onHide} bsSize="large">
            <Modal.Header closeButton>
              <Modal.Title>{file.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SourceCodeViewer content={code} name={file.name} />
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => download(file.id)}>
                <DownloadIcon />
                {' '}
                <FormattedMessage
                  id="app.sourceCodeViewer.downloadButton"
                  defaultMessage="Download file"
                />
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </ResourceRenderer>
    );
  }
}

SourceCodeViewerContainer.propTypes = {
  fileId: PropTypes.string,
  file: ImmutablePropTypes.map,
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
  code: ImmutablePropTypes.map
};

export default connect(
  (state, { fileId }) => ({
    file: getFile(fileId)(state),
    code: getFilesContent(fileId)(state)
  }),
  (dispatch, { fileId }) => ({
    loadAsync: () =>
      Promise.all([
        dispatch(fetchFileIfNeeded(fileId)),
        dispatch(fetchContentIfNeeded(fileId))
      ]),
    download: id => dispatch(download(id))
  })
)(SourceCodeViewerContainer);
