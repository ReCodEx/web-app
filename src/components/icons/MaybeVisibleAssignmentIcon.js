import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon, { VisibleIcon } from '.';
import moment from 'moment';
import DateTime from '../widgets/DateTime';

const MaybeVisibleAssignmentIcon = ({ id, isPublic, visibleFrom = null }) => {
  const isVisible = isPublic && (!visibleFrom || visibleFrom <= moment().unix());
  return (
    <span>
      <VisibleIcon
        visible={isVisible}
        tooltipId={`visible-${id}`}
        tooltip={
          isVisible ? (
            <FormattedMessage id="app.maybeVisibleIcon.isVisible" defaultMessage="Is visible to students" />
          ) : (
            <FormattedMessage id="app.maybeVisibleIcon.isHidden" defaultMessage="Is hidden from student" />
          )
        }
      />
      {!isVisible && visibleFrom && (
        <Icon
          gapLeft={2}
          icon={['far', 'clock']}
          tooltipId={`visibleFrom-${id}`}
          tooltip={
            <FormattedMessage
              id="app.maybePublicIcon.visibleFrom"
              defaultMessage="Visible from {date}"
              values={{
                date: <DateTime unixts={visibleFrom} showRelative />,
              }}
            />
          }
        />
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
