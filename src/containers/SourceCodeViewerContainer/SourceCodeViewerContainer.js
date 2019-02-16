import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { DownloadIcon, LoadingIcon } from '../../components/icons';

import { fetchFileIfNeeded, download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getFile, getFilesContent } from '../../redux/selectors/files';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SourceCodeViewer from '../../components/helpers/SourceCodeViewer';

import styles from './sourceCode.less';

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
    const { show, onHide, download, file, content } = this.props;
    return (
      <ResourceRenderer
        loading={
          <Modal show={show} onHide={onHide} dialogClassName={styles.modal}>
            <div>
              <Modal.Header closeButton>
                <Modal.Title>
                  <LoadingIcon gapRight />
                  <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
                </Modal.Title>
              </Modal.Header>
            </div>
            <div>
              <Modal.Body className={styles.modalBody}>
                <div>
                  <SourceCodeViewer content="" name="" />
                </div>
              </Modal.Body>
            </div>
            <div>
              <Modal.Footer>
                <Button disabled>
                  <DownloadIcon gapRight />
                  <FormattedMessage id="app.sourceCodeViewer.downloadButton" defaultMessage="Download file" />
                </Button>
              </Modal.Footer>
            </div>
          </Modal>
        }
        resource={[file, content]}>
        {(file, content) => (
          <Modal show={show} onHide={onHide} dialogClassName={styles.modal}>
            <div>
              <Modal.Header closeButton>
                <Modal.Title>{file.name}</Modal.Title>
              </Modal.Header>
            </div>
            <div>
              <Modal.Body className={styles.modalBody}>
                {(content.malformedCharacters || content.tooLarge) && (
                  <div className="callout callout-warning">
                    {content.malformedCharacters && (
                      <p>
                        <FormattedMessage
                          id="app.sourceCodeViewer.utf8Warning"
                          defaultMessage="The source file is not a valid UTF-8 file. Some characters may be displayed incorrectly. Use the download button to see unaltered source file."
                        />
                      </p>
                    )}
                    {content.tooLarge && (
                      <p>
                        <FormattedMessage
                          id="app.sourceCodeViewer.incompleteWarning"
                          defaultMessage="The selected source file is too large. Only a leading part of the file is displayed here. Use the download button to get the whole file."
                        />
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <SourceCodeViewer content={content.content} name={file.name} />
                </div>
              </Modal.Body>
            </div>
            <div>
              <Modal.Footer>
                <Button onClick={() => download(file.id)}>
                  <DownloadIcon gapRight />
                  <FormattedMessage id="app.sourceCodeViewer.downloadButton" defaultMessage="Download file" />
                </Button>
              </Modal.Footer>
            </div>
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
  content: ImmutablePropTypes.map,
};

export default connect(
  (state, { fileId }) => ({
    file: getFile(fileId)(state),
    content: getFilesContent(fileId)(state),
  }),
  (dispatch, { fileId }) => ({
    loadAsync: () => Promise.all([dispatch(fetchFileIfNeeded(fileId)), dispatch(fetchContentIfNeeded(fileId))]),
    download: id => dispatch(download(id)),
  })
)(SourceCodeViewerContainer);
