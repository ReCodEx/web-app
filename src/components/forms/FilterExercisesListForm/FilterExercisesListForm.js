import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import { Container, Row, Col, Form, FormLabel } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

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
import { TextField, RadioField, SelectField, TagsSelectorField } from '../Fields';
import { identity, safeGet } from '../../../helpers/common';
import { ExpandCollapseIcon } from '../../icons';
import InsetPanel from '../../widgets/InsetPanel';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';

const RTE_PREFIX = 'runtimeEnvironments.';

const ARCHIVED_OPTIONS = [
  {
    key: 'default',
    name: (
      <FormattedMessage
        id="app.filterExercisesListForm.archivedOptions.default"
        defaultMessage="Regular exercises (default)"
      />
    ),
  },
  {
    key: 'all',
    name: (
      <FormattedMessage
        id="app.filterExercisesListForm.archivedOptions.all"
        defaultMessage="All exercises (including archived)"
      />
    ),
  },
  {
    key: 'only',
    name: (
      <FormattedMessage
        id="app.filterExercisesListForm.archivedOptions.archived"
        defaultMessage="Only archived exercises"
      />
    ),
  },
];

const authorsToOptions = lruMemoize((authors, locale) =>
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
        <InsetPanel size="sm">
          {submitFailed && (
            <Callout variant="danger">
              <FormattedMessage
                id="generic.operationFailed"
                defaultMessage="Operation failed. Please try again later."
              />
            </Callout>
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
                      append={
                        <>
                          <Button onClick={() => change('author', null)} noShadow>
                            <FormattedMessage id="app.filterExercisesListForm.allButton" defaultMessage="All" />
                          </Button>
                          {authors.find(author => author.id === loggedUserId) && (
                            <Button onClick={() => change('author', loggedUserId)} noShadow>
                              <FormattedMessage id="app.filterExercisesListForm.mineButton" defaultMessage="Mine" />
                            </Button>
                          )}
                        </>
                      }
                    />
                  </Col>

                  {!this.isOpen() && (
                    <Col sm={12} md={2}>
                      <div className="text-right" style={{ marginTop: '2rem' }}>
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
                  <>
                    {tags && tags.length > 0 && (
                      <>
                        <Row className="mt-2">
                          <Col xs={false} sm="auto">
                            <FormLabel className="mr-2">
                              <FormattedMessage
                                id="app.filterExercisesListForm.archived"
                                defaultMessage="Archived Status:"
                              />
                            </FormLabel>
                          </Col>
                          <Col xs={12} sm className="text-muted">
                            <Field name="archived" component={RadioField} options={ARCHIVED_OPTIONS} />
                          </Col>
                        </Row>

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
                      </>
                    )}

                    <Row>
                      <Col lg={12}>
                        <hr />
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={12}>
                        <div className="mb-3">
                          <FormLabel>
                            <FormattedMessage
                              id="app.filterExercisesListForm.selectedEnvironments"
                              defaultMessage="Selected Runtime Environments:"
                            />
                          </FormLabel>
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
                  </>
                )}

                <Row>
                  <Col lg={12}>
                    <hr />
                  </Col>
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mb-2 text-center">
                      {this.isOpen() ? (
                        <TheButtonGroup>
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
                          <Button onClick={this.toggleOpen} variant="secondary">
                            <ExpandCollapseIcon isOpen={this.isOpen()} gapRight />
                            <FormattedMessage
                              id="app.filterExercisesListForm.hideAdvancedFilters"
                              defaultMessage="Hide advanced filters..."
                            />
                          </Button>
                        </TheButtonGroup>
                      ) : (
                        <span className="small clickable" onClick={this.toggleOpen}>
                          <ExpandCollapseIcon isOpen={this.isOpen()} gapRight />
                          <FormattedMessage
                            id="app.filterExercisesListForm.showAllFilters"
                            defaultMessage="Show all filters..."
                          />
                        </span>
                      )}
                    </div>
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
  intl: PropTypes.object.isRequired,
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
