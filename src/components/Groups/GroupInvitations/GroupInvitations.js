import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classnames from 'classnames';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import DateTime from '../../widgets/DateTime';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { CopyIcon, DeleteIcon, EditIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks.js';

const GroupInvitations = ({
  invitations,
  editInvitation = null,
  deleteInvitation = null,
  selected = null,
  links: { ACCEPT_GROUP_INVITATION_URI_FACTORY },
}) => {
  const [copiedInvitation, setCopiedInvitation] = useState(null);

  return (
    <>
      {invitations && invitations.length ? (
        <Table className="tbody-hover mb-0" size="sm">
          <thead>
            <tr>
              <th>
                <FormattedMessage id="app.groupInvitations.createdBy" defaultMessage="Created by" />
              </th>
              <th>
                <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />
              </th>
              <th>
                <FormattedMessage id="app.groupInvitations.expire at" defaultMessage="Expire at" />
              </th>
              <th />
              {(editInvitation || deleteInvitation) && <th />}
            </tr>
          </thead>

          {invitations.map(invitation => {
            const uri = `${window && window.location.origin}${ACCEPT_GROUP_INVITATION_URI_FACTORY(invitation.id)}`;
            const hasExpired = invitation.expireAt && invitation.expireAt <= Date.now() / 1000;
            return (
              <tbody
                key={invitation.id}
                className={classnames({
                  'text-body-secondary': hasExpired,
                  'table-warning': selected === invitation.id,
                })}>
                <tr>
                  <td colSpan={editInvitation || deleteInvitation ? 5 : 4}>
                    <code className={hasExpired ? 'text-body-secondary small' : 'small'}>{uri}</code>
                    {!hasExpired &&
                      (copiedInvitation === invitation.id ? (
                        <Icon
                          icon="clipboard-check"
                          gapLeft
                          className="text-success"
                          onClick={() => setCopiedInvitation(null)}
                        />
                      ) : (
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id={invitation.id}>
                              <FormattedMessage id="generic.copyToClipboard" defaultMessage="Copy to clipboard" />
                            </Tooltip>
                          }>
                          <CopyToClipboard text={uri} onCopy={() => setCopiedInvitation(invitation.id)}>
                            <CopyIcon timid gapLeft className="clickable" />
                          </CopyToClipboard>
                        </OverlayTrigger>
                      ))}
                  </td>
                </tr>
                <tr>
                  <td>{invitation.hostId && <UsersNameContainer userId={invitation.hostId} isSimple />}</td>
                  <td>
                    <DateTime unixts={invitation.createdAt} />
                  </td>
                  <td>
                    <DateTime unixts={invitation.expireAt} isDeadline />
                  </td>
                  <td>
                    {invitation.note && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`note-${invitation.id}`}>
                            <FormattedMessage id="app.groupInvitationForm.note" defaultMessage="Note:" />{' '}
                            <strong>{invitation.note}</strong>
                          </Tooltip>
                        }>
                        <Icon icon={['far', 'comment-dots']} gapLeft gapRight />
                      </OverlayTrigger>
                    )}
                  </td>

                  {(editInvitation || deleteInvitation) && (
                    <td className="text-nowrap text-end shrink-col">
                      <TheButtonGroup>
                        {editInvitation && (
                          <Button variant="warning" size="xs" onClick={() => editInvitation(invitation.id)}>
                            <EditIcon gapRight />
                            <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                          </Button>
                        )}

                        {deleteInvitation && (
                          <Button
                            variant="danger"
                            size="xs"
                            confirm={
                              <FormattedMessage
                                id="app.groupInvitations.confirmDelete"
                                defaultMessage="The invitation will be completely removed. This action cannot be taken back. Do you wish to proceed?"
                              />
                            }
                            confirmId={`delete-${invitation.id}`}
                            onClick={() => deleteInvitation(invitation.id)}>
                            <DeleteIcon gapRight />
                            <FormattedMessage id="generic.delete" defaultMessage="Delete" />
                          </Button>
                        )}
                      </TheButtonGroup>
                    </td>
                  )}
                </tr>
              </tbody>
            );
          })}
        </Table>
      ) : (
        <div className="text-center text-body-secondary mb-3">
          <FormattedMessage
            id="app.groupInvitations.noInvitations"
            defaultMessage="There are currently no invitations."
          />
        </div>
      )}
    </>
  );
};

GroupInvitations.propTypes = {
  invitations: PropTypes.array.isRequired,
  editInvitation: PropTypes.func,
  deleteInvitation: PropTypes.func,
  selected: PropTypes.string,
  links: PropTypes.object,
};

export default withLinks(GroupInvitations);
