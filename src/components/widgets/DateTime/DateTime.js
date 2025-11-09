import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedDate, FormattedTime, FormattedRelativeTime, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { lruMemoize } from 'reselect';

import { BellIcon, PastDeadlineIcon } from '../../icons';
import { EMPTY_OBJ } from '../../../helpers/common.js';
import { UserUIDataContext } from '../../../helpers/contexts.js';
import { knownLocales } from '../../../helpers/localizedData.js';

import * as styles from './DateTime.less';

const isAfter = (unixTime, now = Date.now() / 1000) => {
  return unixTime < Date.now();
};

const getLocalizedIntlDateFormatter = lruMemoize(locale =>
  locale && knownLocales.includes(locale) ? new Intl.DateTimeFormat(locale) : null
);

const dateTime = ({
  unixTs,
  isDeadline = false,
  deadlineWarningTime = 3600 * 24 * 7, // a week
  deadlineDangerTime = 3600 * 24, // a day
  deadlineAlertTime = 7200, // two hours
  showDate = true,
  showTime = true,
  showSeconds = false,
  showRelative = isDeadline,
  noWrap = true,
  compact = false,
}) => {
  const { dateFormatOverride = null } = useContext(UserUIDataContext);
  const now = Date.now() / 1000;

  return (
    <span
      className={classnames({
        'text-nowrap': noWrap,
        'text-warning':
          isDeadline && isAfter(unixTs - deadlineWarningTime, now) && !isAfter(unixTs - deadlineDangerTime, now),
        'text-danger': isDeadline && isAfter(unixTs - deadlineDangerTime, now) && !isAfter(unixTs, now),
        'fw-bold': isDeadline && isAfter(unixTs - deadlineWarningTime, now) && !isAfter(unixTs, now),
        'text-body-secondary': isDeadline && isAfter(unixTs, now),
      })}>
      {isDeadline && isAfter(unixTs - deadlineAlertTime, now) && !isAfter(unixTs, now) && (
        <BellIcon className="faa-shake animated" gapRight={2} />
      )}
      {isDeadline && isAfter(unixTs, now) && <PastDeadlineIcon className="opacity-50" gapRight={2} />}
      {showDate && (
        <span
          className={classnames({
            'text-nowrap': true,
          })}>
          {getLocalizedIntlDateFormatter(dateFormatOverride) ? (
            getLocalizedIntlDateFormatter(dateFormatOverride).format(unixTs * 1000)
          ) : (
            <FormattedDate value={unixTs * 1000} />
          )}

          {(showTime || showRelative) && <span className={compact ? '' : 'px-1'}> </span>}
        </span>
      )}

      {showTime && (
        <span className="text-nowrap">
          <FormattedTime value={unixTs * 1000} format={showSeconds ? '24hourWithSeconds' : '24hour'} />
          {showRelative && <span className={compact ? '' : 'px-1'}> </span>}
        </span>
      )}

      {showRelative && (
        <span
          className={classnames({
            'text-nowrap': true,
            [styles.trailingRelative]: showDate || showTime,
          })}>
          {Math.abs(unixTs - now) < 3 ? (
            <FormattedMessage id="generic.justNow" defaultMessage="just now" />
          ) : (
            <FormattedRelativeTime value={unixTs - now} numeric="always" updateIntervalInSeconds={1000000} />
          )}
        </span>
      )}
    </span>
  );
};

const DateTime = ({
  unixTs = null,
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
  unixTs && Number.isFinite(unixTs) ? (
    showOverlay ? (
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={overlayTooltipId}>
            {customTooltip ||
              dateTime({
                ...props,
                unixTs,
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
        <span>{dateTime({ unixTs, showDate, showTime, showRelative, ...props })}</span>
      </OverlayTrigger>
    ) : (
      dateTime({ unixTs, showDate, showTime, showRelative, ...props })
    )
  ) : emptyPlaceholder !== null ? (
    emptyPlaceholder
  ) : (
    <span>&mdash;</span>
  );

dateTime.propTypes = {
  unixTs: PropTypes.number.isRequired,
  showDate: PropTypes.bool,
  showTime: PropTypes.bool,
  showSeconds: PropTypes.bool,
  showRelative: PropTypes.bool,
  isDeadline: PropTypes.bool,
  deadlineWarningTime: PropTypes.number,
  deadlineDangerTime: PropTypes.number,
  deadlineAlertTime: PropTypes.number,
  noWrap: PropTypes.bool,
  compact: PropTypes.bool,
};

DateTime.propTypes = {
  unixTs: PropTypes.any,
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
