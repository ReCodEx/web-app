import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import withLinks from '../../../hoc/withLinks';

const Badge = ({
  id,
  fullName,
  avatarUrl,
  expiration,
  logout,
  links: { USER_URI_FACTORY, EDIT_USER_URI_FACTORY }
}) => (
  <div className="user-panel">
    <div className="pull-left image">
      <img src={avatarUrl} alt={fullName} className="img-circle" />
    </div>
    <div className="info">
      <p>
        <Link to={USER_URI_FACTORY(id)}>
          {fullName}
        </Link>
      </p>
      <Link to={EDIT_USER_URI_FACTORY(id)}>
        <Icon name="edit" />
        <FormattedMessage id="app.badge.settings" defaultMessage="Settings" />
      </Link>
      &nbsp;
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id="tokenExpiration">
            <FormattedMessage
              id="app.badge.sessionExpiration"
              defaultMessage="Session expiration:"
            />
            {' '}
            <FormattedRelative value={expiration} />
          </Tooltip>
        }
      >
        <a href="#" onClick={logout}>
          <Icon name="sign-out" className="text-danger" />
          {' '}
          <FormattedMessage id="app.logout" defaultMessage="Logout" />
        </a>
      </OverlayTrigger>
    </div>
  </div>
);

Badge.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  expiration: PropTypes.number.isRequired,
  logout: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(Badge);
