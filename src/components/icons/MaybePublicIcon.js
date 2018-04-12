import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const MaybePublicIcon = ({ id, isPublic, ...props }) =>
  <OverlayTrigger
    placement="right"
    overlay={
      <Tooltip id={id}>
        {isPublic
          ? <FormattedMessage
              id="app.maybePublicIcon.isPublic"
              defaultMessage="Is public"
            />
          : <FormattedMessage
              id="app.maybePublicIcon.isNotPublic"
              defaultMessage="Is not public"
            />}
      </Tooltip>
    }
  >
    {isPublic
      ? <FontAwesomeIcon {...props} icon="circle" className="text-success" />
      : <FontAwesomeIcon {...props} icon="ban" />}
  </OverlayTrigger>;

MaybePublicIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export default MaybePublicIcon;
