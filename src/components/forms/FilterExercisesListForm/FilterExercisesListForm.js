import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import { Alert, Container, Row, Col, Form, Button, ControlLabel } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import { getExerciseTags, getExerciseTagsLoading } from '../../../redux/selectors/exercises';
import {
  getAllExericsesAuthors,
  getAllExericsesAuthorsIsLoading,
  getExercisesAuthorsOfGroup,
  getExercisesAuthorsOfGroupIsLoading,
} from '../../../redux/selectors/exercisesAuthors';
import { loggedInUserIdSelector } from '../../../redux/selectors/auth';

import EditEnvironmentList from '../EditEnvironmentSimpleForm/EditEnvironmentList';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import SubmitButton from '../SubmitButton';
import { TextField, SelectField, TagsSelectorField } from '../Fields';
import { identity, safeGet } from '../../../helpers/common';
import { ExpandCollapseIcon } from '../../icons';
import InsetPanel from '../../widgets/InsetPanel';

const RTE_PREFIX = 'runtimeEnvironments.';

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
      name: author.fullName,
    }))
);

class FilterExercisesListForm extends Component {
  state = { open: null };

  isOpen = () => {
    return (
      this.state.open === true ||
      (this.state.open === null && // null = no one touched the initial state
        (safeGet(this.props, ['initialValues', 'tags', 'length'], 0) > 0 || // some tags are selected...
          Object.values(safeGet(this.props, ['initialValues', 'runtimeEnvironments'], {})).includes(true))) // ...or some envs are selected
    );
  };

  toggleOpen = ev => {
    ev.preventDefault();
    this.setState({
      open: !this.isOpen(),
    });
  };

  selectAllRuntimes = () => {
    const { runtimeEnvironments, change } = this.props;
    runtimeEnvironments.forEach(env => {
      change(`${RTE_PREFIX}${env.id}`, true);
    });
  };

  clearAllRuntimes = () => {
    const { runtimeEnvironments, change } = this.props;
    runtimeEnvironments.forEach(env => {
      change(`${RTE_PREFIX}${env.id}`, false);
    });
  };

  invertRuntimeSelection = () => {
    const { runtimeEnvironments, envValueSelector, change } = this.props;
    runtimeEnvironments.forEach(env => {
      const name = `${RTE_PREFIX}${env.id}`;
      change(name, !envValueSelector(name));
    });
  };

  render() {
    const {
      onSubmit = identity,
      handleSubmit,
      authors,
      authorsLoading,
      tags = [],
      tagsLoading = false,
      runtimeEnvironments,
      loggedUserId,
      submitFailed = false,
      submitSucceeded = false,
      invalid,
      change,
      intl: { locale },
    } = this.props;

    return (
      <Form method="POST" onSubmit={onSubmit}>
        <InsetPanel bsSize="sm">
          {submitFailed && (
            <Alert variant="danger">
              <FormattedMessage
                id="generic.operationFailed"
                defaultMessage="Operation failed. Please try again later."
              />
            </Alert>
          )}

          <ResourceRenderer resource={authors} returnAsArray forceLoading={authorsLoading || tagsLoading} bulkyLoading>
            {authors => (
              <Container fluid>
                <Row>
                  <Col sm={12} md={this.isOpen() ? 6 : 4}>
                    <Field
                      name="search"
                      component={TextField}
                      maxLength={255}
                      label={
                        <span>
                          <FormattedMessage
                            id="app.filterExercisesListForm.searchName"
                            defaultMessage="Search by name"
                          />
                          :
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
                          <FormattedMessage id="app.filterExercisesListForm.author" defaultMessage="Author" />:
                        </span>
                      }
                      associatedButton={
                        <div className="text-nowrap">
                          <Button className="btn-flat" onClick={() => change('author', null)}>
                            <FormattedMessage id="app.filterExercisesListForm.allButton" defaultMessage="All" />
                          </Button>
                          {authors.find(author => author.id === loggedUserId) && (
                            <Button className="btn-flat" onClick={() => change('author', loggedUserId)}>
                              <FormattedMessage id="app.filterExercisesListForm.mineButton" defaultMessage="Mine" />
                            </Button>
                          )}
                        </div>
                      }
                    />
                  </Col>

                  {!this.isOpen() && (
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
                            submit: <FormattedMessage id="generic.setFilters" defaultMessage="Set Filters" />,
                            success: <FormattedMessage id="generic.filtersSet" defaultMessage="Filters Set" />,
                          }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>

                {this.isOpen() && (
                  <React.Fragment>
                    {tags && tags.length > 0 && (
                      <React.Fragment>
                        <Row>
                          <Col lg={12}>
                            <hr />
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={12}>
                            <FieldArray
                              name="tags"
                              tags={tags}
                              component={TagsSelectorField}
                              label={
                                <FormattedMessage
                                  id="app.filterExercisesListForm.selectedTags"
                                  defaultMessage="Selected Tags:"
                                />
                              }
                            />
                          </Col>
                        </Row>
                      </React.Fragment>
                    )}

                    <Row>
                      <Col lg={12}>
                        <hr />
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={12}>
                        <div className="em-margin-bottom">
                          <ControlLabel>
                            <FormattedMessage
                              id="app.filterExercisesListForm.selectedEnvironments"
                              defaultMessage="Selected Runtime Environments:"
                            />
                          </ControlLabel>
                        </div>
                        <EditEnvironmentList
                          runtimeEnvironments={runtimeEnvironments}
                          namePrefix={RTE_PREFIX}
                          selectAllRuntimesHandler={this.selectAllRuntimes}
                          clearAllRuntimesHandler={this.clearAllRuntimes}
                          invertRuntimeSelectionHandler={this.invertRuntimeSelection}
                          fullWidth
                        />
                      </Col>
                    </Row>
                  </React.Fragment>
                )}

                <Row>
                  <Col lg={12}>
                    <hr />
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <p className="text-center">
                      {this.isOpen() && (
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
                      )}

                      <span className="small clickable em-padding-horizontal" onClick={this.toggleOpen}>
                        <ExpandCollapseIcon isOpen={this.isOpen()} gapRight />
                        {this.isOpen() ? (
                          <FormattedMessage
                            id="app.filterExercisesListForm.hideAdvancedFilters"
                            defaultMessage="Hide advanced filters..."
                          />
                        ) : (
                          <FormattedMessage
                            id="app.filterExercisesListForm.showAllFilters"
                            defaultMessage="Show all filters..."
                          />
                        )}
                      </span>
                    </p>
                  </Col>
                </Row>
              </Container>
            )}
          </ResourceRenderer>
        </InsetPanel>
      </Form>
    );
  }
}

FilterExercisesListForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  change: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  authors: ImmutablePropTypes.list,
  authorsLoading: PropTypes.bool.isRequired,
  tags: PropTypes.array,
  tagsLoading: PropTypes.bool,
  envValueSelector: PropTypes.func.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  loggedUserId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default connect((state, { rootGroup = null, form }) => ({
  loggedUserId: loggedInUserIdSelector(state),
  authors: rootGroup ? getExercisesAuthorsOfGroup(rootGroup)(state) : getAllExericsesAuthors(state),
  authorsLoading: rootGroup
    ? getExercisesAuthorsOfGroupIsLoading(rootGroup)(state)
    : getAllExericsesAuthorsIsLoading(state),
  tags: getExerciseTags(state),
  tagsLoading: getExerciseTagsLoading(state),
  envValueSelector: name => formValueSelector(form)(state, name),
}))(
  injectIntl(
    reduxForm({
      enableReinitialize: true,
      keepDirtyOnReinitialize: false,
    })(FilterExercisesListForm)
  )
);
