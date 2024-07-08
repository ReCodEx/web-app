import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

import AssignmentDeadlinesGraph from '../../Assignments/Assignment/AssignmentDeadlinesGraph';
import { PointsGraphIcon } from '../../icons';
import Button from '../../widgets/TheButton';
import { deadlinesAndPontsAreValid } from './deadlineHelpers.js';

const DeadlinesGraphDialog = ({ deadlines, maxPointsBeforeFirstDeadline, maxPointsBeforeSecondDeadline, ...props }) => {
  const [open, setOpen] = useState(false);
  const valid = deadlinesAndPontsAreValid({
    deadlines,
    maxPointsBeforeFirstDeadline,
    maxPointsBeforeSecondDeadline,
    ...props,
  });
  const trivial = maxPointsBeforeFirstDeadline === 0 && (deadlines === 'single' || maxPointsBeforeSecondDeadline === 0);

  return (
    <>
      {!trivial && (
        <Button variant="primary" onClick={() => setOpen(true)} disabled={!valid} size="sm" className="mt-2">
          <PointsGraphIcon gapRight />
          <FormattedMessage id="app.editAssignmentForm.deadlinesGraphDialog.button" defaultMessage="Deadlines Graph" />
        </Button>
      )}

      <Modal
        show={open && valid && !trivial}
        backdrop="static"
        onHide={() => setOpen(false)}
        size={deadlines === 'single' ? 'lg' : 'xl'}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage
              id="app.assignment.deadlinesGraphDialog.title"
              defaultMessage="Visualization of points limits and corresponding deadlines"
            />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {valid && (
            <AssignmentDeadlinesGraph
              allowSecondDeadline={deadlines !== 'single'}
              maxPointsDeadlineInterpolation={deadlines === 'interpolated'}
              viewportAspectRatio={deadlines === 'single' ? 1 / 3 : 1 / 2}
              maxPointsBeforeFirstDeadline={maxPointsBeforeFirstDeadline}
              maxPointsBeforeSecondDeadline={maxPointsBeforeSecondDeadline}
              {...props}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

DeadlinesGraphDialog.propTypes = {
  firstDeadline: PropTypes.any,
  secondDeadline: PropTypes.any,
  maxPointsBeforeFirstDeadline: PropTypes.any,
  maxPointsBeforeSecondDeadline: PropTypes.any,
  deadlines: PropTypes.string,
};

export default DeadlinesGraphDialog;
