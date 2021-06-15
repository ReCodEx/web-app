import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, FieldArray, getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Alert, Modal, Table, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import EditTestsTest from './EditTestsTest';
import ScoreConfigUniversalExpression from '../../scoreConfig/ScoreConfigUniversalExpression';
import SubmitButton from '../SubmitButton';
import StandaloneRadioField from '../Fields/StandaloneRadioField';
import Box from '../../widgets/Box';
import Button from '../../widgets/TheButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon, { AddIcon, CloseIcon, RefreshIcon, WarningIcon } from '../../icons';
import {
  UNIFORM_ID,
  WEIGHTED_ID,
  UNIVERSAL_ID,
  KNOWN_CALCULATORS,
  SCORE_CALCULATOR_CAPTIONS,
  SCORE_CALCULATOR_DESCRIPTIONS,
  createTestNameIndex,
} from '../../../helpers/exercise/testsAndScore';
import { Ast, AstNodeTestResult } from '../../../helpers/exercise/scoreAst';

import { arrayToObject } from '../../../helpers/common';

import style from './EditTests.less';

class EditTestsForm extends Component {
  idCounter = 0; // counter used to generate unique IDs

  getUniqueId() {
    return -++this.idCounter;
  }

  ast = null;
  lastConfig = null;
  usedTests = null;

  getAst() {
    const { calculator, initialValues } = this.props;
    if (calculator !== UNIVERSAL_ID) {
      return null;
    }

    if (!this.ast || this.lastConfig !== initialValues.config) {
      this.lastConfig = initialValues.config;
      this.ast = new Ast(this.updateAstRootHandler);
      this.ast.deserialize(initialValues.config, createTestNameIndex(initialValues.tests));
      this.usedTests = null;
      this.props.registerExtraData && this.props.registerExtraData(this.ast.getRoot());
    }
    return this.ast;
  }

  getUsedTests() {
    if (!this.usedTests && this.getAst()) {
      this.usedTests = arrayToObject(
        this.getAst().getNodes(node => node instanceof AstNodeTestResult),
        node => node.test
      );
    }
    return this.usedTests;
  }

  state = {
    dialogOpen: false, // modal with set scoring algorithm form
    expanded: false, // toggle button in the upper right corner
    astRoot: null, // we keep this just to trigger re-render when AST is changed
  };

  reset = () => {
    this.ast = null;
    this.usedTests = null;
    this.props.reset();
    if (this.props.calculator === UNIVERSAL_ID) {
      this.setState({ astRoot: this.getAst().getRoot() });
    }
  };

  openDialog = () => this.setState({ dialogOpen: true });

  closeDialog = () => {
    this.setState({ dialogOpen: false, astRoot: null });
    this.reset();
  };

  toggleExpanded = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  updateAstRootHandler = (_, newRoot) => {
    this.usedTests = null;
    this.setState({ astRoot: newRoot }); // this will actually trigger re-render
    this.props.registerExtraData && this.props.registerExtraData(this.getAst().getRoot());
  };

  render() {
    const {
      calculator = UNIFORM_ID,
      readOnly = false,
      dirty,
      submitting,
      handleSubmit,
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
        unlimitedHeight
        customIcons={
          calculator === UNIVERSAL_ID ? (
            <OverlayTrigger
              placement="left"
              overlay={
                <Tooltip id="expandToggleButton">
                  <FormattedMessage
                    id="app.editTestsForm.expandToggleTooltip"
                    defaultMessage="Toggle compressed/expanded view"
                  />
                </Tooltip>
              }>
              <Icon
                icon={this.state.expanded ? 'compress' : 'expand'}
                size="lg"
                className="valign-middle"
                onClick={this.toggleExpanded}
              />
            </OverlayTrigger>
          ) : null
        }>
        <>
          {submitFailed && (
            <Alert variant="danger">
              <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
            </Alert>
          )}

          <Container fluid className="no-padding">
            <Row className={style.relativeContainer}>
              <Col xs={calculator === UNIVERSAL_ID ? 6 : 12} className="no-padding">
                <FieldArray
                  name="tests"
                  component={EditTestsTest}
                  readOnly={readOnly}
                  usedTests={this.getUsedTests()}
                  calculator={calculator}
                />

                {!readOnly && (
                  <div className="text-center">
                    {formValues && formValues.tests.length < 99 && (
                      <Button
                        className="em-margin-right"
                        onClick={() =>
                          change('tests', [
                            ...formValues.tests,
                            {
                              id: this.getUniqueId(),
                              name: 'Test ' + (formValues.tests.length + 1).toString().padStart(2, '0'),
                              weight: '100',
                            },
                          ])
                        }
                        variant="primary">
                        <AddIcon gapRight />
                        <FormattedMessage id="app.editTestsTest.add" defaultMessage="Add Test" />
                      </Button>
                    )}

                    {(dirty || (this.getAst() && this.getAst().canUndo())) && !submitting && (
                      <Button type="reset" onClick={this.reset} variant="danger">
                        <RefreshIcon gapRight />
                        <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                      </Button>
                    )}

                    <SubmitButton
                      id="editTests"
                      invalid={invalid || (this.getAst() && !this.getAst().isValid())}
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
                        variant={dirty ? 'secondary' : 'primary'}
                        className="em-margin-left"
                        disabled={dirty}>
                        <Icon icon="calculator" gapRight />
                        <FormattedMessage id="app.editTestsForm.changeCalculator" defaultMessage="Scoring Algorithm" />
                      </Button>
                    </OptionalTooltipWrapper>

                    <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
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
                            defaultMessage="When the scoring algorithm is changed, the score configuration is transformed into corresponding format. Transforming more generic configuration into more specific one may require some reduction or even reinitialization of the score configuration. Please note that the change is performed immediately and any configuration transformations cannot be undone."
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

                        {formValues && formValues.calculator === UNIFORM_ID && formValues.calculator !== calculator && (
                          <p className="text-warning text-center">
                            <WarningIcon gapRight />
                            <FormattedMessage
                              id="app.editTestsForm.changeCalculatorModal.warningUniform"
                              defaultMessage="Current algorithm configuration will be removed."
                            />
                          </p>
                        )}

                        {formValues && formValues.calculator === WEIGHTED_ID && calculator === UNIVERSAL_ID && (
                          <p className="text-warning text-center">
                            <WarningIcon gapRight />
                            <FormattedMessage
                              id="app.editTestsForm.changeCalculatorModal.warningUniversalToWeighted"
                              defaultMessage="Transformation of generic expression into weighted average may cause some reductions in the configuration."
                            />
                          </p>
                        )}
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
                          <Button onClick={this.closeDialog} variant="outline-secondary">
                            <CloseIcon gapRight />
                            <FormattedMessage id="generic.close" defaultMessage="Close" />
                          </Button>
                        </div>
                      </Modal.Footer>
                    </Modal>
                  </div>
                )}
              </Col>

              {calculator === UNIVERSAL_ID && formValues && formValues.config && (
                <div
                  className={classnames({
                    'col-xs-6': this.state.expanded,
                    [style.rightPanel]: !this.state.expanded,
                    'em-padding-left': true,
                  })}>
                  <ScoreConfigUniversalExpression ast={this.getAst()} tests={formValues.tests} editable={!readOnly} />
                </div>
              )}
            </Row>
          </Container>
        </>
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
  onSubmit: PropTypes.func.isRequired,
  registerExtraData: PropTypes.func,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  initialValues: PropTypes.object,
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

export default reduxForm({
  form: 'editTests',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(
  connect(state => {
    return {
      formValues: getFormValues('editTests')(state),
    };
  })(EditTestsForm)
);
