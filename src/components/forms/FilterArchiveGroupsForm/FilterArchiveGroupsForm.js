import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col, Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { TextField, CheckboxField } from '../Fields';
import Callout from '../../widgets/Callout';
import InsetPanel from '../../widgets/InsetPanel';

const FilterArchiveGroupsForm = ({
  onSubmit,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  dirty,
}) => (
  <Form method="POST" onSubmit={onSubmit}>
    <InsetPanel size="sm">
      {submitFailed && (
        <Callout variant="danger">
          <FormattedMessage id="generic.operationFailed" defaultMessage="Operation failed. Please try again later." />
        </Callout>
      )}

      <Container fluid>
        <Row>
          <Col sm={12} md={4}>
            <Field
              name="search"
              component={TextField}
              maxLength={255}
              label={
                <span>
                  <FormattedMessage id="app.filterArchiveGroupsForm.searchName" defaultMessage="Search by name" />:
                </span>
              }
            />
          </Col>
          <Col sm={12} md={6} className="align-self-end">
            <Field
              name="showAll"
              component={CheckboxField}
              onOff
              label={
                <span>
                  <FormattedMessage
                    id="app.filterArchiveGroupsForm.showAll"
                    defaultMessage="Show also nonarchived groups"
                  />
                  :
                </span>
              }
            />
          </Col>
          <Col sm={12} md={2} className="text-right align-self-center">
            <SubmitButton
              id="setFilters"
              handleSubmit={handleSubmit}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              invalid={invalid}
              dirty={dirty}
              messages={{
                submit: <FormattedMessage id="generic.setFilters" defaultMessage="Set Filters" />,
                success: <FormattedMessage id="generic.filtersSet" defaultMessage="Filters Set" />,
              }}
            />
          </Col>
        </Row>
      </Container>
    </InsetPanel>
  </Form>
);

FilterArchiveGroupsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  dirty: PropTypes.bool,
  change: PropTypes.func.isRequired,
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
})(FilterArchiveGroupsForm);
