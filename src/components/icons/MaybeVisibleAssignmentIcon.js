import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon, { VisibleIcon } from '.';
import moment from 'moment';
import DateTime from '../widgets/DateTime';

const MaybeVisibleAssignmentIcon = ({ id, isPublic, visibleFrom, ...props }) =>
  <span>
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
      <VisibleIcon {...props} visible={isPublic} />
    </OverlayTrigger>
    {visibleFrom &&
      visibleFrom > moment().unix() &&
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={id}>
            <FormattedMessage
              id="app.maybePublicIcon.visibleFrom"
              defaultMessage="Visible from {date}"
              values={{ date: <DateTime unixts={visibleFrom} showRelative /> }}
            />
          </Tooltip>
        }
      >
        <Icon {...props} icon="hourglass-start" />
      </OverlayTrigger>}
  </span>;

MaybeVisibleAssignmentIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired,
  visibleFrom: PropTypes.number.isRequired
};

export default MaybeVisibleAssignmentIcon;
