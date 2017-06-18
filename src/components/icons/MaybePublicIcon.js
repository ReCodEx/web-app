import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const MaybePublicIcon = ({ id, isPublic, ...props }) => (
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
      ? <Icon {...props} name="circle" className="text-success" />
      : <Icon {...props} name="ban" />}
  </OverlayTrigger>
);

MaybePublicIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export default MaybePublicIcon;
