import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LoadingIcon } from '../../Icons';
import Box from '../../AdminLTE/Box';

const LoadingGroupDetail = ({
  group,
  assignments
}) => (
  <div>
    <p>
      <LoadingIcon /> <FormattedMessage id='app.groupDetail.loading' defaultMessage="Loading group's description ..." />
    </p>
    <Row>
      <Col lg={6}>
        <Box
          title={
            <span>
              <LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingSupervisorsList' defaultMessage='Loading list of supervisors ...' />
            </span>
          }
          collapsable
          isOpen
          noPadding={false}>
          <p>
            <LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingSupervisorsList' defaultMessage='Loading list of supervisors ...' />
          </p>
        </Box>
        <Box
          title={
            <span>
              <LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingStudentsList' defaultMessage='Loading list of students ...' />
            </span>
          }
          collapsable
          isOpen={false}
          noPadding={false}>
          <p>
            <LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingStudentsList' defaultMessage='Loading list of students ...' />
          </p>
        </Box>
      </Col>

      <Col lg={6}>
        <Box
          title={
            <span>
              <LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingAssignmentsList' defaultMessage='Loading list of assignments ...' />
            </span>
          }
          collapsable
          isOpen={true}
          noPadding={false}>
          <p><LoadingIcon /> <FormattedMessage id='app.groupDetail.loadingAssignmentsList' defaultMessage='Loading list of assignments ...' /></p>
        </Box>
      </Col>
    </Row>
  </div>
);

export default LoadingGroupDetail;
