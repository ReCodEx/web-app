import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Button from '../../widgets/TheButton';
import DateTime from '../../widgets/DateTime';
import InsetPanel from '../../widgets/InsetPanel';
import Icon, { CopyIcon, InfoIcon, LoadingIcon, WarningIcon, RefreshIcon } from '../../icons';

import { API_BASE } from '../../../helpers/config';

class CalendarTokens extends Component {
  state = { createPending: false, copiedCalendar: null };

  createButtonHandler = () => {
    const { create, calendars, setExpired } = this.props;
    const activeCalendars = calendars.some(calendar => calendar && !calendar.expiredAt);
    this.setState({ createPending: true });

    if (activeCalendars && setExpired) {
      return Promise.all(calendars.filter(c => c && !c.expiredAt).map(c => setExpired(c.id)))
        .then(create)
        .then(() => this.setState({ createPending: false }));
    } else {
      return create().then(() => this.setState({ createPending: false }));
    }
  };

  calendarCopied = copiedCalendar => {
    this.setState({ copiedCalendar });
    if (this.resetCalendarTimer) {
      clearTimeout(this.resetCalendarTimer);
    }
    this.resetCalendarTimer = setTimeout(() => {
      this.setState({ copiedCalendar: null });
      this.resetCalendarTimer = undefined;
    }, 2000);
  };

  componentWillUnmount() {
    if (this.resetCalendarTimer) {
      clearTimeout(this.resetCalendarTimer);
      this.resetCalendarTimer = undefined;
    }
  }

  render() {
    const { calendars = null, create = null, setExpired = null, reload = null } = this.props;
    const baseUrl = `${API_BASE}/users/ical/`;
    const activeCalendars = calendars.some(calendar => calendar && !calendar.expiredAt);

    return (
      <>
        <p className="mt-4 mx-4 mb-2">
          <InfoIcon gapRight className="text-muted" />
          <FormattedMessage
            id="app.calendarTokens.explain"
            defaultMessage="ReCodEx API can feed iCal data to your calendar. It will export deadline events for all assignments in all groups related to you. Anyone with the iCal identifier will be able to read the calendar and the calendar is read-only. When activated, you will get a calendar URL in the following format."
          />
        </p>

        <InsetPanel className="mt-2 mx-3 mb-3" size="small">
          <code>
            {baseUrl}
            <em>&lt;identifier&gt;</em>
          </code>
        </InsetPanel>

        {calendars && calendars.length > 0 && (
          <Table hover size="sm" className="mb-0">
            <thead>
              <tr>
                <th className="px-3">
                  <FormattedMessage id="app.calendarTokens.id" defaultMessage="Existing iCal identifiers" />
                </th>
                <th className="text-nowrap px-3">
                  <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />
                </th>
                <th className="text-nowrap px-3">
                  <FormattedMessage id="app.calendarTokens.expiredAt" defaultMessage="Expired at" />
                </th>
                <th />
              </tr>
            </thead>

            <tbody>
              {calendars.map((calendar, idx) =>
                calendar ? (
                  <tr key={calendar.id} className={calendar.expiredAt ? 'text-muted' : ''}>
                    <td className="full-width px-3">
                      <code className={calendar.expiredAt ? 'text-muted' : ''}>{calendar.id}</code>
                      {!calendar.expiredAt &&
                        (this.state.copiedCalendar === calendar.id ? (
                          <Icon icon="clipboard-check" gapLeft className="text-success" />
                        ) : (
                          <OverlayTrigger
                            placement="right"
                            overlay={
                              <Tooltip id={calendar.id}>
                                <FormattedMessage
                                  id="app.calendarTokens.copyToClipboard"
                                  defaultMessage="Copy the URL into clipboard"
                                />
                              </Tooltip>
                            }>
                            <CopyToClipboard
                              text={`${baseUrl}${calendar.id}`}
                              onCopy={() => this.calendarCopied(calendar.id)}>
                              <CopyIcon timid gapLeft className="clickable" />
                            </CopyToClipboard>
                          </OverlayTrigger>
                        ))}
                    </td>

                    <td className="text-nowrap px-3">
                      <DateTime unixts={calendar.createdAt} />
                    </td>

                    <td className="text-nowrap px-3">
                      <DateTime unixts={calendar.expiredAt} />
                    </td>

                    <td className="text-nowrap px-3">
                      {!calendar.expiredAt && setExpired && calendar.expiring !== false && (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => setExpired(calendar.id)}
                          disabled={calendar.expiring || this.state.createPending}>
                          <Icon icon={['far', 'calendar-xmark']} gapRight />
                          <FormattedMessage id="app.calendarTokens.setExpired" defaultMessage="Set expired" />
                          {calendar.expiring && <LoadingIcon gapLeft />}
                        </Button>
                      )}
                      {calendar.expiring === false && (
                        <span>
                          <WarningIcon className="text-danger" gapRight />
                          <FormattedMessage
                            id="app.calendarTokens.setExpiredFailed"
                            defaultMessage="operation failed"
                          />
                          {reload && !this.state.createPending && (
                            <RefreshIcon gapLeft className="text-primary" onClick={reload} />
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ) : (
                  <tr key={`loading-${idx}`}>
                    <td colSpan={4} className="text-center">
                      <LoadingIcon />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        )}

        <hr className="m-0" />

        {create && (
          <div className="text-center my-3">
            <Button
              variant={activeCalendars ? 'warning' : 'success'}
              onClick={this.createButtonHandler}
              disabled={this.state.createPending}>
              <Icon icon={['far', 'calendar-plus']} gapRight />
              {activeCalendars ? (
                <FormattedMessage id="app.calendarTokens.refresh" defaultMessage="Expire old and create a new one" />
              ) : (
                <FormattedMessage id="app.calendarTokens.activate" defaultMessage="Activate calendar" />
              )}
              {this.state.createPending && <LoadingIcon gapLeft />}
            </Button>
          </div>
        )}
      </>
    );
  }
}

CalendarTokens.propTypes = {
  calendars: PropTypes.array,
  create: PropTypes.func,
  setExpired: PropTypes.func,
  reload: PropTypes.func,
};

export default CalendarTokens;
