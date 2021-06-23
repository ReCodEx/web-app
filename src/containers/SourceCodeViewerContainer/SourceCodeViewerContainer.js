import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Dropdown, DropdownButton, Modal } from 'react-bootstrap';

import Button from '../../components/widgets/TheButton';
import { DownloadIcon, LoadingIcon } from '../../components/icons';
import { fetchFileIfNeeded, download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getFile, getFilesContent } from '../../redux/selectors/files';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SourceCodeViewer from '../../components/helpers/SourceCodeViewer';
import DownloadSolutionArchiveContainer from '../DownloadSolutionArchiveContainer';
import UsersNameContainer from '../UsersNameContainer';

import styles from './sourceCode.less';

class SourceCodeViewerContainer extends Component {
  componentDidMount() {
    const { fileId, loadAsync } = this.props;
    if (fileId !== null) {
      loadAsync();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fileId !== prevProps.fileId && this.props.fileId !== null) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      show,
      onHide,
      download,
      file,
      files,
      content,
      solutionId,
      openAnotherFile,
      isReference = false,
      submittedBy = null,
    } = this.props;
    return (
      <ResourceRenderer
        loading={
          <Modal show={show} onHide={onHide} dialogClassName={styles.modal} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <LoadingIcon gapRight />
                <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className={styles.modalBody}>
              <div>
                <SourceCodeViewer content="" name="loading" />
              </div>
            </Modal.Body>
          </Modal>
        }
        resource={[file, content]}>
        {(file, content) => (
          <Modal show={show} onHide={onHide} dialogClassName={styles.modal} size="xl">
            <Modal.Header closeButton>
              <DropdownButton
                size="sm"
                className="elevation-2 text-monospace"
                title={file.name}
                variant="outline-secondary">
                {files
                  .sort((a, b) => a.name.localeCompare(b.name, 'en'))
                  .map(f => (
                    <Dropdown.Item
                      key={f.id}
                      href="#"
                      selected={f.id === file.id}
                      onClick={() => openAnotherFile(f.id)}>
                      {f.name}
                    </Dropdown.Item>
                  ))}
              </DropdownButton>

              <Button size="sm" className="mx-2 " onClick={() => download(file.id)}>
                <DownloadIcon gapRight />
                <FormattedMessage id="app.sourceCodeViewer.downloadButton" defaultMessage="Download file" />
              </Button>

              {files.length > 1 && (
                <DownloadSolutionArchiveContainer
                  solutionId={solutionId}
                  simpleButton
                  size="sm"
                  variant="outline-secondary"
                  isReference={isReference}
                />
              )}

              {submittedBy && (
                <span className="pt-1 px-4">
                  <UsersNameContainer userId={submittedBy} showEmail="icon" noLink />
                </span>
              )}
            </Modal.Header>

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
          </Modal>
        )}
      </ResourceRenderer>
    );
  }
}

SourceCodeViewerContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  fileId: PropTypes.string,
  files: PropTypes.array.isRequired,
  show: PropTypes.bool,
  isReference: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  openAnotherFile: PropTypes.func.isRequired,
  submittedBy: PropTypes.string,
  file: ImmutablePropTypes.map,
  content: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
};

export default connect(
  (state, { fileId }) => ({
    file: fileId && getFile(fileId)(state),
    content: getFilesContent(fileId)(state),
  }),
  (dispatch, { fileId }) => ({
    loadAsync: () =>
      fileId
        ? Promise.all([dispatch(fetchFileIfNeeded(fileId)), dispatch(fetchContentIfNeeded(fileId))])
        : Promise.resolve(),
    download: id => dispatch(download(id)),
  })
)(SourceCodeViewerContainer);
