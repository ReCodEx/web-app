import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';

import Icon, { GroupIcon } from '../../icons';

const days = {
  cs: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

const oddEven = {
  cs: ['lichý', 'sudý'],
  en: ['odd', 'even'],
};

export const getLocalizedData = (obj, locale) => {
  if (obj && obj[locale]) {
    return obj[locale];
  } else if (obj && Object.keys(obj).length > 0) {
    return Object.keys(obj)[0];
  } else {
    return null;
  }
};

const MAIN_STYLE = { display: 'inline-block', width: '100%' };
const SCHEDULING_STYLE = { display: 'inline-block', minWidth: '10em', wordSpacing: '0.25em' };

const CourseLabel = ({
  type,
  captions,
  code,
  dayOfWeek,
  time,
  fortnightly,
  oddWeeks,
  room,
  groupsCount = 0,
  intl: { locale },
}) => (
  <span style={MAIN_STYLE}>
    <Icon
      icon={type === 'lecture' ? 'chalkboard-teacher' : 'laptop'}
      gapRight={2}
      fixedWidth
      tooltipId={`course-tooltip-${code}`}
      tooltipPlacement="bottom"
      tooltip={
        type === 'lecture' ? (
          <FormattedMessage id="app.sisSupervisor.lecture" defaultMessage="Lecture" />
        ) : (
          <FormattedMessage id="app.sisSupervisor.lab" defaultMessage="Lab (seminar)" />
        )
      }
    />
    {dayOfWeek !== null || time !== null || room !== null ? (
      <span className="text-nowrap" style={SCHEDULING_STYLE}>
        <strong>
          {getLocalizedData(days, locale)[dayOfWeek]} {time}
          {fortnightly ? <small> ({getLocalizedData(oddEven, locale)[oddWeeks ? 0 : 1]})</small> : ''} {room}
        </strong>
      </span>
    ) : (
      <span className="text-nowrap" style={SCHEDULING_STYLE}>
        <em className="small">
          <FormattedMessage id="app.sisSupervisor.notScheduled" defaultMessage="not scheduled" />
        </em>
      </span>
    )}
    {getLocalizedData(captions, locale)} (<code>{code}</code>)
    {groupsCount > 0 && (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`group-badge-tooltip-${code}`}>
            <FormattedMessage
              id="app.sisSupervisor.groupsAlreadyExist"
              defaultMessage="Group(s) have been already associated with this course."
            />
          </Tooltip>
        }>
        <Badge className="ms-2">
          {groupsCount > 1 && <small className="align-top">{groupsCount}x</small>}
          <GroupIcon gapLeft={groupsCount > 1} />
        </Badge>
      </OverlayTrigger>
    )}
  </span>
);

CourseLabel.propTypes = {
  type: PropTypes.string.isRequired,
  captions: PropTypes.object.isRequired,
  code: PropTypes.string,
  dayOfWeek: PropTypes.number,
  time: PropTypes.string,
  fortnightly: PropTypes.bool,
  oddWeeks: PropTypes.bool,
  room: PropTypes.string,
  groupsCount: PropTypes.number,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(CourseLabel);
