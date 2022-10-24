import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import Button from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import { DownloadIcon, LoadingIcon } from '../../components/icons';
import { download } from '../../redux/modules/files';
import { fetchContentIfNeeded } from '../../redux/modules/filesContent';
import { getFilesContent } from '../../redux/selectors/files';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SourceCodeViewer from '../../components/helpers/SourceCodeViewer';
import DownloadSolutionArchiveContainer from '../DownloadSolutionArchiveContainer';
import UsersNameContainer from '../UsersNameContainer';

import styles from './sourceCode.less';

const nameComparator = (a, b) => a.name.localeCompare(b.name, 'en');

const preprocessZipEntries = ({ zipEntries, ...file }) => {
  if (zipEntries) {
    file.zipEntries = zipEntries
      .filter(({ name, size }) => !name.endsWith('/') || size !== 0)
      .map(({ name, size }) => ({ name, size, id: `${file.id}/${name}`, parentId: file.id }))
      .sort(nameComparator);
  }
  return file;
};

const preprocessFiles = defaultMemoize(files =>
  files
    .sort(nameComparator)
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, file, ...(file.zipEntries || [])], [])
    .filter(file => !file.name.toLowerCase().endsWith('.zip'))
);

class SourceCodeViewerContainer extends Component {
  componentDidMount() {
    const { fileId, loadAsync } = this.props;
    if (fileId !== null) {
      loadAsync();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.fileId !== null &&
      (this.props.fileId !== prevProps.fileId || this.props.zipEntry !== prevProps.zipEntry)
    ) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      show,
      onHide,
      download,
      solutionId,
      fileId,
      fileName = '',
      zipEntry,
      files,
      content,
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
                <SourceCodeViewer content="" name="loading" solutionId={solutionId} />
              </div>
            </Modal.Body>
          </Modal>
        }
        resource={content}>
        {content => (
          <Modal show={show} onHide={onHide} dialogClassName={styles.modal} size="xl">
            <Modal.Header closeButton>
              <ResourceRenderer resource={files}>
                {files => (
                  <>
                    <DropdownButton
                      size="sm"
                      className="elevation-2 text-monospace"
                      title={fileName}
                      variant="outline-secondary">
                      {preprocessFiles(files).map(f => (
                        <Dropdown.Item
                          key={`${f.id}/${f.name}`}
                          href="#"
                          selected={f.id === fileId || (f.parentId === fileId && f.name === fileName)}
                          onClick={() => openAnotherFile(f.parentId || f.id, f.name, f.parentId ? f.name : null)}>
                          {f.name}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>

                    <Button size="sm" className="mx-2 " onClick={() => download(fileId, zipEntry)}>
                      <DownloadIcon gapRight />
                      <FormattedMessage id="app.sourceCodeViewer.downloadButton" defaultMessage="Download file" />
                    </Button>

                    {files.length > 0 && (
                      <DownloadSolutionArchiveContainer
                        solutionId={solutionId}
                        size="sm"
                        variant="outline-secondary"
                        isReference={isReference}
                        authorId={submittedBy}
                      />
                    )}
                  </>
                )}
              </ResourceRenderer>

              {submittedBy && (
                <span className="pt-1 px-4">
                  <UsersNameContainer userId={submittedBy} showEmail="icon" />
                </span>
              )}
            </Modal.Header>

            <Modal.Body className={styles.modalBody}>
              {(content.malformedCharacters || content.tooLarge) && (
                <Callout variant="warning" className="m-2">
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
                </Callout>
              )}

              {content.malformedCharacters ? (
                <pre className="border-top">{content.content}</pre>
              ) : (
                <SourceCodeViewer content={content.content} name={fileName} solutionId={solutionId} />
              )}
              <div className="border-top pt-1 bg-light rounded-bottom"></div>
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
  fileName: PropTypes.string,
  zipEntry: PropTypes.string,
  files: ImmutablePropTypes.map,
  show: PropTypes.bool,
  isReference: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  openAnotherFile: PropTypes.func.isRequired,
  submittedBy: PropTypes.string,
  content: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  download: PropTypes.func.isRequired,
};

export default connect(
  (state, { fileId, zipEntry = null }) => ({
    content: getFilesContent(fileId, zipEntry)(state),
  }),
  (dispatch, { fileId, zipEntry = null }) => ({
    loadAsync: () => (fileId ? dispatch(fetchContentIfNeeded(fileId, zipEntry)) : Promise.resolve()),
    download: (id, entry = null) => dispatch(download(id, entry)),
  })
)(SourceCodeViewerContainer);
