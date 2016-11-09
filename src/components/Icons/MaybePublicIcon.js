import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import FailedIcon from './FailedIcon';
import SuccessIcon from './SuccessIcon';

const MaybePublicIcon = ({ id, isPublic, ...props }) => (
  <OverlayTrigger placement='right' overlay={(
      <Tooltip id={id}>
        {isPublic
          ? <FormattedMessage id='app.maybePublicIcon.isPublic' defaultMessage='Is public' />
          : <FormattedMessage id='app.maybePublicIcon.isNotPublic' defaultMessage='Is not public' />}
      </Tooltip>
    )}>
    {isPublic
      ? <SuccessIcon {...props} />
      : <FailedIcon {...props} />}
  </OverlayTrigger>
);

MaybePublicIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export default MaybePublicIcon;
