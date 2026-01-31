import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { Link } from 'react-router-dom';
import { Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';

import UserName from '../../../Users/UsersName';
import EffectiveRoleSwitching from '../../../Users/EffectiveRoleSwitching';
import withLinks from '../../../../helpers/withLinks.js';
import { EditIcon, LogoutIcon } from '../../../icons';
import { isSuperadminRole, UserRoleIcon, roleLabels } from '../../../helpers/usersRoles.js';

import './userPanel.css';

class UserPanel extends Component {
  state = { effectiveRoleDialogOpened: false, effectiveRoleUpdating: null };

  openEffectiveRoleDialog = () => {
    this.setState({ effectiveRoleDialogOpened: true, effectiveRoleUpdating: null });
  };

  closeEffectiveRoleDialog = () => {
    this.setState({ effectiveRoleDialogOpened: false, effectiveRoleUpdating: null });
  };

  setEffectiveRole = role => {
    const { setEffectiveRole } = this.props;
    this.setState({ effectiveRoleUpdating: role });
    setEffectiveRole(role).then(() => {
      this.closeEffectiveRoleDialog();
      window.location.reload();
    });
  };

  render() {
    const {
      user,
      effectiveRole,
      expiration,
      logout,
      links: { EDIT_USER_URI_FACTORY },
    } = this.props;

    return (
      <>
        <div className="text-center text-light sidebar-up-hide-collapsed">
          <UserName currentUserId={user.id} {...user} />
        </div>

        <div className="small text-center mt-1">
          <span className="sidebar-up-collapsed-block">
            <Link to={EDIT_USER_URI_FACTORY(user.id)}>
              <EditIcon className="text-warning sidebar-up-collapse-gaps" gapRight={1} />
              <span className="sidebar-up-hide-collapsed">
                <FormattedMessage id="generic.settings" defaultMessage="Settings" />
              </span>
            </Link>
          </span>

          <span className="sidebar-up-collapsed-block">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="tokenExpiration">
                  <FormattedMessage id="app.badge.sessionExpiration" defaultMessage="Session expiration:" />{' '}
                  <FormattedRelativeTime
                    value={(expiration - Date.now()) / 1000}
                    numeric="auto"
                    updateIntervalInSeconds={1000000}
                  />
                </Tooltip>
              }>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  logout();
                }}>
                <LogoutIcon className="text-danger sidebar-up-collapse-gaps" gapLeft={2} gapRight={1} />
                <span className="sidebar-up-hide-collapsed">
                  <FormattedMessage id="app.logout" defaultMessage="Logout" />
                </span>
              </a>
            </OverlayTrigger>
          </span>

          {isSuperadminRole(user.privateData.role) && (
            <span className="sidebar-up-collapsed-block">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="effectiveRole">
                    <FormattedMessage id="generic.effectiveRole" defaultMessage="Effective Role" />:{' '}
                    {roleLabels[effectiveRole]}
                  </Tooltip>
                }>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.openEffectiveRoleDialog();
                  }}>
                  <UserRoleIcon
                    role={effectiveRole}
                    className="text-primary sidebar-up-collapse-gaps"
                    gapLeft={2}
                    gapRight={1}
                  />
                  <span className="sidebar-up-hide-collapsed">
                    <FormattedMessage id="generic.role" defaultMessage="Role" />
                  </span>
                </a>
              </OverlayTrigger>
            </span>
          )}
        </div>

        {isSuperadminRole(user.privateData.role) && (
          <Modal
            show={this.state.effectiveRoleDialogOpened}
            backdrop="static"
            onHide={this.closeEffectiveRoleDialog}
            size="large">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage id="app.badge.effectiveRoleDialog.title" defaultMessage="Change Effective Role" />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <UserName currentUserId={user.id} {...user} large size={45} />
              <EffectiveRoleSwitching
                effectiveRole={effectiveRole}
                updating={this.state.effectiveRoleUpdating}
                setEffectiveRole={this.setEffectiveRole}
              />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }
}

UserPanel.propTypes = {
  user: PropTypes.object.isRequired,
  effectiveRole: PropTypes.string,
  setEffectiveRole: PropTypes.func.isRequired,
  logout: PropTypes.func,
  expiration: PropTypes.number.isRequired,
  links: PropTypes.object,
};

export default withLinks(UserPanel);
