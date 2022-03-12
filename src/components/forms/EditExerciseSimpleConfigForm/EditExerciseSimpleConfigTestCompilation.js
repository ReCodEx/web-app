import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import { EMPTY_ARRAY } from '../../../helpers/common';
import Button from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import Icon, { ExpandCollapseIcon, WarningIcon } from '../../icons';
import { SelectField, ExpandingInputFilesField, ExpandingSelectField, ExpandingTextField } from '../Fields';
import Confirm from '../../forms/Confirm';
import Explanation from '../../widgets/Explanation';
import { ENV_JAVA_ID, ENV_C_GCC_ID, ENV_CPP_GCC_ID } from '../../../helpers/exercise/environments';

class EditExerciseSimpleConfigTestCompilation extends Component {
  constructor(props) {
    super(props);
    this.state = { compilationOpen: null }; // null means the user has not changed the state and
  }

  compilationOpen = ev => {
    ev.preventDefault();
    this.setState({ compilationOpen: true });
  };

  compilationClose = ev => {
    ev.preventDefault();
    this.setState({ compilationOpen: false });
  };

  getPossibleEntryPoints = envId => {
    const { extraFiles, environmentsWithEntryPoints, intl } = this.props;
    if (!environmentsWithEntryPoints.includes(envId)) {
      return EMPTY_ARRAY;
    }

    const files = (extraFiles && extraFiles[envId]) || EMPTY_ARRAY;
    return files
      .filter(({ file, name }) => file && name)
      .map(({ name }) => ({
        key: name,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, intl.locale));
  };

  render() {
    const {
      change,
      exercise,
      smartFillCompilation,
      supplementaryFiles,
      test,
      testErrors,
      intl,
      readOnly = false,
      compilationInitiallyOpened = false,
    } = this.props;
    return (
      <>
        {this.state.compilationOpen === true || (this.state.compilationOpen === null && compilationInitiallyOpened) ? (
          <InsetPanel>
            <h4 className="compilation-close" onClick={this.compilationClose}>
              <ExpandCollapseIcon isOpen={true} gapRight />
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.compilationTitle"
                defaultMessage="Compilation/Execution"
              />
            </h4>
            <p className="text-muted small">
              <FormattedMessage
                id="app.editExerciseSimpleConfigTests.compilationInfo"
                defaultMessage="Additional files that are added to compilation (in case of compiled environments) or execution (in case of interpreted environments)."
              />
            </p>
            <div className="compilation">
              <table>
                <tbody>
                  <tr>
                    {exercise.runtimeEnvironments
                      .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                      .map(env => {
                        const possibleEntryPoints = this.getPossibleEntryPoints(env.id);
                        return (
                          <td key={env.id}>
                            {exercise.runtimeEnvironments.length > 1 && (
                              <h4>
                                <EnvironmentsListItem runtimeEnvironment={env} longNames />
                              </h4>
                            )}

                            <Container fluid>
                              <Row>
                                {
                                  env.id === ENV_JAVA_ID && (
                                    /*
                                     * A special case for Java only !!!
                                     */
                                    <Col lg={exercise.runtimeEnvironments.length === 1 ? 6 : 12}>
                                      <FieldArray
                                        name={`${test}.jar-files.${env.id}`}
                                        component={ExpandingSelectField}
                                        options={supplementaryFiles}
                                        label={
                                          <FormattedMessage
                                            id="app.editExerciseSimpleConfigTests.jarFiles"
                                            defaultMessage="Additional JAR file:"
                                          />
                                        }
                                        noItems={
                                          <FormattedMessage
                                            id="app.editExerciseSimpleConfigTests.noJarFiles"
                                            defaultMessage="There are no additional JAR files yet..."
                                          />
                                        }
                                        readOnly={readOnly}
                                      />
                                      {exercise.runtimeEnvironments.length !== 1 && <hr />}
                                    </Col>
                                  )
                                  /*
                                   * End of special case.
                                   */
                                }

                                {
                                  (env.id === ENV_C_GCC_ID || env.id === ENV_CPP_GCC_ID) && (
                                    /*
                                     * A special case for C/C++ only !!!
                                     */
                                    <Col lg={exercise.runtimeEnvironments.length === 1 ? 6 : 12}>
                                      <FieldArray
                                        name={`${test}.compile-args.${env.id}`}
                                        component={ExpandingTextField}
                                        maxLength={1024}
                                        readOnly={readOnly}
                                        label={
                                          <>
                                            <FormattedMessage
                                              id="app.editExerciseSimpleConfigTests.compilationArguments"
                                              defaultMessage="Compilation arguments:"
                                            />
                                            <Explanation id={`${test}.compile-args-explanation.${env.id}`}>
                                              <FormattedMessage
                                                id="app.editExerciseSimpleConfigTests.compilationArgumentsExplanation"
                                                defaultMessage="Please, place individual arguments into individual input boxes. Any whitespace inside the input box will be treated as a regular part of the argument value (not as a separator of arguments). These arguments will be appended after the default arguments set in the compilation pipeline."
                                              />
                                            </Explanation>

                                            <OverlayTrigger
                                              placement="right"
                                              overlay={
                                                <Tooltip id={`${test}.compile-args-warning.${env.id}`}>
                                                  <FormattedMessage
                                                    id="app.editExerciseSimpleConfigTests.compileArgsWarning"
                                                    defaultMessage="Setting compilation arguments is potentially error-prone. Make sure you know how the pipelines and the workers are configured before adding any custom compilation arguments."
                                                  />
                                                </Tooltip>
                                              }>
                                              <WarningIcon className="text-warning" />
                                            </OverlayTrigger>
                                          </>
                                        }
                                      />
                                      {exercise.runtimeEnvironments.length !== 1 && <hr />}
                                    </Col>
                                  )
                                  /*
                                   * End of special case.
                                   */
                                }

                                <Col
                                  lg={
                                    exercise.runtimeEnvironments.length === 1 &&
                                    (env.id === ENV_JAVA_ID || env.id === ENV_C_GCC_ID || env.id === ENV_CPP_GCC_ID)
                                      ? 6
                                      : 12
                                  }>
                                  <FieldArray
                                    name={`${test}.extra-files.${env.id}`}
                                    component={ExpandingInputFilesField}
                                    options={supplementaryFiles}
                                    change={change}
                                    leftLabel={
                                      <FormattedMessage
                                        id="app.editExerciseSimpleConfigTests.extraFilesActual"
                                        defaultMessage="Extra file:"
                                      />
                                    }
                                    rightLabel={
                                      <FormattedMessage
                                        id="app.editExerciseSimpleConfigTests.extraFilesRename"
                                        defaultMessage="Rename as:"
                                      />
                                    }
                                    noItemsLabel={
                                      <FormattedMessage
                                        id="app.editExerciseSimpleConfigTests.extraFilesNoItemsLabel"
                                        defaultMessage="Extra files:"
                                      />
                                    }
                                    noItems={
                                      <FormattedMessage
                                        id="app.editExerciseSimpleConfigTests.noExtraFiles"
                                        defaultMessage="There are no extra files yet..."
                                      />
                                    }
                                    readOnly={readOnly}
                                  />
                                  <br />
                                  {possibleEntryPoints.length > 0 && (
                                    <Field
                                      name={`${test}.entry-point.${env.id}`}
                                      component={SelectField}
                                      options={this.getPossibleEntryPoints(env.id)}
                                      addEmptyOption={true}
                                      disabled={readOnly}
                                      label={
                                        <FormattedMessage
                                          id="app.editExerciseSimpleConfigTests.entryPoint"
                                          defaultMessage="Point of entry (bootstrap file):"
                                        />
                                      }
                                    />
                                  )}
                                </Col>
                              </Row>
                            </Container>
                          </td>
                        );
                      })}
                  </tr>
                </tbody>
              </table>
            </div>

            {Boolean(smartFillCompilation) && !readOnly && (
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillCompilation"
                  onConfirmed={smartFillCompilation}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillCompilation.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite compilation and execution configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }>
                  <Button variant="primary" size="xs" disabled={Boolean(testErrors)}>
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillCompilation"
                      defaultMessage="Smart Fill Compilation"
                    />
                  </Button>
                </Confirm>
              </div>
            )}
          </InsetPanel>
        ) : (
          <InsetPanel className="text-muted compilation-open" size="small" onClick={this.compilationOpen}>
            <ExpandCollapseIcon isOpen={false} gapRight />
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.compilationTitle"
              defaultMessage="Compilation/Execution"
            />
          </InsetPanel>
        )}
      </>
    );
  }
}

EditExerciseSimpleConfigTestCompilation.propTypes = {
  exercise: PropTypes.object,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  extraFiles: PropTypes.object,
  compilationInitiallyOpened: PropTypes.bool,
  useOutFile: PropTypes.bool,
  useCustomJudge: PropTypes.bool,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  testErrors: PropTypes.object,
  smartFillCompilation: PropTypes.func,
  change: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(EditExerciseSimpleConfigTestCompilation);
