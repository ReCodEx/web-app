import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Modal, FormGroup, FormControl, FormLabel, Overlay, Popover } from 'react-bootstrap';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import { BellIcon, CloseIcon, LoadingIcon, SendIcon, WarningIcon } from '../../icons';

const ExerciseButtons = ({ id, archivedAt = null, permissionHints = null, sendNotification }) => {
  const [message, setMessage] = useState(null); // null = dialog is hidden, string = message (and dialog is open)
  const [sendResult, setSendResult] = useState(null); // null = initial, true = pending, false = error, int = result
  // the sendResult holds, how many users were notified (-1 is server error)
  const buttonTarget = useRef(null);

  return !archivedAt && permissionHints && permissionHints.update ? (
    <>
      <Row>
        <Col className="mb-3" xs={12} lg={true}>
          <TheButtonGroup></TheButtonGroup>
        </Col>

        <Col xs={12} lg="auto" className="mb-3">
          <TheButtonGroup className="text-nowrap">
            <Button
              variant={
                sendResult === false || sendResult < 0
                  ? 'danger'
                  : sendResult === null || sendResult === true
                    ? 'warning'
                    : 'success'
              }
              onClick={() => (sendResult !== null && sendResult !== true ? setSendResult(null) : setMessage(''))}
              disabled={sendResult !== null}
              ref={buttonTarget}>
              {sendResult === true ? <LoadingIcon gapRight={2} /> : <BellIcon gapRight={2} />}
              <FormattedMessage id="app.exercise.notificationButton" defaultMessage="Send Notification" />
            </Button>
          </TheButtonGroup>

          <Overlay target={buttonTarget.current} show={sendResult !== null && sendResult !== true} placement="bottom">
            {props => (
              <Popover id={id} {...props}>
                <Popover.Header>
                  {sendResult === false || sendResult < 0 ? (
                    <>
                      <WarningIcon className="text-danger" gapRight={2} />
                      <FormattedMessage
                        id="app.exercise.notificationButton.failedMessage"
                        defaultMessage="The operation has failed!"
                      />
                    </>
                  ) : sendResult === 0 ? (
                    <FormattedMessage
                      id="app.exercise.notificationButton.noRecipients"
                      defaultMessage="No recipients of the notification were found. Please note that the users may choose to ignore these notifications in their personal settings."
                    />
                  ) : (
                    <FormattedMessage
                      id="app.exercise.notificationButton.successMessage"
                      defaultMessage="The notification was successfully sent to {sendResult} {sendResult, plural, one {user} other {users}}."
                      values={{ sendResult }}
                    />
                  )}
                </Popover.Header>
                <Popover.Body className="text-center">
                  <Button onClick={() => setSendResult(null)} size="xs" variant="success">
                    <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
                  </Button>
                </Popover.Body>
              </Popover>
            )}
          </Overlay>
        </Col>
      </Row>

      <Modal show={message !== null} onHide={() => setMessage(null)} onEscapeKeyDown={() => setMessage(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.exercise.notificationModal.title"
              defaultMessage="Send a notification to teachers"
            />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <InsetPanel>
            <FormattedMessage
              id="app.exercise.notificationModal.explain"
              defaultMessage="A notification is sent by email to all group admins and supervisors who have assigned this exercise in their groups. Optionally, you may attach a custom message to the notification. If you leave the message empty, a generic notification informing that the exercise was changed will be sent."
            />
          </InsetPanel>

          <FormGroup controlId="message" className="mb-3">
            <FormLabel>
              <FormattedMessage id="generic.message" defaultMessage="Message" />:
            </FormLabel>
            <FormControl type="text" value={message || ''} onChange={ev => setMessage(ev.target.value)} />
          </FormGroup>
        </Modal.Body>

        <Modal.Footer className="d-block text-center">
          <TheButtonGroup className="text-nowrap">
            <Button
              variant="success"
              onClick={() => {
                if (sendResult !== true) {
                  setSendResult(true);
                  sendNotification(message).then(({ value }) => setSendResult(value));
                  setMessage(null);
                }
              }}>
              <SendIcon gapRight={2} />
              <FormattedMessage id="generic.send" defaultMessage="Send" />
            </Button>
            <Button variant="secondary" onClick={() => setMessage(null)}>
              <CloseIcon gapRight={2} />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </TheButtonGroup>
        </Modal.Footer>
      </Modal>
    </>
  ) : null;
};

ExerciseButtons.propTypes = {
  id: PropTypes.string.isRequired,
  archivedAt: PropTypes.number,
  permissionHints: PropTypes.object,
  sendNotification: PropTypes.func.isRequired,
};

export default ExerciseButtons;
