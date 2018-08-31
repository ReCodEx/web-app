import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Button from '../../widgets/FlatButton';
import Icon, { PipelineIcon } from '../../icons';
import {
  SelectField,
  TextField,
  ExpandingTextField,
  ExpandingSelectField
} from '../Fields';
import Confirm from '../../forms/Confirm';
import { encodeId, safeGet, unique } from '../../../helpers/common';

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
      rawFill
    } = this.props;
    return (
      <tbody>
        <tr>
          <td colSpan={4}>
            <h3>
              {testName}
            </h3>
          </td>
          <td className="shrink-col text-right">
            {Boolean(rawFill) &&
              <Confirm
                id="rawFill-all"
                onConfirmed={rawFill.all}
                question={
                  <FormattedMessage
                    id="app.editExerciseConfigForm.rawFillTest.yesNoQuestion"
                    defaultMessage="Do you really wish to spread all values of this test to every other test?"
                  />
                }
              >
                <Button
                  bsStyle="primary"
                  bsSize="sm"
                  disabled={Boolean(testErrors)}
                >
                  <Icon icon="arrows-alt" gapRight />
                  <FormattedMessage
                    id="app.editExerciseConfigForm.rawFillTest"
                    defaultMessage="Spread Test"
                  />
                </Button>
              </Confirm>}
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
              <td className="shrink-col text-right">
                {Boolean(rawFill) &&
                  <Confirm
                    id={`rawFill-${idx}`}
                    onConfirmed={rawFill.pipeline(idx)}
                    question={
                      <FormattedMessage
                        id="app.editExerciseConfigForm.rawFillPipeline.yesNoQuestion"
                        defaultMessage="Do you really wish to spread all values of this pipeline to every other test?"
                      />
                    }
                  >
                    <Button
                      bsStyle="primary"
                      bsSize="xs"
                      disabled={Boolean(safeGet(testErrors, [idx]))}
                    >
                      <Icon icon="arrows-alt" gapRight />
                      <FormattedMessage
                        id="app.editExerciseConfigForm.rawFillPipeline"
                        defaultMessage="Spread Pipeline"
                      />
                    </Button>
                  </Confirm>}
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
                  <td className="shrink-col text-right">
                    {Boolean(rawFill) &&
                      <Confirm
                        id={`rawFill-${idx}-${name}`}
                        onConfirmed={rawFill.variable(idx, name)}
                        question={
                          <FormattedMessage
                            id="app.editExerciseConfigForm.rawFillVariable.yesNoQuestion"
                            defaultMessage="Do you really wish to spread this value to every other test?"
                          />
                        }
                      >
                        <Button
                          bsStyle="primary"
                          bsSize="xs"
                          disabled={Boolean(
                            safeGet(testErrors, [idx, encodeId(name)])
                          )}
                        >
                          <Icon icon="arrows-alt" gapRight />
                          <FormattedMessage
                            id="app.editExerciseConfigForm.rawFill"
                            defaultMessage="Spread"
                          />
                        </Button>
                      </Confirm>}
                  </td>
                </tr>
              )}
          </React.Fragment>
        )}
      </tbody>
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
  rawFill: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(EditExerciseAdvancedConfigTest);
