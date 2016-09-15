import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import AssignmentsTable from '../../Assignments/Assignment/AssignmentsTable';

const StudentsView = ({
  group,
  assignments
}) => (
  <Row>
    <Col xs={12}>
      <Box
        title={<FormattedMessage id='app.groupDetail.assignments' defaultMessage='Assignments' />}
        collapsable
        noPadding
        isOpen>
        <AssignmentsTable
          assignments={assignments}
          showGroup={false} />
      </Box>
    </Col>
  </Row>
);

StudentsView.propTypes = {
  group: PropTypes.object.isRequired,
  assignments: ImmutablePropTypes.list.isRequired
};

export default StudentsView;
