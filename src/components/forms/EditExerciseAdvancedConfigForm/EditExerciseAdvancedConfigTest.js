import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Button from '../../widgets/FlatButton';
import { PipelineIcon } from '../../icons';
import {
  SelectField,
  TextField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import Confirm from '../../forms/Confirm';
import {
  EMPTY_ARRAY,
  encodeId,
  safeGet,
  unique
} from '../../../helpers/common';

import styles from './EditExerciseAdvancedConfig.less';

const validateFileName = value =>
  !value || value.trim() === ''
    ? <FormattedMessage
        id="app.editExerciseAdvancedConfigForm.validation.emptyFileName"
        defaultMessage="Please, fill in a vaild file name."
      />
    : undefined;

const prepareFilesOptions = defaultMemoize((supplementaryFiles, locale) => {
  const supplementaryFilesOptions = unique(
    supplementaryFiles.map(({ name }) => name)
  )
    .sort((a, b) => a.localeCompare(b, locale))
    .map(name => ({
      key: name,
      name
    }));
  return supplementaryFilesOptions;
});

class EditExerciseAdvancedConfigTest extends Component {
  createField = (fieldName, type) => {
    const { supplementaryFiles, intl: { locale } } = this.props;
    // TODO replace this ugly switch with something worthy of the author...
    switch (type) {
      case 'string':
      case 'file':
        return (
          <Field
            name={fieldName}
            component={TextField}
            validate={type === 'file' ? validateFileName : undefined}
            maxLength={64}
          />
        );

      case 'string[]':
      case 'file[]':
        return (
          <FieldArray
            name={fieldName}
            component={ExpandingTextField}
            maxLength={64}
            validateEach={type === 'file[]' ? validateFileName : undefined}
          />
        );

      case 'remote-file':
        return (
          <Field
            name={fieldName}
            component={SelectField}
            options={prepareFilesOptions(supplementaryFiles, locale)}
            addEmptyOption
          />
        );

      case 'remote-file[]':
        return (
          <FieldArray
            name={fieldName}
            component={ExpandingSelectField}
            options={prepareFilesOptions(supplementaryFiles, locale)}
            addEmptyOption
          />
        );
    }
    return null;
  };

  render() {
    const {
      pipelines,
      pipelinesVariables,
      testName,
      test,
      testErrors,
      smartFill
    } = this.props;
    return (
      <tbody>
        <tr>
          <td colSpan={4}>
            <h3>
              {testName}
            </h3>
          </td>
        </tr>
        {Object.values(
          pipelinesVariables
        ).map(({ id: pipelineId, variables }, idx) =>
          <React.Fragment key={idx}>
            <tr className={styles.pipelineName}>
              <td colSpan={4}>
                <h5>
                  <PipelineIcon gapRight />
                  {safeGet(pipelines, [({ id }) => id === pipelineId, 'name'])}
                </h5>
              </td>
            </tr>

            {variables
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(({ name, type }) =>
                <tr key={name}>
                  <td className="shrink-col text-nowrap">
                    {name}
                  </td>
                  <td className="shrink-col text-nowrap">
                    <code>
                      {type}
                    </code>
                  </td>
                  <td>
                    {this.createField(
                      `${test}[${idx}].${encodeId(name)}`,
                      type
                    )}
                  </td>
                  <td className="text-muted small">
                    {/* TODO -- description once additional metadata are added to pipelines */}
                  </td>
                  {/* TODO -- Smart fill buttons */}
                </tr>
              )}
          </React.Fragment>
        )}
      </tbody>

      /*
              Boolean(smartFill) &&
              <div className="smart-fill-tinybar">
                <Confirm
                  id="smartFillJudge"
                  onConfirmed={smartFill.judge}
                  question={
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillJudge.yesNoQuestion"
                      defaultMessage="Do you really wish to overwrite judge configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
                    />
                  }
                >
                  <Button
                    bsStyle={'primary'}
                    className="btn-flat"
                    bsSize="xs"
                    disabled={Boolean(testErrors)}
                  >
                    <Icon icon="arrows-alt" gapRight />
                    <FormattedMessage
                      id="app.editExerciseConfigForm.smartFillJudge"
                      defaultMessage="Smart Fill Judges"
                    />
                  </Button>
                </Confirm>
              </div>
                */
    );
  }
}

EditExerciseAdvancedConfigTest.propTypes = {
  testName: PropTypes.string.isRequired,
  test: PropTypes.string.isRequired,
  supplementaryFiles: PropTypes.array.isRequired,
  exerciseTests: PropTypes.array,
  pipelines: PropTypes.array.isRequired,
  pipelinesVariables: PropTypes.array,
  testErrors: PropTypes.array,
  smartFill: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(EditExerciseAdvancedConfigTest);
