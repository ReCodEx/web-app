import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, Table } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import PlagiarismCodeBox from '../PlagiarismCodeBox';
import SourceCodeBox from '../SourceCodeBox';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import InsetPanel from '../../widgets/InsetPanel';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Icon, { CodeCompareIcon, CloseIcon, LoadingIcon } from '../../icons';
import FileSelectionTableRow from './FileSelectionTableRow';

/**
 * Construct an object { fileIdx => fragmentsArray } where the fragments array holds only
 * references to the left (target) part. Selected file fragments are excluded.
 */
const getRemainingFragments = lruMemoize((files, selected) => {
  const res = {};
  files.forEach((file, idx) => {
    if (idx !== selected) {
      res[idx] = file.fragments.map(f => f[0]);
    }
  });
  return Object.keys(res).length > 0 ? res : null;
});

class PlagiarismCodeBoxWithSelector extends Component {
  state = { selectedFile: 0, dialogOpen: false, switchTo: null };

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedPlagiarismSource !== prevProps.selectedPlagiarismSource &&
      (this.state.selectedFile !== 0 || this.state.dialogOpen)
    ) {
      this.setState({ selectedFile: 0, dialogOpen: false });
    }
  }

  openDialog = (ev, switchToRaw = null) => {
    // restrict to which files a switch is possible
    let switchTo =
      switchToRaw &&
      switchToRaw.filter(id => id !== this.state.selectedFile && id < this.props.selectedPlagiarismSource.files.length);
    if (switchTo && switchTo.length === 0) {
      switchTo = null;
    }

    this.setState({ dialogOpen: true, switchTo });

    if (ev) {
      ev.stopPropagation();
    }
  };

  closeDialog = () => this.setState({ dialogOpen: false });

  selectFile = selectedFile => this.setState({ selectedFile, dialogOpen: false });

  render() {
    const {
      file,
      solutionId,
      selectedPlagiarismSource = null,
      download,
      fileContentsSelector,
      authorId = null,
      sourceAuthorId = null,
    } = this.props;
    const sourceContents =
      selectedPlagiarismSource &&
      selectedPlagiarismSource.files.map(file => file && fileContentsSelector(file.solutionFile.id, file.fileEntry));

    return selectedPlagiarismSource ? (
      <ResourceRenderer
        key={file.id}
        resource={sourceContents}
        returnAsArray
        loading={
          <Box
            key={`${file.id}-loading`}
            title={
              <>
                <LoadingIcon gapRight />
                <code>{file.name}</code>
              </>
            }
            noPadding
          />
        }>
        {() => (
          <>
            <PlagiarismCodeBox
              {...file}
              authorId={authorId}
              sourceAuthorId={sourceAuthorId}
              solutionId={solutionId}
              download={download}
              fileContentsSelector={fileContentsSelector}
              selectedPlagiarismFile={selectedPlagiarismSource.files[this.state.selectedFile]}
              selectPlagiarismFile={selectedPlagiarismSource.files.length > 1 ? this.selectFile : null}
              openSelectFileDialog={selectedPlagiarismSource.files.length > 1 ? this.openDialog : null}
              sourceFilesCount={selectedPlagiarismSource.files.length}
              similarity={selectedPlagiarismSource.similarity}
              remainingFragments={getRemainingFragments(selectedPlagiarismSource.files, this.state.selectedFile)}
            />

            {selectedPlagiarismSource.files.length > 1 && (
              <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                <Modal.Header closeButton>
                  <Modal.Title>
                    {this.state.selectedFile !== null && this.state.switchTo ? (
                      <FormattedMessage
                        id="app.solutionPlagiarisms.selectPlagiarismFileModal.titleSwitch"
                        defaultMessage="Change the displayed source file (on the right)"
                      />
                    ) : (
                      <FormattedMessage
                        id="app.solutionPlagiarisms.selectPlagiarismFileModal.title"
                        defaultMessage="Select one of the possible source files to be compared (on the right)"
                      />
                    )}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  {this.state.selectedFile !== null && this.state.switchTo && (
                    <InsetPanel className="m-1">
                      <FormattedMessage
                        id="app.solutionPlagiarisms.selectPlagiarismFileModal.switchToExplain"
                        defaultMessage="The area you wish to visualize is not covered by the selected source file. You may switch to another file that covers it."
                      />
                    </InsetPanel>
                  )}

                  <Table hover className="m-0">
                    {this.state.selectedFile !== null && this.state.switchTo ? (
                      <tbody>
                        <FileSelectionTableRow
                          file={selectedPlagiarismSource.files[this.state.selectedFile]}
                          idx={this.state.selectedFile}
                          selected
                        />
                        <tr>
                          <td colSpan={7} className="text-center larger p-3 text-success">
                            <Icon icon={['far', 'circle-down']} />
                          </td>
                        </tr>
                        {this.state.switchTo.map(idx => (
                          <FileSelectionTableRow
                            key={idx}
                            file={selectedPlagiarismSource.files[idx]}
                            idx={idx}
                            selected={this.state.selectedFile === idx}
                            selectFile={this.selectFile}
                          />
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        {selectedPlagiarismSource.files.map((file, idx) => (
                          <FileSelectionTableRow
                            key={idx}
                            file={file}
                            idx={idx}
                            selected={this.state.selectedFile === idx}
                            selectFile={this.selectFile}
                          />
                        ))}
                      </tbody>
                    )}
                  </Table>
                </Modal.Body>
                <Modal.Footer>
                  <TheButtonGroup>
                    {this.state.selectedFile !== null && this.state.switchTo && this.state.switchTo.length === 1 && (
                      <Button variant="success" onClick={() => this.selectFile(this.state.switchTo[0])}>
                        <CodeCompareIcon gapRight />
                        <FormattedMessage id="generic.change" defaultMessage="Change" />
                      </Button>
                    )}
                    <Button variant="secondary" onClick={this.closeDialog}>
                      <CloseIcon gapRight />
                      <FormattedMessage id="generic.close" defaultMessage="Close" />
                    </Button>
                  </TheButtonGroup>
                </Modal.Footer>
              </Modal>
            )}
          </>
        )}
      </ResourceRenderer>
    ) : (
      <SourceCodeBox
        {...file}
        solutionId={solutionId}
        download={download}
        fileContentsSelector={fileContentsSelector}
        collapseable
        isOpen={false}
        titleSuffix={
          <small className="text-muted ml-3">
            (
            <FormattedMessage
              id="app.solutionPlagiarisms.noMatchesForFile"
              defaultMessage="no matching sources for this file"
            />
            )
          </small>
        }
      />
    );
  }
}

PlagiarismCodeBoxWithSelector.propTypes = {
  file: PropTypes.object.isRequired,
  solutionId: PropTypes.string.isRequired,
  download: PropTypes.func,
  fileContentsSelector: PropTypes.func,
  selectedPlagiarismSource: PropTypes.object.isRequired,
  authorId: PropTypes.string,
  sourceAuthorId: PropTypes.string,
};

export default PlagiarismCodeBoxWithSelector;
