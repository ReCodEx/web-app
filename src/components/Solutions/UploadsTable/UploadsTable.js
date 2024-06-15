import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { Table, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import Icon, { CloseIcon, DeleteIcon, LoadingIcon, SuccessIcon, UploadIcon, WarningIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import HighlightedText from '../../widgets/HighlightedText';
import { getErrorMessage } from '../../../locales/apiErrorMessages';

const estimateCompletionTime = lruMemoize(({ totalSize, uploadedSize, startedAt, updatedAt }) => {
  if (!totalSize) {
    return null;
  }

  const timePassed = updatedAt - startedAt;
  const relativeUploaded = uploadedSize / totalSize;
  if (relativeUploaded < 0.01 || timePassed < 3) {
    return null; // not enough data to make any estimates
  }

  return ((totalSize - uploadedSize) * timePassed) / uploadedSize;
});

const UploadsTable = ({
  existingFiles = null,
  uploadingFiles = [],
  uploadedFiles = [],
  failedFiles = [],
  removedFiles = [],
  doRequestUploadCancel,
  doRemoveFile,
  doRestoreRemovedFile,
  doRemoveFailedFile,
  doRetryUploadFile,
  intl: { locale, formatMessage },
}) => (
  <InsetPanel className="px-2 py-0 mb-2">
    <Table responsive size="sm" className="mb-1">
      <thead>
        <tr>
          <th />
          <th className="full-width text-nowrap">
            <FormattedMessage id="app.uploadFiles.fileName" defaultMessage="File Name" />
          </th>
          <th className="text-nowrap">
            <FormattedMessage id="generic.size" defaultMessage="Size" />
          </th>
          <th />
        </tr>
      </thead>

      <tbody>
        {uploadingFiles &&
          uploadingFiles
            .sort((a, b) => a.file.name.localeCompare(b.file.name, locale))
            .map(uploading => (
              <tr key={'uploading-' + uploading.file.name}>
                <td className="text-left valign-middle text-nowrap">
                  {uploading.canceling || uploading.cancelRequested ? (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`cancelIco-${uploading.file.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.cancelIconTooltip"
                            defaultMessage="Canceling the upload..."
                          />
                        </Tooltip>
                      }>
                      <CloseIcon className="faa-burst animated text-danger" gapRight fixedWidth />
                    </OverlayTrigger>
                  ) : uploading.completing ? (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`completingIco-${uploading.file.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.completingIconTooltip"
                            defaultMessage="The server is consolidating uploaded data..."
                          />
                        </Tooltip>
                      }>
                      <SuccessIcon className="text-success faa-pulse animated" gapRight fixedWidth />
                    </OverlayTrigger>
                  ) : uploading.partialFile !== null ? (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`uploadIco-${uploading.file.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.uploadIconTooltip"
                            defaultMessage="The file is being uploaded..."
                          />
                        </Tooltip>
                      }>
                      <UploadIcon className="faa-rising animated text-primary" gapRight fixedWidth />
                    </OverlayTrigger>
                  ) : (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`loadingIco-${uploading.file.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.loadingIconTooltip"
                            defaultMessage="Initiating the file upload..."
                          />
                        </Tooltip>
                      }>
                      <LoadingIcon gapRight fixedWidth />
                    </OverlayTrigger>
                  )}
                </td>
                <td className="text-monospace full-width">
                  {uploading.file.name}
                  <br />
                  <ProgressBar
                    min={0}
                    max={uploading.partialFile ? uploading.partialFile.totalSize : 1}
                    now={uploading.partialFile ? uploading.partialFile.uploadedSize : 0}
                    animated
                    variant="success"
                    className="progress-xs"
                  />
                </td>
                <td className="text-nowrap small valign-middle">
                  {uploading.partialFile && (
                    <>
                      <FormattedMessage
                        id="app.uploadFiles.fileSizeOfSize"
                        defaultMessage="{uploadedSize} of {totalSize}"
                        values={{
                          uploadedSize: prettyPrintBytes(uploading.partialFile.uploadedSize),
                          totalSize: prettyPrintBytes(uploading.partialFile.totalSize),
                        }}
                      />
                      <br />
                      {!uploading.canceling &&
                        !uploading.cancelRequested &&
                        !uploading.completing &&
                        estimateCompletionTime(uploading.partialFile) !== null && (
                          <FormattedRelativeTime
                            value={estimateCompletionTime(uploading.partialFile)}
                            numeric="auto"
                            updateIntervalInSeconds={1000000}
                          />
                        )}
                    </>
                  )}
                </td>
                <td className="text-center valign-middle text-nowrap">
                  {!uploading.canceling && !uploading.cancelRequested && !uploading.completing && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`cancelbtn-${uploading.file.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.uploadingCancelTooltip"
                            defaultMessage="Cancel upload"
                          />
                        </Tooltip>
                      }>
                      <Button size="xs" variant="danger" onClick={() => doRequestUploadCancel(uploading.file.name)}>
                        <CloseIcon smallGapLeft smallGapRight />
                      </Button>
                    </OverlayTrigger>
                  )}
                </td>
              </tr>
            ))}

        {failedFiles &&
          failedFiles
            .sort((a, b) => a.file.name.localeCompare(b.file.name, locale))
            .map(failed => (
              <tr key={'failed-' + failed.file.name}>
                <td className="text-left valign-middle text-nowrap">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`failedIco-${failed.file.name}`}>
                        {failed.error ? (
                          getErrorMessage(formatMessage)(
                            failed.error,
                            <FormattedMessage
                              id="app.uploadFiles.failedIconTooltip"
                              defaultMessage="The file upload has failed!"
                            />
                          )
                        ) : (
                          <FormattedMessage
                            id="app.uploadFiles.failedIconTooltip"
                            defaultMessage="The file upload has failed!"
                          />
                        )}
                      </Tooltip>
                    }>
                    <WarningIcon className="text-danger" gapRight fixedWidth />
                  </OverlayTrigger>
                </td>
                <td className="text-monospace full-width text-danger">
                  <strong>
                    {failed.error && failed.error.code === '400-003' ? (
                      <HighlightedText regex="[^a-zA-Z0-9\- _\.()\[\]!]+">{failed.file.name}</HighlightedText>
                    ) : (
                      failed.file.name
                    )}
                  </strong>
                </td>
                <td className="text-nowrap valign-middle">{prettyPrintBytes(failed.file.size)}</td>
                <td className="text-center valign-middle text-nowrap">
                  <TheButtonGroup>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`retrybtn-${failed.file.name}`}>
                          <FormattedMessage id="app.uploadFiles.retryTooltip" defaultMessage="Retry upload" />
                        </Tooltip>
                      }>
                      <Button size="xs" variant="primary" onClick={() => doRetryUploadFile(failed.file)}>
                        <Icon smallGapLeft smallGapRight icon="sync" />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`removefailedbtn-${failed.file.name}`}>
                          <FormattedMessage id="app.uploadFiles.removeTooltip" defaultMessage="Remove from the list" />
                        </Tooltip>
                      }>
                      <Button size="xs" variant="danger" onClick={() => doRemoveFailedFile(failed.file.name)}>
                        <DeleteIcon smallGapLeft smallGapRight />
                      </Button>
                    </OverlayTrigger>
                  </TheButtonGroup>
                </td>
              </tr>
            ))}

        {uploadedFiles &&
          uploadedFiles
            .sort((a, b) => a.name.localeCompare(b.name, locale))
            .map(uploaded => (
              <tr key={'uploaded-' + uploaded.name}>
                <td className="text-left valign-middle text-nowrap">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`successIco-${uploaded.name}`}>
                        <FormattedMessage
                          id="app.uploadFiles.successIconTooltip"
                          defaultMessage="The file was uploaded to the server and is ready for subsequent processing."
                        />
                      </Tooltip>
                    }>
                    <SuccessIcon className="text-success" gapRight fixedWidth />
                  </OverlayTrigger>

                  {existingFiles && existingFiles.has(uploaded.name) && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`overwriteIco-${uploaded.name}`}>
                          <FormattedMessage
                            id="app.uploadFiles.overwriteIconTooltip"
                            defaultMessage="A file of the same name already exists. Its contents will be overwritten with this file."
                          />
                        </Tooltip>
                      }>
                      <Icon icon={['far', 'copy']} className="text-success text-warning" gapRight fixedWidth />
                    </OverlayTrigger>
                  )}
                </td>
                <td className="text-monospace full-width">{uploaded.name}</td>
                <td className="text-nowrap valign-middle">{prettyPrintBytes(uploaded.size)}</td>
                <td className="text-center valign-middle text-nowrap">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`removebtn-${uploaded.name}`}>
                        <FormattedMessage id="app.uploadFiles.removeTooltip" defaultMessage="Remove from the list" />
                      </Tooltip>
                    }>
                    <Button size="xs" variant="outline-danger" onClick={() => doRemoveFile(uploaded.name)}>
                      <DeleteIcon smallGapLeft smallGapRight />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}

        {removedFiles &&
          removedFiles
            .sort((a, b) => a.name.localeCompare(b.name, locale))
            .map(removed => (
              <tr key={'removed' + removed.name}>
                <td className="text-left valign-middle text-nowrap">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`removedIco-${removed.name}`}>
                        <FormattedMessage
                          id="app.uploadFiles.removedIconTooltip"
                          defaultMessage="The file was uploaded but removed from the list. It will not be processed with other uploaded files."
                        />
                      </Tooltip>
                    }>
                    <DeleteIcon className="text-muted" gapRight fixedWidth />
                  </OverlayTrigger>
                </td>
                <td className="text-monospace full-width text-muted">
                  <strike>{removed.name}</strike>
                </td>
                <td className="text-nowrap valign-middle text-muted">{prettyPrintBytes(removed.size)}</td>
                <td className="text-center valign-middle text-nowrap">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`removebtn-${removed.name}`}>
                        <FormattedMessage
                          id="app.uploadFiles.restoreTooltip"
                          defaultMessage="Restore previously removed file"
                        />
                      </Tooltip>
                    }>
                    <Button size="xs" variant="outline-success" onClick={() => doRestoreRemovedFile(removed.name)}>
                      <Icon smallGapLeft smallGapRight icon="sync" />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
      </tbody>
    </Table>
  </InsetPanel>
);

UploadsTable.propTypes = {
  existingFiles: PropTypes.instanceOf(Set),
  uploadingFiles: PropTypes.array.isRequired,
  uploadedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removedFiles: PropTypes.array.isRequired,
  doRequestUploadCancel: PropTypes.func.isRequired,
  doRemoveFile: PropTypes.func.isRequired,
  doRestoreRemovedFile: PropTypes.func.isRequired,
  doRemoveFailedFile: PropTypes.func.isRequired,
  doRetryUploadFile: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(UploadsTable);
