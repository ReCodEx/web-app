import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from './Icon';

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
      ? <Icon {...props} icon="circle" className="text-success" />
      : <Icon {...props} icon="ban" />}
  </OverlayTrigger>;

MaybePublicIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export default MaybePublicIcon;
