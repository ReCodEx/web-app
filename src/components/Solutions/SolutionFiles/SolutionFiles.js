import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import DownloadSolutionArchiveContainer from '../../../containers/DownloadSolutionArchiveContainer';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import Callout from '../../widgets/Callout';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Box from '../../widgets/Box';
import Icon, { CodeFileIcon, DownloadIcon, WarningIcon, ZipIcon } from '../../icons';
import { prettyPrintBytes } from '../../helpers/stringFormatters.js';

const nameComparator = (a, b) => a.name.localeCompare(b.name, 'en');

const preprocessZipEntries = ({ zipEntries, ...file }) => {
  if (zipEntries) {
    file.zipEntriesBadNames = zipEntries.reduce((bad, { name }) => bad || name.includes('\\'), false);
    file.zipEntries = zipEntries
      .filter(({ name, size }) => !(name.endsWith('/') || name.endsWith('\\')) || size !== 0)
      .map(({ name, size }) => ({ name, size, id: `${file.id}/${name}`, parentId: file.id }))
      .sort(nameComparator);
  }
  return file;
};

const preprocessFiles = lruMemoize(files =>
  files
    .sort(nameComparator)
    .map(preprocessZipEntries)
    .reduce((acc, file) => [...acc, file, ...(file.zipEntries || [])], [])
);

const SolutionFiles = ({
  solutionId,
  attemptIndex,
  files,
  authorId,
  isReference = false,
  solutionFilesLimit = null,
  solutionSizeLimit = null,
  openFile = null,
  download = null,
}) =>
  files && (
    <ResourceRenderer resource={files}>
      {files => {
        const filesSize = files.reduce((acc, { size }) => acc + size, 0);

        return (
          <>
            {isReference && solutionFilesLimit !== null && files.length > solutionFilesLimit && (
              <Callout variant="warning">
                <FormattedMessage
                  id="app.solutionFiles.countLimitExceeded"
                  defaultMessage="The total number of submitted files exceeds the default solution files limit ({limit})."
                  values={{ limit: solutionFilesLimit }}
                />
              </Callout>
            )}

            {isReference && solutionSizeLimit !== null && filesSize > solutionSizeLimit && (
              <Callout variant="warning">
                <FormattedMessage
                  id="app.solutionFiles.sizeLimitExceeded"
                  defaultMessage="The total size of all submitted files exceeds the default solution size limit ({limit} KiB)."
                  values={{ limit: Math.ceil(solutionSizeLimit / 1024) }}
                />
              </Callout>
            )}

            <Box
              collapsable
              noPadding
              unlimitedHeight
              title={<FormattedMessage id="app.solutionFiles.title" defaultMessage="Submitted Files" />}>
              {files.length === 0 ? (
                <div className="text-center text-body-secondary small">
                  <FormattedMessage id="app.solutionFiles.noFiles" defaultMessage="No files were submitted." />
                </div>
              ) : (
                <Table hover className="card-table">
                  <tbody>
                    {preprocessFiles(files).map(file => (
                      <tr key={file.id}>
                        {file.parentId && (
                          <td className="text-nowrap shrink-col text-body-secondary pe-0">
                            <Icon icon="level-up-alt" className="fa-rotate-90" gapLeft={2} />
                          </td>
                        )}
                        <td className="text-nowrap shrink-col text-body-secondary">
                          {file.isEntryPoint ? (
                            <Icon
                              icon="sign-in-alt"
                              className="text-success"
                              tooltipId={`entrypoint-${file.id}`}
                              tooltipPlacement="bottom"
                              tooltip={
                                <FormattedMessage
                                  id="app.solutionFiles.entryPoint"
                                  defaultMessage="Execution entry point (bootstrap)"
                                />
                              }
                            />
                          ) : file.name.toLowerCase().endsWith('.zip') ? (
                            <ZipIcon />
                          ) : (
                            <CodeFileIcon />
                          )}
                        </td>

                        <td className="w-100" colSpan={file.parentId ? 1 : 2}>
                          <code
                            className={
                              file.parentId
                                ? 'text-body-secondary small'
                                : file.isEntryPoint
                                  ? 'text-success fw-bold'
                                  : ''
                            }>
                            {file.name}
                          </code>

                          {file.zipEntriesBadNames && (
                            <WarningIcon
                              gapLeft
                              className="text-danger"
                              tooltipId={`${file.id}-badEntries`}
                              tooltip={
                                <FormattedMessage
                                  id="app.solutionFiles.badZipEntryNames"
                                  defaultMessage="Some of the ZIP entry names are invalid."
                                />
                              }
                            />
                          )}
                        </td>
                        <td className="small text-nowrap">{prettyPrintBytes(file.size)}</td>

                        <td className="text-nowrap shrink-col text-end">
                          <TheButtonGroup>
                            {Boolean(openFile) && !file.name.toLowerCase().endsWith('.zip') && (
                              <OverlayTrigger
                                placement="bottom"
                                overlay={
                                  <Tooltip id={`open-file-${file.id}`}>
                                    <FormattedMessage
                                      id="app.solutionFiles.openButton"
                                      defaultMessage="Open preview in dialog"
                                    />
                                  </Tooltip>
                                }>
                                <Button
                                  onClick={() =>
                                    openFile(file.parentId || file.id, file.name, file.parentId ? file.name : null)
                                  }
                                  size="xs"
                                  variant="secondary">
                                  <Icon icon="book-open" fixedWidth />
                                </Button>
                              </OverlayTrigger>
                            )}

                            {Boolean(download) && (
                              <OverlayTrigger
                                placement="bottom"
                                overlay={
                                  <Tooltip id={`download-${file.id}`}>
                                    <FormattedMessage
                                      id="app.solutionFiles.downloadButton"
                                      defaultMessage="Download file"
                                    />
                                  </Tooltip>
                                }>
                                <Button
                                  onClick={() => download(file.parentId || file.id, file.parentId ? file.name : null)}
                                  size="xs"
                                  variant="primary">
                                  <DownloadIcon fixedWidth />
                                </Button>
                              </OverlayTrigger>
                            )}
                          </TheButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} />
                      <td className="small text-body-secondary">
                        <em>
                          <FormattedMessage id="app.solutionFiles.total" defaultMessage="Total:" />
                        </em>
                      </td>
                      <td className="small text-body-secondary text-nowrap">
                        <em>{prettyPrintBytes(filesSize)}</em>
                      </td>
                      <td className="text-nowrap shrink-col text-end">
                        <DownloadSolutionArchiveContainer
                          solutionId={solutionId}
                          attemptIndex={attemptIndex}
                          authorId={authorId}
                          isReference={isReference}
                          size="xs"
                          iconOnly
                        />
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              )}
            </Box>
          </>
        );
      }}
    </ResourceRenderer>
  );
SolutionFiles.propTypes = {
  solutionId: PropTypes.string.isRequired,
  attemptIndex: PropTypes.number,
  files: ImmutablePropTypes.map,
  authorId: PropTypes.string.isRequired,
  isReference: PropTypes.bool,
  solutionFilesLimit: PropTypes.number,
  solutionSizeLimit: PropTypes.number,
  openFile: PropTypes.func,
  download: PropTypes.func,
};

export default SolutionFiles;
