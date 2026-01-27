import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal, Form, FormGroup, FormLabel, FormControl, FormText, Container, Row, Col } from 'react-bootstrap';

import Icon, { CloseIcon, SendIcon } from '../../icons';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import DateTime from '../../widgets/DateTime';
import {
  deadlinesAndPontsAreValid,
  sanitizePointsInput,
  parseIntervalStr,
  formatIntervalStr,
  extrapolateSecondDeadline,
} from './deadlineHelpers.js';

const InterpolationDialog = ({
  onSubmit,
  firstDeadline,
  secondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline,
  deadlines,
}) => {
  const valid =
    deadlines === 'interpolated' &&
    deadlinesAndPontsAreValid({
      firstDeadline,
      secondDeadline,
      maxPointsBeforeFirstDeadline,
      maxPointsBeforeSecondDeadline,
      deadlines,
    });

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

      <Modal show={open && valid} onHide={() => setOpen(false)} onEscapeKeyDown={() => setOpen(false)} size="xl">
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
                  <FormGroup controlId="interval" className={`mb-3 ${!interval ? 'text-danger' : ''}`}>
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
                        <strong className="me-2">Computed second deadline:</strong>
                        <DateTime
                          unixTs={extrapolateSecondDeadline(
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
                  <FormGroup controlId="points" className="mb-3">
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
              <SendIcon gapRight={2} />
              <FormattedMessage id="generic.update" defaultMessage="Update" />
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              <CloseIcon gapRight={2} />
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
  deadlines: PropTypes.string,
};

export default InterpolationDialog;
