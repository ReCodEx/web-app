import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert, Well, Grid, Row, Col, Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { TextField, CheckboxField } from '../Fields';

const FilterArchiveGroupsForm = ({
  onSubmit,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  dirty
}) =>
  <Form method="POST" onSubmit={onSubmit}>
    <Well bsSize="sm">
      {submitFailed &&
        <Alert bsStyle="danger">
          <FormattedMessage
            id="generic.operationFailed"
            defaultMessage="Operation failed. Please try again later."
          />
        </Alert>}

      <Grid fluid>
        <Row>
          <Col sm={12} md={4}>
            <Field
              name="search"
              component={TextField}
              label={
                <span>
                  <FormattedMessage
                    id="app.filterArchiveGroupsForm.searchName"
                    defaultMessage="Search by name"
                  />:
                </span>
              }
            />
          </Col>
          <Col sm={12} md={6} style={{ marginTop: '28px' }}>
            <Field
              name="showAll"
              component={CheckboxField}
              onOff
              label={
                <span>
                  <FormattedMessage
                    id="app.filterArchiveGroupsForm.showAll"
                    defaultMessage="Show also nonarchived groups"
                  />:
                </span>
              }
            />
          </Col>
          <Col sm={12} md={2}>
            <div className="text-right" style={{ marginTop: '25px' }}>
              <SubmitButton
                id="setFilters"
                handleSubmit={handleSubmit}
                hasSucceeded={submitSucceeded}
                hasFailed={submitFailed}
                invalid={invalid}
                dirty={dirty}
                messages={{
                  submit: (
                    <FormattedMessage
                      id="generic.setFilters"
                      defaultMessage="Set Filters"
                    />
                  ),
                  success: (
                    <FormattedMessage
                      id="generic.filtersSet"
                      defaultMessage="Filters Set"
                    />
                  )
                }}
              />
            </div>
          </Col>
        </Row>
      </Grid>
    </Well>
  </Form>;

FilterArchiveGroupsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  dirty: PropTypes.bool,
  change: PropTypes.func.isRequired
};

export default reduxForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: false
})(FilterArchiveGroupsForm);
