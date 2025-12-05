import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Modal } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { lruMemoize } from 'reselect';

import ExerciseFilesTableContainer from '../../../containers/ExerciseFilesTableContainer';
import ExerciseFileLinkForm, { initialValues } from '../../forms/ExerciseFileLinkForm';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { AddIcon, DeleteIcon, DownloadIcon, EditIcon, LoadingIcon, WarningIcon, VisibleIcon } from '../../icons';
import Callout from '../../widgets/Callout/Callout.js';
import Explanation from '../../widgets/Explanation';
import { prettyPrintBytes } from '../../helpers/stringFormatters.js';
import { UserRoleIcon } from '../../helpers/usersRoles.js';
import { getFileLinkUrl } from '../../../helpers/localizedData.js';
import { resourceStatus } from '../../../redux/helpers/resourceManager';
import { getErrorMessage } from '../../../locales/apiErrorMessages.js';

const sortLinks = lruMemoize(links => links.slice().sort((a, b) => a.key.localeCompare(b.key)));

const FilesLinksTable = ({
  exercise,
  links,
  files = null,
  operation,
  createLink,
  updateLink,
  deleteLink,
  intl: { formatMessage },
}) => {
  const [filesOpen, setFilesOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editLink, setEditLink] = useState(null);

  const operationPending = operation && operation.get('state') === resourceStatus.PENDING;
  const operationFailed = operation && operation.get('state') === resourceStatus.FAILED;
  const operationError = operationFailed ? operation.get('error')?.toJS() : null;
  const operationType = operation && operation.get('type');
  const operationLinkId = operation && operation.get('linkId');

  return (
    <div>
      {links.length > 0 && (
        <Table responsive hover>
          <thead>
            <tr>
              <th className="shrink-col text-center">
                <Explanation id="role-explanation" placement="bottom" gapLeft={false} gapRight={false}>
                  <FormattedMessage
                    id="app.filesLinksTable.header.roleExplanation"
                    defaultMessage="Minimal user role required to access the file via this link. If no role is specified, the file is accessible to all users (even without login)."
                  />
                </Explanation>
              </th>
              <th>
                <FormattedMessage id="app.filesLinksTable.header.key" defaultMessage="Key" />
                <Explanation id="key-explanation" placement="bottom">
                  <FormattedMessage
                    id="app.filesLinksTable.header.keyExplanation"
                    defaultMessage="A user-specified identifier used to reference the file link in the exercise texts (specification, description). Substring '%%key%%' is replaced by the link URL when the exercise text is rendered."
                  />
                </Explanation>
              </th>
              <th>
                <FormattedMessage id="app.filesLinksTable.header.file" defaultMessage="Target file" />
              </th>
              <th>
                <FormattedMessage id="app.filesLinksTable.header.saveAs" defaultMessage="Save as" />
                <Explanation id="saveAs-explanation" placement="bottom">
                  <FormattedMessage
                    id="app.filesLinksTable.header.saveAsExplanation"
                    defaultMessage="The name under which the file will be offered for download when accessed via this link. If empty, the original file name will be used."
                  />
                </Explanation>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sortLinks(links).map(link => (
              <tr key={link.id}>
                <td className="shrink-col text-center">
                  {link.requiredRole ? (
                    <UserRoleIcon role={link.requiredRole} showTooltip tooltipId={`visibility-${link.id}`} />
                  ) : (
                    <VisibleIcon
                      className="text-primary"
                      tooltip={
                        <FormattedMessage
                          id="app.filesLinksTable.visibleToAll"
                          defaultMessage="Visible to all users (without login)"
                        />
                      }
                      tooltipId={`visibility-${link.id}`}
                      tooltipPlacement="bottom"
                    />
                  )}
                </td>
                <td>
                  <CopyToClipboard text={`%%${link.key}%%`}>
                    <code
                      className="clickable"
                      onClick={ev => {
                        const style = 'opacity-50';
                        const elem = ev.currentTarget;
                        elem.classList.add(style);
                        window.setTimeout(() => elem.classList.remove(style), 300);
                      }}>
                      {link.key}
                    </code>
                  </CopyToClipboard>
                </td>
                <td>
                  {files === null ? (
                    <LoadingIcon />
                  ) : files === false || !files[link.exerciseFileId] ? (
                    <WarningIcon />
                  ) : (
                    <>
                      {files[link.exerciseFileId].name}{' '}
                      <small className="text-muted">({prettyPrintBytes(files[link.exerciseFileId].size)})</small>
                    </>
                  )}
                </td>
                <td>{link.saveName}</td>
                <td className="shrink-col text-nowrap">
                  <TheButtonGroup>
                    <Button variant="primary" size="xs" href={getFileLinkUrl(link.id)}>
                      <DownloadIcon
                        fixedWidth
                        tooltip={<FormattedMessage id="generic.download" defaultMessage="Download" />}
                        tooltipId={`download-${link.id}`}
                        tooltipPlacement="bottom"
                      />
                    </Button>

                    {Boolean(updateLink) && (
                      <Button
                        variant="warning"
                        size="xs"
                        disabled={!files || operationPending}
                        onClick={() => {
                          setFormOpen(true);
                          setEditLink(link);
                        }}>
                        {operationPending && operationType === 'update' && operationLinkId === link.id ? (
                          <LoadingIcon />
                        ) : (
                          <EditIcon
                            fixedWidth
                            tooltip={<FormattedMessage id="generic.edit" defaultMessage="Edit" />}
                            tooltipId={`edit-${link.id}`}
                            tooltipPlacement="bottom"
                          />
                        )}
                      </Button>
                    )}

                    {Boolean(deleteLink) && (
                      <Button
                        variant="danger"
                        size="xs"
                        disabled={operationPending}
                        confirm={
                          <FormattedMessage
                            id="app.filesLinksTable.deleteLinkConfirm"
                            defaultMessage="Are you sure you want to delete this file link? This cannot be undone."
                          />
                        }
                        confirmId={`delete-link-${link.id}`}
                        onClick={() => deleteLink(link.id)}>
                        {operationPending && operationType === 'remove' && operationLinkId === link.id ? (
                          <LoadingIcon />
                        ) : (
                          <DeleteIcon
                            fixedWidth
                            tooltip={<FormattedMessage id="generic.delete" defaultMessage="Delete" />}
                            tooltipId={`delete-${link.id}`}
                            tooltipPlacement="bottom"
                          />
                        )}
                      </Button>
                    )}
                  </TheButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {links.length === 0 && (
        <p className="text-center p-3">
          <Icon icon={['far', 'folder-open']} gapRight={2} />
          <FormattedMessage id="app.filesLinksTable.empty" defaultMessage="There are no file links yet." />
        </p>
      )}

      {operationError && <Callout variant="danger">{getErrorMessage(formatMessage)(operationError)}</Callout>}

      <div className="text-center">
        <TheButtonGroup>
          <Button variant="primary" disabled={operationPending} onClick={() => setFilesOpen(true)}>
            <Icon icon="folder-tree" gapRight={2} />
            <FormattedMessage id="app.filesLinksTable.manageExerciseFiles" defaultMessage="Manage Exercise Files" />
          </Button>

          {Boolean(createLink) && (
            <Button
              variant="success"
              disabled={!files || operationPending}
              onClick={() => {
                setFormOpen(true);
                setEditLink(null);
              }}>
              {operationPending && operationType === 'create' ? <LoadingIcon gapRight={2} /> : <AddIcon gapRight={2} />}
              <FormattedMessage id="app.filesLinksTable.addLink" defaultMessage="Add Link" />
            </Button>
          )}
        </TheButtonGroup>
      </div>

      <Modal show={filesOpen} backdrop="static" size="xl" onHide={() => setFilesOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage id="app.filesLinksTable.manageExerciseFiles" defaultMessage="Manage Exercise Files" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ExerciseFilesTableContainer exercise={exercise} noBox noRemove />
        </Modal.Body>
      </Modal>

      <Modal show={formOpen && Boolean(files)} backdrop="static" size="xl" onHide={() => setFormOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editLink ? (
              <FormattedMessage id="app.filesLinksTable.editFormTitle" defaultMessage="Edit File Link" />
            ) : (
              <FormattedMessage id="app.filesLinksTable.addFormTitle" defaultMessage="Add File Link" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Boolean(files) && (
            <ExerciseFileLinkForm
              onSubmit={editLink ? updateLink : createLink}
              initialValues={editLink || initialValues}
              links={links}
              files={files}
              createNew={!editLink}
              close={() => setFormOpen(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

FilesLinksTable.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filesIds: PropTypes.array.isRequired,
    permissionHints: PropTypes.object.isRequired,
  }).isRequired,
  links: PropTypes.array.isRequired,
  files: PropTypes.object,
  operation: ImmutablePropTypes.map,
  createLink: PropTypes.func,
  updateLink: PropTypes.func,
  deleteLink: PropTypes.func,
  intl: PropTypes.object,
};

export default injectIntl(FilesLinksTable);
