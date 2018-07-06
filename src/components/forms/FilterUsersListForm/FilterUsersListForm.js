import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert, Well, Grid, Row, Col } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { CheckboxField, TextField } from '../Fields';
import { knownRoles, roleLabelsPlural } from '../../helpers/usersRoles';

const FilterUsersListForm = ({
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid
}) =>
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
        <Col sm={12}>
          <Field
            name="search"
            component={TextField}
            label={
              <span>
                <FormattedMessage
                  id="app.filterUsersListForm.searchName"
                  defaultMessage="Search by name"
                />:
              </span>
            }
          />
        </Col>
      </Row>
      <Row>
        <Col sm={9} md={10}>
          {knownRoles.map(role =>
            <span
              key={role}
              className="text-nowrap pull-left"
              style={{ paddingRight: '20px' }}
            >
              <Field
                name={`roles.${role}`}
                component={CheckboxField}
                onOff
                label={roleLabelsPlural[role]}
              />
            </span>
          )}
        </Col>

        <Col sm={3} md={2}>
          <div className="text-right">
            <SubmitButton
              id="setFilters"
              handleSubmit={handleSubmit}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              invalid={invalid}
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
  </Well>;

FilterUsersListForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: intlShape.isRequired
};

export default injectIntl(
  reduxForm({
    form: 'filterUsersList',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false
  })(FilterUsersListForm)
);
