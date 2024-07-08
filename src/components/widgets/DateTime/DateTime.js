import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedDate, FormattedTime, FormattedRelativeTime } from 'react-intl';
import classnames from 'classnames';
import { lruMemoize } from 'reselect';

import { BellIcon, PastDeadlineIcon } from '../../icons';
import { EMPTY_OBJ } from '../../../helpers/common.js';
import { UserUIDataContext } from '../../../helpers/contexts.js';
import { knownLocales } from '../../../helpers/localizedData.js';

import * as styles from './DateTime.less';

const isAfter = unixTime => {
  return unixTime * 1000 < Date.now();
};

const getLocalizedIntlDateFormatter = lruMemoize(locale =>
  locale && knownLocales.includes(locale) ? new Intl.DateTimeFormat(locale) : null
);

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
}) => {
  const { dateFormatOverride = null } = useContext(UserUIDataContext);

  return (
    <span
      className={classnames({
        'text-nowrap': noWrap,
        'text-warning': isDeadline && isAfter(unixts - deadlineWarningTime) && !isAfter(unixts - deadlineDangerTime),
        'text-danger': isDeadline && isAfter(unixts - deadlineDangerTime) && !isAfter(unixts),
        'text-bold': isDeadline && isAfter(unixts - deadlineWarningTime) && !isAfter(unixts),
        'text-muted': isDeadline && isAfter(unixts),
      })}>
      {isDeadline && isAfter(unixts - deadlineAlertTime) && !isAfter(unixts) && (
        <BellIcon className="faa-shake animated" gapRight />
      )}
      {isDeadline && isAfter(unixts) && <PastDeadlineIcon className="half-opaque" gapRight />}
      {showDate && (
        <span
          className={classnames({
            'text-nowrap': true,
          })}>
          {getLocalizedIntlDateFormatter(dateFormatOverride) ? (
            getLocalizedIntlDateFormatter(dateFormatOverride).format(unixts * 1000)
          ) : (
            <FormattedDate value={unixts * 1000} />
          )}

          {(showTime || showRelative) && <span className="px-1"> </span>}
        </span>
      )}

      {showTime && (
        <span
          className={classnames({
            'text-nowrap': true,
          })}>
          <FormattedTime value={unixts * 1000} format={showSeconds ? '24hourWithSeconds' : '24hour'} />
          {showRelative && <span className="px-1"> </span>}
        </span>
      )}

      {showRelative && (
        <span
          className={classnames({
            'text-nowrap': true,
            [styles.trailingRelative]: showDate || showTime,
          })}>
          <FormattedRelativeTime
            value={unixts - Date.now() / 1000}
            numeric="always"
            updateIntervalInSeconds={1000000}
          />
        </span>
      )}
    </span>
  );
};

const DateTime = ({
  unixts = null,
  emptyPlaceholder = null,
  showDate = true,
  showTime = true,
  showRelative = false,
  showOverlay = false,
  overlayProps = EMPTY_OBJ,
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
                ...overlayProps,
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
  showSeconds: PropTypes.bool,
  showRelative: PropTypes.bool,
  showOverlay: PropTypes.bool,
  overlayTooltipId: PropTypes.string,
  customTooltip: PropTypes.any,
  overlayProps: PropTypes.object,
};

export default DateTime;
