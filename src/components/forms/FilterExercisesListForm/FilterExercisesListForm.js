import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field } from 'redux-form';
import { Alert, Well, Grid, Row, Col, Form, Button } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import SubmitButton from '../SubmitButton';
import { TextField, SelectField } from '../Fields';
import { identity } from '../../../helpers/common';

const authorsToOptions = defaultMemoize((authors, locale) =>
  authors
    .filter(identity)
    .sort(
      (a, b) =>
        a.name.lastName.localeCompare(b.name.lastName, locale) ||
        a.name.firstName.localeCompare(b.name.firstName, locale)
    )
    .map(author => ({
      key: author.id,
      name: author.fullName
    }))
);

const FilterExercisesListForm = ({
  onSubmit = identity,
  handleSubmit,
  authors,
  authorsLoading,
  loggedUserId,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  change,
  intl: { locale }
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

      <ResourceRenderer
        resource={authors}
        returnAsArray
        forceLoading={authorsLoading}
        bulkyLoading
      >
        {authors =>
          <Grid fluid>
            <Row>
              <Col sm={12} md={4}>
                <Field
                  name="search"
                  component={TextField}
                  label={
                    <span>
                      <FormattedMessage
                        id="app.filterExercisesListForm.searchName"
                        defaultMessage="Search by name"
                      />:
                    </span>
                  }
                />
              </Col>
              <Col sm={12} md={6}>
                <Field
                  name="author"
                  component={SelectField}
                  addEmptyOption
                  emptyOptionCaption=""
                  options={authorsToOptions(authors, locale)}
                  label={
                    <span>
                      <FormattedMessage
                        id="app.filterExercisesListForm.author"
                        defaultMessage="Author"
                      />:
                    </span>
                  }
                  associatedButton={
                    <div className="text-nowrap">
                      <Button
                        className="btn-flat"
                        onClick={() => change('author', null)}
                      >
                        <FormattedMessage
                          id="app.filterExercisesListForm.allButton"
                          defaultMessage="All"
                        />
                      </Button>
                      {authors.find(author => author.id === loggedUserId) &&
                        <Button
                          className="btn-flat"
                          onClick={() => change('author', loggedUserId)}
                        >
                          <FormattedMessage
                            id="app.filterExercisesListForm.mineButton"
                            defaultMessage="Mine"
                          />
                        </Button>}
                    </div>
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
                    disabled={onSubmit === null}
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
          </Grid>}
      </ResourceRenderer>
    </Well>
  </Form>;

FilterExercisesListForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  change: PropTypes.func.isRequired,
  authors: ImmutablePropTypes.list,
  authorsLoading: PropTypes.bool.isRequired,
  loggedUserId: PropTypes.string.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(
  reduxForm({
    enableReinitialize: true,
    keepDirtyOnReinitialize: false
  })(FilterExercisesListForm)
);
