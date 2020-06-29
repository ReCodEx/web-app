import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Modal, Table, Grid, Row, Col } from 'react-bootstrap';
import classnames from 'classnames';

import EditTestsTest from './EditTestsTest';
import ScoreConfigUniversalExpression from '../../scoreConfig/ScoreConfigUniversalExpression';
import SubmitButton from '../SubmitButton';
import StandaloneRadioField from '../Fields/StandaloneRadioField';
import Box from '../../widgets/Box';
import Button from '../../widgets/FlatButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon, { AddIcon, CloseIcon, RefreshIcon } from '../../icons';
import {
  UNIFORM_ID,
  UNIVERSAL_ID,
  KNOWN_CALCULATORS,
  SCORE_CALCULATOR_CAPTIONS,
  SCORE_CALCULATOR_DESCRIPTIONS,
} from '../../../helpers/exercise/score';

class EditTestsForm extends Component {
  state = { dialogOpen: false };

  openDialog = () => this.setState({ dialogOpen: true });

  closeDialog = () => {
    this.setState({ dialogOpen: false });
    this.props.reset();
  };

  render() {
    const {
      calculator = UNIFORM_ID,
      readOnly = false,
      dirty,
      submitting,
      handleSubmit,
      reset,
      change,
      submitFailed,
      submitSucceeded,
      invalid,
      formValues,
    } = this.props;

    return (
      <Box
        id="tests-score-form"
        title={<FormattedMessage id="app.editExerciseConfig.testsAndScoring" defaultMessage="Tests and Scoring" />}
        unlimitedHeight>
        <React.Fragment>
          {submitFailed && (
            <Alert bsStyle="danger">
              <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
            </Alert>
          )}

          <Grid fluid className="no-padding">
            <Row className="no-margin editTestFormRelativeContainer">
              <Col lg={calculator === UNIVERSAL_ID ? 6 : 12} className="no-padding">
                <FieldArray name="tests" component={EditTestsTest} readOnly={readOnly} calculator={calculator} />

                {!readOnly && (
                  <div className="text-center">
                    {formValues && formValues.tests.length < 99 && (
                      <Button
                        className="em-margin-right"
                        onClick={() =>
                          change('tests', [
                            ...formValues.tests,
                            {
                              name: 'Test ' + (formValues.tests.length + 1).toString().padStart(2, '0'),
                              weight: '100',
                            },
                          ])
                        }
                        bsStyle="primary">
                        <AddIcon gapRight />
                        <FormattedMessage id="app.editTestsTest.add" defaultMessage="Add Test" />
                      </Button>
                    )}

                    {dirty && !submitting && (
                      <span>
                        <Button type="reset" onClick={reset} bsStyle="danger" className="btn-flat">
                          <RefreshIcon gapRight />
                          <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                        </Button>
                      </span>
                    )}

                    <SubmitButton
                      id="editTests"
                      invalid={invalid}
                      submitting={submitting}
                      hasSucceeded={submitSucceeded}
                      dirty={dirty}
                      hasFailed={submitFailed}
                      handleSubmit={handleSubmit}
                      messages={{
                        submit: <FormattedMessage id="app.editTestsForm.submit" defaultMessage="Save Tests" />,
                        submitting: (
                          <FormattedMessage id="app.editTestsForm.submitting" defaultMessage="Saving Tests..." />
                        ),
                        success: <FormattedMessage id="app.editTestsForm.success" defaultMessage="Tests Saved." />,
                      }}
                    />

                    {!readOnly && (
                      <OptionalTooltipWrapper
                        tooltip={
                          <FormattedMessage
                            id="app.editTestsForm.changeCalculatorDisabledTooltip"
                            defaultMessage="The scoring algorithm may be changed only when there are no unsaved modifications in this form."
                          />
                        }
                        hide={!dirty}>
                        <Button
                          onClick={this.openDialog}
                          bsStyle={dirty ? 'default' : 'primary'}
                          className="em-margin-left"
                          disabled={dirty}>
                          <Icon icon="calculator" gapRight />
                          <FormattedMessage
                            id="app.editTestsForm.changeCalculator"
                            defaultMessage="Scoring Algorithm"
                          />
                        </Button>
                      </OptionalTooltipWrapper>
                    )}

                    {!readOnly && (
                      <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} bsSize="large">
                        <Modal.Header closeButton>
                          <Modal.Title>
                            <FormattedMessage
                              id="app.editTestsForm.changeCalculatorModal.title"
                              defaultMessage="Set Scoring Algorithm"
                            />
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <div className="callout callout-info">
                            <FormattedMessage
                              id="app.editTestsForm.changeCalculatorModal.info"
                              defaultMessage="When the scoring algorithm is changed, the score configuration is transformed into corresponding format. Transforming more generic configuration into more specific one may require some reduction or even reinitialization of the score configuration."
                            />
                          </div>

                          <Table hover>
                            <tbody>
                              {KNOWN_CALCULATORS.map(calc => (
                                <tr
                                  key={calc}
                                  className={classnames({
                                    'bg-info': calc === calculator,
                                  })}>
                                  <td className="valign-middle shrink-col">
                                    <StandaloneRadioField name="calculator" value={calc} />
                                  </td>
                                  <td>
                                    <strong>{SCORE_CALCULATOR_CAPTIONS[calc]}</strong>
                                    <br />
                                    <small className="text-muted">{SCORE_CALCULATOR_DESCRIPTIONS[calc]}</small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Modal.Body>
                        <Modal.Footer>
                          <div className="text-center">
                            <SubmitButton
                              id="editTests"
                              disabled={formValues && formValues.calculator === calculator}
                              submitting={submitting}
                              hasSucceeded={submitSucceeded}
                              handleSubmit={handleSubmit}
                              onSubmit={this.closeDialog}
                              messages={{
                                submit: (
                                  <FormattedMessage
                                    id="app.editTestsForm.changeCalculator.submit"
                                    defaultMessage="Set Algorithm"
                                  />
                                ),
                                submitting: (
                                  <FormattedMessage
                                    id="app.editTestsForm.changeCalculator.submitting"
                                    defaultMessage="Setting Algorithm..."
                                  />
                                ),
                                success: (
                                  <FormattedMessage
                                    id="app.editTestsForm.changeCalculator.success"
                                    defaultMessage="Algorithm Set."
                                  />
                                ),
                              }}
                            />
                            <Button onClick={this.closeDialog} bsStyle="default">
                              <CloseIcon gapRight />
                              <FormattedMessage id="generic.close" defaultMessage="Close" />
                            </Button>
                          </div>
                        </Modal.Footer>
                      </Modal>
                    )}
                  </div>
                )}
              </Col>
              {calculator === UNIVERSAL_ID && formValues && (
                <div className="editTestFormRightPanel">
                  <ScoreConfigUniversalExpression initialConfig={formValues.config} tests={formValues.tests} editable />
                </div>
              )}
            </Row>
          </Grid>
        </React.Fragment>
      </Box>
    );
  }
}

EditTestsForm.propTypes = {
  calculator: PropTypes.string,
  readOnly: PropTypes.bool,
  values: PropTypes.array,
  reset: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  changeCalculator: PropTypes.func,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.object,
};

const validate = ({ tests }) => {
  const errors = {};
  if (!tests) {
    return errors;
  }

  const testsErrors = {};
  const knownTests = new Set();
  for (let i = 0; i < tests.length; ++i) {
    const test = tests[i];
    const testErrors = {};
    if (!test.name || test.name === '') {
      testErrors.name = (
        <FormattedMessage id="app.editTestsForm.validation.testName" defaultMessage="Please fill test name." />
      );
    } else if (!test.name.match(/^[-a-zA-Z0-9_()[\].! ]+$/)) {
      testErrors.name = (
        <FormattedMessage
          id="app.editTestsForm.validation.testNameInvalidCharacters"
          defaultMessage="The test name contains invalid characters. The test name must follow certain restrictions since it is used as a name of directory."
        />
      );
    } else if (knownTests.has(test.name)) {
      testErrors.name = (
        <FormattedMessage
          id="app.editTestsForm.validation.testNameTaken"
          defaultMessage="This name is taken, please fill different one."
        />
      );
    } else {
      knownTests.add(test.name);
    }

    testsErrors[i] = testErrors;
  }
  errors.tests = testsErrors;
  return errors;
};

export default connect(state => {
  return {
    formValues: getFormValues('editTests')(state),
  };
})(
  reduxForm({
    form: 'editTests',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    validate,
  })(EditTestsForm)
);
