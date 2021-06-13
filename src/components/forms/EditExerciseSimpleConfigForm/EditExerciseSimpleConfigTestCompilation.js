import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { Grid, Row, Col } from 'react-bootstrap';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import { EMPTY_ARRAY } from '../../../helpers/common';
import Button from '../../widgets/FlatButton';
import InsetPanel from '../../widgets/InsetPanel';
import Icon, { ExpandCollapseIcon } from '../../icons';
import { SelectField, ExpandingInputFilesField, ExpandingSelectField } from '../Fields';
import Confirm from '../../forms/Confirm';
import { ENV_JAVA_ID } from '../../../helpers/exercise/environments';

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

  hasCompilationExtraFiles() {
    const { extraFiles, jarFiles } = this.props;
    if (!extraFiles && !jarFiles) {
      return false;
    }

    if (extraFiles) {
      for (const files of Object.values(extraFiles)) {
        if (files && files.length > 0) {
          return true;
        }
      }
    }

    if (jarFiles) {
      for (const files of Object.values(jarFiles)) {
        if (files && files.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

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
    } = this.props;
    return (
      <React.Fragment>
        {this.state.compilationOpen === true ||
        (this.state.compilationOpen === null && this.hasCompilationExtraFiles()) ? (
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

                            <Grid fluid>
                              <Row>
                                {env.id === ENV_JAVA_ID && (
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

                                <Col lg={exercise.runtimeEnvironments.length === 1 && env.id === ENV_JAVA_ID ? 6 : 12}>
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
                            </Grid>
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
                  <Button bsStyle="primary" className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
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
          <div className="text-muted compilation-open" onClick={this.compilationOpen}>
            <ExpandCollapseIcon isOpen={false} gapRight />
            <FormattedMessage
              id="app.editExerciseSimpleConfigTests.compilationTitle"
              defaultMessage="Compilation/Execution"
            />
          </div>
        )}
      </React.Fragment>
    );
  }
}

EditExerciseSimpleConfigTestCompilation.propTypes = {
  exercise: PropTypes.object,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  extraFiles: PropTypes.object,
  jarFiles: PropTypes.object,
  useOutFile: PropTypes.bool,
  useCustomJudge: PropTypes.bool,
  environmentsWithEntryPoints: PropTypes.array.isRequired,
  testErrors: PropTypes.object,
  smartFillCompilation: PropTypes.func,
  change: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(EditExerciseSimpleConfigTestCompilation);
