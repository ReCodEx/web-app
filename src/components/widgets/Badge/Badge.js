import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import FailedAvatar from '../Avatar/FailedAvatar';
import withLinks from '../../../helpers/withLinks';
import Icon from '../../icons';
import AvatarContainer from '../../../containers/AvatarContainer/AvatarContainer';

class Badge extends Component {
  state = { failedLoadingImage: false };

  onFailure = () => {
    this.setState({ failedLoadingImage: true });
  };

  render() {
    const {
      id,
      fullName,
      name: { firstName },
      avatarUrl,
      expiration,
      logout,
      size = 45,
      links: { USER_URI_FACTORY, EDIT_USER_URI_FACTORY }
    } = this.props;

    const { failedLoadingImage } = this.state;

    return (
      <div className="user-panel">
        <div className="pull-left image">
          {!failedLoadingImage &&
            <AvatarContainer
              avatarUrl={avatarUrl}
              fullName={fullName}
              firstName={firstName}
              size={size}
              onError={this.onFailure}
            />}

          {failedLoadingImage && <FailedAvatar />}
        </div>
        <div className="info">
          <p>
            <Link to={USER_URI_FACTORY(id)}>
              {fullName}
            </Link>
          </p>
          <Link to={EDIT_USER_URI_FACTORY(id)}>
            <Icon icon="edit" gapRight />
            <FormattedMessage id="generic.settings" defaultMessage="Settings" />
          </Link>
          &nbsp;
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="tokenExpiration">
                <FormattedMessage
                  id="app.badge.sessionExpiration"
                  defaultMessage="Session expiration:"
                />{' '}
                <FormattedRelative value={expiration} />
              </Tooltip>
            }
          >
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                logout();
              }}
            >
              <Icon icon="sign-out-alt" className="text-danger" />&nbsp;
              <FormattedMessage id="app.logout" defaultMessage="Logout" />
            </a>
          </OverlayTrigger>
        </div>
      </div>
    );
  }
}

Badge.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.shape({ firstName: PropTypes.string.isRequired }).isRequired,
  avatarUrl: PropTypes.string,
  expiration: PropTypes.number.isRequired,
  privateData: PropTypes.shape({ settings: PropTypes.object.isRequired })
    .isRequired,
  logout: PropTypes.func,
  size: PropTypes.number,
  links: PropTypes.object
};

export default withLinks(Badge);
