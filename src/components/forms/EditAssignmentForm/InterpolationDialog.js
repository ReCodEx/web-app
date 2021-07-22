import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, Form, FormGroup, FormLabel, FormControl, FormText, Container, Row, Col } from 'react-bootstrap';
import moment from 'moment';

import Icon, { CloseIcon, SendIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import DateTime from '../../widgets/DateTime';

/**
 * Convert text input value into points (non-numeric characters are ignored).
 * @param {string} value from the text input
 * @param {number} maxPoints maximal allowed points
 * @returns {number} sanitized numeric representation of points
 */
const sanitizePointsInput = (value, maxPoints) => {
  const intValue = Number.parseInt(value.replace(/[^0-9]+/g, ''));
  return Number.isNaN(intValue) ? 0 : Math.max(0, Math.min(intValue, maxPoints));
};

/**
 * Parse interval input string and return the interval as number.
 * @param {string} value input text in format d h:mm (d is optional)
 * @returns {number} seconds
 */
const parseIntervalStr = value => {
  const matchRes = value.trim().match(/^(?<days>[0-9]+\s+)?(?<hours>[0-9]{1,2}):(?<minutes>[0-9]{2})$/);
  if (!matchRes) {
    return null;
  }

  const minutes = parseInt(matchRes.groups.minutes);
  const hours = parseInt(matchRes.groups.hours);
  const days = matchRes.groups.days ? parseInt(matchRes.groups.days) : 0;
  if (Number.isNaN(days) || Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return ((days * 24 + hours) * 60 + minutes) * 60; // in seconds
};

/**
 * Convert number of seconds into text representation of interval.
 * @param {number} seconds input value ceiled to nearest minute
 * @returns {string} with textual representation of interval
 */
const formatIntervalStr = seconds => {
  let minutes = Math.ceil(Math.abs(seconds) / 60);

  let hours = Math.floor(minutes / 60);
  minutes -= hours * 60;

  const days = Math.floor(hours / 24);
  hours -= days * 24;

  return (days > 0 ? days + ' ' : '') + hours + ':' + minutes.toString().padStart(2, '0');
};

/**
 * Compute new second deadline base on selected interval, first deadline, and points associated with both deadlines.
 * @param {Object} firstDeadline moment representation of first deadline
 * @param {number} maxPointsBeforeFirstDeadline
 * @param {number} interval in seconds
 * @param {number} maxPointsBeforeSecondDeadline
 * @returns {number} extrapolated second deadline as unix ts
 */
const extrapolateSecondDeadline = (
  firstDeadline,
  maxPointsBeforeFirstDeadline,
  interval,
  maxPointsBeforeSecondDeadline
) => {
  return firstDeadline.unix() + interval * Math.abs(maxPointsBeforeFirstDeadline - maxPointsBeforeSecondDeadline);
};

const InterpolationDialog = ({
  onSubmit,
  firstDeadline,
  secondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
}) => {
  const valid =
    moment.isMoment(firstDeadline) &&
    moment.isMoment(secondDeadline) &&
    firstDeadline.isBefore(secondDeadline, 'minute') &&
    Number.isInteger(maxPointsBeforeFirstDeadline) &&
    Number.isInteger(maxPointsBeforeSecondDeadline) &&
    maxPointsBeforeFirstDeadline !== maxPointsBeforeSecondDeadline;

  const [open, setOpen] = useState(false);

  const maxPoints = Math.max(maxPointsBeforeFirstDeadline, maxPointsBeforeSecondDeadline);
  const [points, setPoints] = useState(valid ? maxPointsBeforeSecondDeadline : 0);

  const [intervalStr, setIntervalStr] = useState(
    valid
      ? formatIntervalStr(
          (secondDeadline.unix() - firstDeadline.unix()) /
            Math.abs(maxPointsBeforeFirstDeadline - maxPointsBeforeSecondDeadline)
        )
      : ''
  );
  const interval = parseIntervalStr(intervalStr);

  return (
    <>
      <Button variant="secondary" noShadow onClick={() => setOpen(true)} disabled={!valid}>
        <Icon icon="calculator" />
      </Button>

      <Modal show={open && valid} backdrop="static" onHide={() => setOpen(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.editAssignmentForm.interpolationDialog.title"
              defaultMessage="Points Interpolation Helper"
            />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <InsetPanel>
            <FormattedMessage
              id="app.editAssignmentForm.interpolationDialog.explanationText"
              defaultMessage="This helper allows you to set the second deadline and associated second points limit using decrease interval. The interval represents relative amount of time in which the actual points limit changes by one towards the second limit. For example, if you wish to penalize late submission by removing 1 point for every hour of delay, simply set the interval to 1:00 and let this helper calculate the exact second deadline."
            />
          </InsetPanel>
          <Form>
            <Container fluid>
              <Row>
                <Col md={6}>
                  <FormGroup controlId="interval" className={!interval ? 'text-danger' : ''}>
                    <FormLabel>
                      <FormattedMessage
                        id="app.editAssignmentForm.interpolationDialog.intervalLabel"
                        defaultMessage="Update interval:"
                      />
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="d h:mm"
                      className={!interval ? 'text-danger' : ''}
                      value={intervalStr}
                      onChange={ev => setIntervalStr(ev.target.value)}
                    />

                    {!interval ? (
                      <FormText>
                        <FormattedMessage
                          id="app.editAssignmentForm.interpolationDialog.intervalInvalid"
                          defaultMessage="The interval input is not valid. The interval must be in d h:mm or h:mm format."
                        />
                      </FormText>
                    ) : (
                      <FormText className="text-primary">
                        <strong className="mr-2">Computed second deadline:</strong>
                        <DateTime
                          unixts={extrapolateSecondDeadline(
                            firstDeadline,
                            maxPointsBeforeFirstDeadline,
                            interval,
                            points
                          )}
                        />
                      </FormText>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup controlId="points">
                    <FormLabel>
                      <FormattedMessage
                        id="app.editAssignmentForm.maxPointsInterpolationLimit"
                        defaultMessage="Interpolate points to:"
                      />
                    </FormLabel>
                    <FormControl
                      type="text"
                      value={points}
                      min={0}
                      max={maxPoints}
                      onChange={ev => setPoints(sanitizePointsInput(ev.target.value, maxPoints))}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Container>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <TheButtonGroup>
            <Button
              variant="success"
              onClick={() => {
                setOpen(false);
                onSubmit({
                  secondDeadlineUnix: extrapolateSecondDeadline(
                    firstDeadline,
                    maxPointsBeforeFirstDeadline,
                    interval,
                    points
                  ),
                  maxPointsBeforeSecondDeadline: points,
                });
              }}
              disabled={!interval}>
              <SendIcon gapRight />
              <FormattedMessage id="generic.update" defaultMessage="Update" />
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </TheButtonGroup>
        </Modal.Footer>
      </Modal>
    </>
  );
};

InterpolationDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  firstDeadline: PropTypes.any,
  secondDeadline: PropTypes.any,
  maxPointsBeforeFirstDeadline: PropTypes.any,
  maxPointsBeforeSecondDeadline: PropTypes.any,
};

export default InterpolationDialog;
