import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import PlagiarismCodeBox from '../PlagiarismCodeBox';
import SourceCodeBox from '../SourceCodeBox';
import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { CloseIcon, CodeFileIcon, LoadingIcon } from '../../icons';

/**
 * Construct an object { fileIdx => fragmentsArray } where the fragments array holds only
 * references to the left (target) part. Selected file fragments are excluded.
 */
const getRemainingFragments = defaultMemoize((files, selected) => {
  const res = {};
  files.forEach((file, idx) => {
    if (idx !== selected) {
      res[idx] = file.fragments.map(f => f[0]);
    }
  });
  return Object.keys(res).length > 0 ? res : null;
});

class PlagiarismCodeBoxWithSelector extends Component {
  state = { selectedFile: 0, dialogOpen: false };

  componentDidUpdate(prevProps) {
    if (
      this.props.selectedPlagiarismSource !== prevProps.selectedPlagiarismSource &&
      (this.state.selectedFile !== 0 || this.state.dialogOpen)
    ) {
      this.setState({ selectedFile: 0, dialogOpen: false });
    }
  }

  openDialog = ev => {
    this.setState({ dialogOpen: true });
    ev.stopPropagation();
  };

  closeDialog = () => this.setState({ dialogOpen: false });

  selectFile = selectedFile => this.setState({ selectedFile, dialogOpen: false });

  render() {
    const { file, solutionId, selectedPlagiarismSource = null, download, fileContentsSelector } = this.props;
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
              solutionId={solutionId}
              download={download}
              fileContentsSelector={fileContentsSelector}
              selectedPlagiarismFile={selectedPlagiarismSource.files[this.state.selectedFile]}
              selectPlagiarismFile={selectedPlagiarismSource.files.length > 1 ? this.selectFile : null}
              openSelectFileDialog={selectedPlagiarismSource.files.length > 1 ? this.openDialog : null}
              similarity={selectedPlagiarismSource.similarity}
              remainingFragments={getRemainingFragments(selectedPlagiarismSource.files, this.state.selectedFile)}
            />
            {selectedPlagiarismSource.files.length > 1 && (
              <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                <Modal.Header closeButton>
                  <Modal.Title>
                    <FormattedMessage
                      id="app.solutionPlagiarisms.selectPlagiarismFileModal.title"
                      defaultMessage="Select one of the possible source files to be compared"
                    />
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  <Table hover className="m-0">
                    <tbody>
                      {selectedPlagiarismSource.files.map((file, idx) => (
                        <tr
                          key={file.id}
                          className={this.state.selectedFile === idx ? 'table-primary' : 'clickable'}
                          onClick={this.state.selectedFile !== idx ? () => this.selectFile(idx) : null}>
                          <td className="text-nowrap shrink-col">
                            <CodeFileIcon className="text-muted" gapLeft gapRight />
                          </td>
                          <td>
                            <code>
                              {file.solutionFile.name}
                              {file.fileEntry ? `/${file.fileEntry}` : ''}
                            </code>
                          </td>
                          <td>
                            <FormattedMessage
                              id="app.solutionPlagiarisms.selectPlagiarismFileModal.fromSolution"
                              defaultMessage="solution"
                            />{' '}
                            <strong>#{file.solution.attemptIndex}</strong>
                          </td>
                          <td>
                            (<DateTime unixts={file.solution.createdAt} />)
                          </td>
                          <td className="small">
                            <GroupsNameContainer groupId={file.groupId} admins />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.closeDialog}>
                    <CloseIcon gapRight />
                    <FormattedMessage id="generic.close" defaultMessage="Close" />
                  </Button>
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
};

export default PlagiarismCodeBoxWithSelector;
