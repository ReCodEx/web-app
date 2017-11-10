import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../widgets/Box';
import AssignmentsTable from '../../Assignments/Assignment/AssignmentsTable';
import StudentsListContainer from '../../../containers/StudentsListContainer';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

const StudentsView = ({
  group,
  statuses = [],
  assignments,
  isAdmin = false,
  intl: { locale }
}) =>
  <div>
    <Row>
      <Col sm={12}>
        <h3>
          <FormattedMessage
            id="app.group.studentsView.title"
            defaultMessage="Student's dashboard for {groupName}"
            values={{ groupName: getLocalizedName(group, locale) }}
          />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.studentsView.assignments"
              defaultMessage="Assignments"
            />
          }
          collapsable
          noPadding
          unlimitedHeight
          isOpen
        >
          <AssignmentsTable
            assignments={assignments}
            showGroup={false}
            statuses={statuses}
          />
        </Box>
      </Col>
      <Col lg={6}>
        <Box
          title={
            <FormattedMessage
              id="app.studentsView.students"
              defaultMessage="Students"
            />
          }
          collapsable
          noPadding
          unlimitedHeight
          isOpen
        >
          <StudentsListContainer
            groupId={group.id}
            renderActions={userId =>
              isAdmin &&
              <LeaveJoinGroupButtonContainer
                userId={userId}
                groupId={group.id}
              />}
            fill
          />
        </Box>
      </Col>
    </Row>
  </div>;

StudentsView.propTypes = {
  group: PropTypes.object.isRequired,
  assignments: ImmutablePropTypes.list.isRequired,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(StudentsView);
