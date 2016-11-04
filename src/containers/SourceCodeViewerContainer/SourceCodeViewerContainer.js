import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

import { fetchFileIfNeeded } from '../../redux/modules/files';
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
    const { show, onHide, file, code } = this.props;
    return (
      <Modal
        show={show}
        onHide={onHide}
        bsSize='large'>
        <Modal.Header closeButton>
          <Modal.Title>
            <ResourceRenderer resource={file}>
              {file => <span>{file.name}</span>}
            </ResourceRenderer>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ResourceRenderer resource={code}>
            {code => { console.log(code); return (
              <SourceCodeViewer
                content={code}
                show={show}
                lineNumbers={true} />
            );}}
          </ResourceRenderer>
        </Modal.Body>
      </Modal>
    );
  }

}

SourceCodeViewerContainer.propTypes = {
  fileId: PropTypes.string,
  file: PropTypes.object,
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { fileId }) => ({
    file: getFile(fileId)(state),
    code: getFilesContent(fileId)(state)
  }),
  (dispatch, { fileId }) => ({
    loadAsync: () => Promise.all([
      dispatch(fetchFileIfNeeded(fileId)),
      dispatch(fetchContentIfNeeded(fileId))
    ])
  })
)(SourceCodeViewerContainer);
