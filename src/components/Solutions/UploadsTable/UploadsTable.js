import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { Table, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import Icon, { CloseIcon, DeleteIcon, LoadingIcon, SuccessIcon, UploadIcon, WarningIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

const estimateCompletionTime = defaultMemoize(({ totalSize, uploadedSize, startedAt, updatedAt }) => {
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
  uploadingFiles = [],
  uploadedFiles = [],
  failedFiles = [],
  removedFiles = [],
  doRequestUploadCancel,
  doRemoveFile,
  doRestoreRemovedFile,
  doRemoveFailedFile,
  doRetryUploadFile,
  intl: { locale },
}) => (
  <Table responsive size="sm">
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
              <td className="text-center valign-middle">
                {uploading.canceling || uploading.cancelRequested ? (
                  <CloseIcon className="faa-burst animated text-danger" gapRight />
                ) : uploading.completing ? (
                  <SuccessIcon className="text-success faa-pulse animated" gapRight />
                ) : uploading.partialFile !== null ? (
                  <UploadIcon className="faa-rising animated text-primary" gapRight />
                ) : (
                  <LoadingIcon gapRight />
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
                        <FormattedMessage id="app.uploadFiles.uploadingCancelTooltip" defaultMessage="Cancel upload" />
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
              <td className="text-center valign-middle">
                <WarningIcon className="text-danger" gapRight />
              </td>
              <td className="text-monospace full-width">{failed.file.name}</td>
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
                        <FormattedMessage id="app.uploadFiles.removeTooltip" defaultMessage="Remove from list" />
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
              <td className="text-center valign-middle">
                <SuccessIcon className="text-success" gapRight />
              </td>
              <td className="text-monospace full-width">{uploaded.name}</td>
              <td className="text-nowrap valign-middle">{prettyPrintBytes(uploaded.size)}</td>
              <td className="text-center valign-middle text-nowrap">
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id={`removebtn-${uploaded.name}`}>
                      <FormattedMessage id="app.uploadFiles.removeTooltip" defaultMessage="Remove from list" />
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
              <td className="text-center valign-middle">
                <DeleteIcon className="text-muted" gapRight />
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
);

UploadsTable.propTypes = {
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
