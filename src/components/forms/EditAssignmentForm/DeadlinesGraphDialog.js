import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';

import AssignmentDeadlinesGraph from '../../Assignments/Assignment/AssignmentDeadlinesGraph';
import { PointsGraphIcon } from '../../icons';
import Button from '../../widgets/TheButton';
import { deadlinesAndPontsAreValid } from './deadlineHelpers';

const DeadlinesGraphDialog = ({ deadlines, ...props }) => {
  const [open, setOpen] = useState(false);
  const valid = deadlinesAndPontsAreValid({ deadlines, ...props });

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)} disabled={!valid} size="sm" className="mt-2">
        <PointsGraphIcon gapRight />
        <FormattedMessage id="app.editAssignmentForm.deadlinesGraphDialog.button" defaultMessage="Deadlines Graph" />
      </Button>

      <Modal
        show={open && valid}
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
