import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import { FormattedMessage, injectIntl, defineMessages, intlShape } from 'react-intl';

import Button from '../../widgets/FlatButton';
import Icon from '../../icons';
import { SelectField, ExpandingTextField, CheckboxField } from '../Fields';
import Confirm from '../../forms/Confirm';

const messages = defineMessages({
  normal: {
    id: 'recovid-judge-normal',
    defaultMessage: 'Token judge',
  },
  float: {
    id: 'recovid-judge-float',
    defaultMessage: 'Float-numbers judge',
  },
  normalNewline: {
    id: 'recovid-judge-normal-newline',
    defaultMessage: 'Token judge (ignoring ends of lines)',
  },
  floatNewline: {
    id: 'recovid-judge-float-newline',
    defaultMessage: 'Float-numbers judge (ignoring ends of lines)',
  },
  shuffle: {
    id: 'recovid-judge-shuffle',
    defaultMessage: 'Unordered-tokens judge',
  },
  shuffleRows: {
    id: 'recovid-judge-shuffle-rows',
    defaultMessage: 'Unordered-rows judge',
  },
  shuffleAll: {
    id: 'recovid-judge-shuffle-all',
    defaultMessage: 'Unordered-tokens-and-rows judge',
  },
  shuffleNewline: {
    id: 'recovid-judge-shuffle-newline',
    defaultMessage: 'Unordered-tokens judge (ignoring ends of lines)',
  },
  diff: {
    id: 'diff',
    defaultMessage: 'Binary-safe judge',
  },
});

const validateCustomJudge = value =>
  !value || value.trim() === '' ? (
    <FormattedMessage
      id="app.editExerciseSimpleConfigForm.validation.customJudge"
      defaultMessage="Please, select the custom judge binary for this test or use one of the standard judges instead."
    />
  ) : (
    undefined
  );

const EditExerciseSimpleConfigTestJudge = ({
  smartFillJudge,
  supplementaryFiles,
  test,
  testErrors,
  useCustomJudge,
  showBuiltins = true,
  showJudgeArgs = true,
  intl,
}) => (
  <React.Fragment>
    <h4>
      <FormattedMessage id="app.editExerciseSimpleConfigTests.judgeTitle" defaultMessage="Judge" />
    </h4>

    {showBuiltins && (
      <Field
        name={`${test}.useCustomJudge`}
        component={CheckboxField}
        onOff
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.useCustomJudge"
            defaultMessage="Use custom judge binary"
          />
        }
      />
    )}

    {useCustomJudge || !showBuiltins ? (
      <Field
        name={`${test}.custom-judge`}
        component={SelectField}
        options={supplementaryFiles}
        addEmptyOption={true}
        validate={validateCustomJudge}
        label={
          <FormattedMessage
            id="app.editExerciseSimpleConfigTests.customJudgeBinary"
            defaultMessage="Custom judge executable:"
          />
        }
      />
    ) : (
      <Field
        name={`${test}.judge-type`}
        component={SelectField}
        options={[
          {
            key: 'recovid-judge-normal',
            name: intl.formatMessage(messages.normal),
          },
          {
            key: 'recovid-judge-float',
            name: intl.formatMessage(messages.float),
          },
          {
            key: 'recovid-judge-normal-newline',
            name: intl.formatMessage(messages.normalNewline),
          },
          {
            key: 'recovid-judge-float-newline',
            name: intl.formatMessage(messages.floatNewline),
          },
          {
            key: 'recovid-judge-shuffle',
            name: intl.formatMessage(messages.shuffle),
          },
          {
            key: 'recovid-judge-shuffle-rows',
            name: intl.formatMessage(messages.shuffleRows),
          },
          {
            key: 'recovid-judge-shuffle-all',
            name: intl.formatMessage(messages.shuffleAll),
          },
          {
            key: 'recovid-judge-shuffle-newline',
            name: intl.formatMessage(messages.shuffleNewline),
          },
          {
            key: 'diff',
            name: intl.formatMessage(messages.diff),
          },
        ]}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.judgeType" defaultMessage="Judge:" />}
      />
    )}

    {(useCustomJudge || !showBuiltins) && showJudgeArgs && (
      <FieldArray
        name={`${test}.judge-args`}
        component={ExpandingTextField}
        maxLength={64}
        label={<FormattedMessage id="app.editExerciseSimpleConfigTests.judgeArgs" defaultMessage="Judge arguments:" />}
      />
    )}

    {Boolean(smartFillJudge) && (
      <div className="smart-fill-tinybar">
        <Confirm
          id="smartFillJudge"
          onConfirmed={smartFillJudge}
          question={
            <FormattedMessage
              id="app.editExerciseConfigForm.smartFillJudge.yesNoQuestion"
              defaultMessage="Do you really wish to overwrite judge configuration of all subsequent tests using the first test as a template? Files will be paired to individual test configurations by a heuristics based on matching name substrings."
            />
          }>
          <Button bsStyle={'primary'} className="btn-flat" bsSize="xs" disabled={Boolean(testErrors)}>
            <Icon icon="arrows-alt" gapRight />
            <FormattedMessage id="app.editExerciseConfigForm.smartFillJudge" defaultMessage="Smart Fill Judges" />
          </Button>
        </Confirm>
      </div>
    )}
  </React.Fragment>
);

EditExerciseSimpleConfigTestJudge.propTypes = {
  smartFillJudge: PropTypes.func,
  supplementaryFiles: PropTypes.array.isRequired,
  test: PropTypes.string.isRequired,
  testErrors: PropTypes.object,
  useCustomJudge: PropTypes.bool,
  showBuiltins: PropTypes.bool,
  showJudgeArgs: PropTypes.bool,
  onlyCustomJudge: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(EditExerciseSimpleConfigTestJudge);
