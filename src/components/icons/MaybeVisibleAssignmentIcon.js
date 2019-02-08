import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon, { VisibleIcon } from '.';
import moment from 'moment';
import DateTime from '../widgets/DateTime';

const MaybeVisibleAssignmentIcon = ({ id, isPublic, visibleFrom = null }) => {
  const isVisible =
    isPublic && (!visibleFrom || visibleFrom <= moment().unix());
  return (
    <span>
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={id}>
            {isVisible ? (
              <FormattedMessage
                id="app.maybeVisibleIcon.isVisible"
                defaultMessage="Is visible to students"
              />
            ) : (
              <FormattedMessage
                id="app.maybeVisibleIcon.isHidden"
                defaultMessage="Is hidden from student"
              />
            )}
          </Tooltip>
        }>
        <VisibleIcon visible={isVisible} />
      </OverlayTrigger>
      {!isVisible && visibleFrom && (
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id={id}>
              <FormattedMessage
                id="app.maybePublicIcon.visibleFrom"
                defaultMessage="Visible from {date}"
                values={{
                  date: <DateTime unixts={visibleFrom} showRelative />,
                }}
              />
            </Tooltip>
          }>
          <Icon gapLeft icon={['far', 'clock']} />
        </OverlayTrigger>
      )}
    </span>
  );
};

MaybeVisibleAssignmentIcon.propTypes = {
  id: PropTypes.any.isRequired,
  isPublic: PropTypes.bool.isRequired,
  visibleFrom: PropTypes.number,
};

export default MaybeVisibleAssignmentIcon;
