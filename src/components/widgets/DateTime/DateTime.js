import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedDate, FormattedTime, FormattedRelative } from 'react-intl';
import classnames from 'classnames';

import Icon from '../../icons';

import styles from './DateTime.less';

const isAfter = unixTime => {
  return unixTime * 1000 < Date.now();
};

const dateTime = ({
  unixts,
  isDeadline = false,
  deadlineWarningTime = 3600 * 24 * 7, // a week
  deadlineDangerTime = 3600 * 24, // a day
  deadlineAlertTime = 7200, // two hours
  showDate = true,
  showTime = true,
  showSeconds = false,
  showRelative = isDeadline,
  noWrap = true,
}) => (
  <span
    className={classnames({
      'text-nowrap': noWrap,
      'text-warning':
        isDeadline &&
        isAfter(unixts - deadlineWarningTime) &&
        !isAfter(unixts - deadlineDangerTime),
      'text-danger':
        isDeadline && isAfter(unixts - deadlineDangerTime) && !isAfter(unixts),
      'text-bold':
        isDeadline && isAfter(unixts - deadlineWarningTime) && !isAfter(unixts),
      'text-muted': isDeadline && isAfter(unixts),
    })}>
    {isDeadline && isAfter(unixts - deadlineAlertTime) && !isAfter(unixts) && (
      <Icon icon={['far', 'bell']} className="faa-shake animated" gapRight />
    )}
    {isDeadline && isAfter(unixts) && (
      <Icon icon="skull" className="half-opaque" gapRight />
    )}
    {showDate && (
      <span
        className={classnames({
          'text-nowrap': true,
          'halfem-margin-right': showTime || showRelative,
        })}>
        <FormattedDate value={unixts * 1000} />
      </span>
    )}
    &#8203;
    {showTime && (
      <span
        className={classnames({
          'text-nowrap': true,
          'halfem-margin-right': showRelative,
        })}>
        <FormattedTime
          value={unixts * 1000}
          format={showSeconds ? '24hourWithSeconds' : '24hour'}
        />
      </span>
    )}
    &#8203;
    {showRelative && (
      <span
        className={classnames({
          'text-nowrap': true,
          [styles.trailingRelative]: showDate || showTime,
          [styles.standaloneRelative]: !showDate && !showTime,
        })}>
        <FormattedRelative value={unixts * 1000} />
      </span>
    )}
  </span>
);

const DateTime = ({
  unixts = null,
  emptyPlaceholder = null,
  showDate = true,
  showTime = true,
  showRelative = false,
  showOverlay = false,
  overlayTooltipId = 'datetime',
  customTooltip = null,
  ...props
}) =>
  unixts && Number.isFinite(unixts) ? (
    showOverlay ? (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={overlayTooltipId}>
            {customTooltip ||
              dateTime({
                ...props,
                unixts,
                showDate: true,
                showTime: true,
                showRelative: true,
                showSeconds: true,
                isDeadline: false,
                noWrap: false,
              })}
          </Tooltip>
        }>
        {dateTime({ unixts, showDate, showTime, showRelative, ...props })}
      </OverlayTrigger>
    ) : (
      dateTime({ unixts, showDate, showTime, showRelative, ...props })
    )
  ) : emptyPlaceholder !== null ? (
    emptyPlaceholder
  ) : (
    <span>&mdash;</span>
  );

dateTime.propTypes = {
  unixts: PropTypes.number.isRequired,
  showDate: PropTypes.bool,
  showTime: PropTypes.bool,
  showSeconds: PropTypes.bool,
  showRelative: PropTypes.bool,
  isDeadline: PropTypes.bool,
  deadlineWarningTime: PropTypes.number,
  deadlineDangerTime: PropTypes.number,
  deadlineAlertTime: PropTypes.number,
  noWrap: PropTypes.bool,
};

DateTime.propTypes = {
  unixts: PropTypes.any,
  emptyPlaceholder: PropTypes.string,
  showDate: PropTypes.bool,
  showTime: PropTypes.bool,
  showRelative: PropTypes.bool,
  showOverlay: PropTypes.bool,
  overlayTooltipId: PropTypes.string,
  customTooltip: PropTypes.any,
};

export default DateTime;
