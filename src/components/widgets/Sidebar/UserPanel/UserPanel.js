import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router-dom';
import { Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';

import UserName from '../../../Users/UsersName';
import EffectiveRoleSwitching from '../../../Users/EffectiveRoleSwitching';
import withLinks from '../../../../helpers/withLinks';
import Icon from '../../../icons';
import AvatarContainer from '../../../../containers/AvatarContainer/AvatarContainer';
import { isSuperadminRole, UserRoleIcon, roleLabels } from '../../../helpers/usersRoles';

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
      small = false,
      links: { EDIT_USER_URI_FACTORY },
    } = this.props;

    return (
      <React.Fragment>
        <div className="user-panel mt-2 pb-2 mb-2">
          <div className="text-center">
            {small ? (
              <AvatarContainer
                avatarUrl={user.avatarUrl}
                fullName={user.fullName}
                firstName={user.name.firstName}
                size={small ? 32 : 42}
              />
            ) : (
              <UserName currentUserId={''} {...user} isVerified />
            )}
          </div>

          <div className="small text-center mt-1">
            <Link to={EDIT_USER_URI_FACTORY(user.id)}>
              <Icon icon="edit" className="text-warning" gapRight={!small} />
              {!small && <FormattedMessage id="generic.settings" defaultMessage="Settings" />}
            </Link>

            {small && <br />}

            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tokenExpiration">
                  <FormattedMessage id="app.badge.sessionExpiration" defaultMessage="Session expiration:" />{' '}
                  <FormattedRelative value={expiration} />
                </Tooltip>
              }>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  logout();
                }}>
                <Icon icon="sign-out-alt" className="text-danger" largeGapLeft={!small} gapRight={!small} />
                {!small && <FormattedMessage id="app.logout" defaultMessage="Logout" />}
              </a>
            </OverlayTrigger>

            {small && <br />}

            {isSuperadminRole(user.privateData.role) && (
              <OverlayTrigger
                placement="right"
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
                  <UserRoleIcon role={effectiveRole} className="text-primary" largeGapLeft={!small} gapRight={!small} />
                  {!small && <FormattedMessage id="generic.role" defaultMessage="Role" />}
                </a>
              </OverlayTrigger>
            )}
          </div>
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
      </React.Fragment>
    );
  }
}

UserPanel.propTypes = {
  user: PropTypes.object.isRequired,
  effectiveRole: PropTypes.string,
  setEffectiveRole: PropTypes.func.isRequired,
  logout: PropTypes.func,
  expiration: PropTypes.number.isRequired,
  small: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(UserPanel);
