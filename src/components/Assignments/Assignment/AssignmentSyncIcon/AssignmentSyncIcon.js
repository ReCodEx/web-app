import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import DateTime from '../../../widgets/DateTime';
import { WarningIcon } from '../../../icons';
import { isUpToDate } from '../../../helpers/assignments.js';

const AssignmentSyncIcon = ({ id, syncInfo, ...props }) => {
  return !isUpToDate(syncInfo) ? (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Popover id={`assginmentsync-${id}`}>
          <Popover.Header>
            <FormattedMessage
              id="app.assignment.syncRequiredTitle"
              defaultMessage="The exercise data are newer than assignment data"
            />
          </Popover.Header>
          <Popover.Body>
            <p>
              <FormattedMessage
                id="app.assignment.syncRequired"
                defaultMessage="Exercise was updated at <strong>{exerciseUpdated}</strong>, but the assignment was synchronized with the exercise at <strong>{assignmentUpdated}</strong>!"
                values={{
                  exerciseUpdated: <DateTime unixTs={syncInfo.updatedAt.exercise} emptyPlaceholder="??" />,
                  assignmentUpdated: <DateTime unixTs={syncInfo.updatedAt.assignment} emptyPlaceholder="??" />,
                  strong: contents => (
                    <strong key="strong">
                      {Array.isArray(contents)
                        ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                        : contents}
                    </strong>
                  ),
                }}
              />
            </p>

            {!syncInfo.isSynchronizationPossible && (
              <p>
                <WarningIcon className="text-danger" gapRight={2} />
                <FormattedMessage
                  id="app.assignment.syncIsNotPossible"
                  defaultMessage="The exercise is not in a consistent state, synchronization is not possible at the moment."
                />
              </p>
            )}
          </Popover.Body>
        </Popover>
      }>
      <span>
        <WarningIcon {...props} className={syncInfo.isSynchronizationPossible ? 'text-warning' : 'text-danger'} />
      </span>
    </OverlayTrigger>
  ) : null;
};

AssignmentSyncIcon.propTypes = {
  id: PropTypes.string.isRequired,
  syncInfo: PropTypes.object.isRequired,
};

export default AssignmentSyncIcon;
