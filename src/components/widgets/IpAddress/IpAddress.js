import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from '../../icons/Icon.js';
import { getConfigVar } from '../../../helpers/config.js';

const KNOWN_IPS = getConfigVar('KNOWN_IPS', {});

const getIpLabel = (ip, locale) => {
  if (typeof KNOWN_IPS[ip] === 'object') {
    if (locale in KNOWN_IPS[ip]) {
      return KNOWN_IPS[ip][locale];
    }
    if ('en' in KNOWN_IPS[ip]) {
      return KNOWN_IPS[ip].en;
    }
    const keys = Object.keys(KNOWN_IPS[ip]);
    if (keys.length > 0) {
      return KNOWN_IPS[ip][keys[0]];
    }
  }
  return KNOWN_IPS[ip];
};

// Inset panel replaces old <Well> component from bootstrap 3
const IpAddress = ({ ip, intl: { locale }, ...props }) =>
  KNOWN_IPS[ip] ? (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={ip}>
          <code>{ip}</code>
        </Tooltip>
      }>
      <span>
        <Icon icon="location-crosshairs" gapRight={1} className="opacity-50" /> {getIpLabel(ip, locale)}
      </span>
    </OverlayTrigger>
  ) : (
    <code {...props}>{ip}</code>
  );

IpAddress.propTypes = {
  ip: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(IpAddress);
