import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Container, Row, Col, Form } from 'react-bootstrap';

import SubmitButton from '../SubmitButton';
import { CheckboxField, TextField } from '../Fields';
import { knownRoles, roleLabelsPlural } from '../../helpers/usersRoles';
import { identity } from '../../../helpers/common';
import InsetPanel from '../../widgets/InsetPanel';
import Callout from '../../widgets/Callout';

const FilterUsersListForm = ({
  onSubmit = identity,
  handleSubmit,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  intl: { locale },
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
          <Col sm={12}>
            <Field
              name="search"
              component={TextField}
              maxLength={255}
              label={
                <span>
                  <FormattedMessage id="app.filterUsersListForm.searchName" defaultMessage="Search by name" />:
                </span>
              }
            />
          </Col>
        </Row>
        <Row>
          <Col sm={9} md={10}>
            {knownRoles.map(role => (
              <span key={`${role}-${locale}`} className="text-nowrap float-left em-padding-right">
                <Field name={`roles.${role}`} component={CheckboxField} label={roleLabelsPlural[role]} />
              </span>
            ))}
          </Col>

          <Col sm={3} md={2}>
            <div className="text-right">
              <SubmitButton
                id="setFilters"
                handleSubmit={handleSubmit}
                hasSucceeded={submitSucceeded}
                hasFailed={submitFailed}
                invalid={invalid}
                disabled={onSubmit === null}
                messages={{
                  submit: <FormattedMessage id="generic.setFilters" defaultMessage="Set Filters" />,
                  success: <FormattedMessage id="generic.filtersSet" defaultMessage="Filters Set" />,
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </InsetPanel>
  </Form>
);

FilterUsersListForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(
  reduxForm({
    form: 'filterUsersList',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
  })(FilterUsersListForm)
);
