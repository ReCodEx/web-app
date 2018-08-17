import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Table, Modal } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Icon, { GroupIcon, LoadingIcon } from '../../icons';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import Button from '../../widgets/FlatButton';
import GroupTree from '../../Groups/GroupTree';
import { arrayToObject, identity } from '../../../helpers/common';

class ExerciseGroups extends Component {
  state = { dialogOpen: false };

  openDialog = () => this.setState({ dialogOpen: true });
  closeDialog = () => this.setState({ dialogOpen: false });

  attachButton = groupId => {
    const { attachingGroupId, attachExerciseToGroup } = this.props;
    return (
      <Button
        bsStyle="success"
        bsSize="xs"
        disabled={Boolean(attachingGroupId)}
        onClick={ev => {
          ev.stopPropagation();
          attachExerciseToGroup(groupId);
        }}
      >
        {groupId === attachingGroupId
          ? <LoadingIcon gapRight />
          : <Icon icon="paperclip" gapRight />}
        <FormattedMessage id="app.exercise.attach" defaultMessage="Attach" />
      </Button>
    );
  };

  detachButton = groupId => {
    const { groupsIds, detachingGroupId, detachExerciseFromGroup } = this.props;
    return (
      <Button
        bsStyle="danger"
        bsSize="xs"
        disabled={
          Boolean(detachingGroupId) ||
          groupsIds.length <= 1 /* last one standing */
        }
        onClick={ev => {
          ev.stopPropagation();
          detachExerciseFromGroup(groupId);
        }}
      >
        {groupId === detachingGroupId
          ? <LoadingIcon gapRight />
          : <Icon icon="unlink" gapRight />}
        <FormattedMessage id="app.exercise.detach" defaultMessage="Detach" />
      </Button>
    );
  };

  buttonsCreator = attachedGroupsIds => groupId => {
    return (
      <span>
        {attachedGroupsIds[groupId]
          ? this.detachButton(groupId)
          : this.attachButton(groupId)}
      </span>
    );
  };

  render() {
    const {
      groupsIds = [],
      rootGroupId,
      groups,
      showButtons = false
    } = this.props;
    return (
      <Box
        title={
          <FormattedMessage
            id="app.exercise.groups"
            defaultMessage="Groups of Residence"
          />
        }
        footer={
          showButtons
            ? <div className="text-center">
                <Button bsStyle="primary" onClick={this.openDialog}>
                  <Icon icon="paperclip" gapRight />
                  <FormattedMessage
                    id="app.exercise.manageGroupAttachments"
                    defaultMessage="Manage Group Attachments"
                  />
                </Button>
              </div>
            : null
        }
        noPadding
      >
        <React.Fragment>
          <Table hover>
            <tbody>
              {groupsIds.map(groupId =>
                <tr key={groupId}>
                  <td className="shrink-col">
                    <GroupIcon className="text-muted" />
                  </td>
                  <td>
                    <GroupsNameContainer groupId={groupId} />
                  </td>
                  <td className="text-right">
                    {showButtons && this.detachButton(groupId)}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {showButtons &&
            <Modal
              show={this.state.dialogOpen}
              backdrop="static"
              onHide={this.closeDialog}
              bsSize="large"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  <FormattedMessage
                    id="app.exercise.manageGroupAttachments"
                    defaultMessage="Manage Group Attachments"
                  />
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <GroupTree
                  id={rootGroupId}
                  groups={groups}
                  onlyEditable
                  buttonsCreator={this.buttonsCreator(
                    arrayToObject(groupsIds, identity, () => true)
                  )}
                />
              </Modal.Body>
            </Modal>}
        </React.Fragment>
      </Box>
    );
  }
}

ExerciseGroups.propTypes = {
  showButtons: PropTypes.bool,
  groupsIds: PropTypes.array,
  attachingGroupId: PropTypes.string,
  detachingGroupId: PropTypes.string,
  attachExerciseToGroup: PropTypes.func.isRequired,
  detachExerciseFromGroup: PropTypes.func.isRequired,
  rootGroupId: PropTypes.string.isRequired,
  groups: ImmutablePropTypes.map
};

export default ExerciseGroups;
