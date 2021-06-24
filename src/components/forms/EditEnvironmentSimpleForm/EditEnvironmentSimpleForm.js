import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Alert, OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import EditEnvironmentList from './EditEnvironmentList';
import SubmitButton from '../SubmitButton';
import Box from '../../widgets/Box';
import Button from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import Icon, { RefreshIcon } from '../../icons';
import { STANDALONE_ENVIRONMENTS } from '../../../helpers/exercise/environments';
import { getConfigVar } from '../../../helpers/config';
import { arrayToObject } from '../../../helpers/common';

const environmentsHelpUrl = getConfigVar('ENVIRONMENTS_INFO_URL');

const preprocessExtensions = ({ extensions, ...rest }) => ({
  ...rest,
  extensions: extensions.replace(/[ [\]]/g, '').split(','),
});
const getSelectedEnvs = defaultMemoize((initialValues, runtimeEnvironments, locale) => {
  const indexed = arrayToObject(runtimeEnvironments);
  return Object.keys(initialValues)
    .filter(env => initialValues[env])
    .map(env => preprocessExtensions(indexed[env]))
    .sort((a, b) => a.longName.localeCompare(b.longName, locale));
});

class EditEnvironmentSimpleForm extends Component {
  state = {
    expanded: false, // toggle button in the upper right corner
  };

  toggleExpanded = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const {
      initialValues,
      dirty,
      submitting,
      reset,
      handleSubmit,
      submitFailed,
      submitSucceeded,
      invalid,
      error,
      runtimeEnvironments,
      readOnly = false,
      intl: { locale },
    } = this.props;

    const selectedEnvs = getSelectedEnvs(initialValues, runtimeEnvironments, locale);

    return (
      <Box
        id="runtimes-form"
        title={
          <FormattedMessage id="app.editExerciseConfig.runtimeEnvironments" defaultMessage="Runtime Environments" />
        }
        unlimitedHeight
        customIcons={
          !readOnly && selectedEnvs.length > 0 ? (
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
        {!readOnly && (this.state.expanded || selectedEnvs.length === 0) ? (
          <>
            {environmentsHelpUrl && (
              <InsetPanel size="sm">
                <div className="small text-muted">
                  <FormattedMessage
                    id="app.editEnvironmentSimpleForm.linkToWiki"
                    defaultMessage="Select all runtime environments the exercise should support. You may find more information about the environments at our <a>wiki page</a>."
                    values={{
                      a: caption => (
                        <a href={environmentsHelpUrl} target="_blank" rel="noreferrer">
                          {caption}
                        </a>
                      ),
                    }}
                  />
                </div>
              </InsetPanel>
            )}

            <EditEnvironmentList runtimeEnvironments={runtimeEnvironments} showExclusive />

            <hr />

            {submitFailed && (
              <Alert variant="danger">
                <FormattedMessage id="generic.savingFailed" defaultMessage="Saving failed. Please try again later." />
              </Alert>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="text-center">
              {dirty && (
                <span>
                  <Button type="reset" onClick={reset} variant={'danger'}>
                    <RefreshIcon gapRight />
                    <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                  </Button>{' '}
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
                  submit: (
                    <FormattedMessage id="app.editEnvironmentSimpleForm.submit" defaultMessage="Save Environments" />
                  ),
                  submitting: (
                    <FormattedMessage
                      id="app.editEnvironmentSimpleForm.submitting"
                      defaultMessage="Saving Environments..."
                    />
                  ),
                  success: (
                    <FormattedMessage id="app.editEnvironmentSimpleForm.success" defaultMessage="Environments Saved." />
                  ),
                }}
              />
            </div>
          </>
        ) : (
          <>
            <Table responsive hover>
              <tbody>
                {selectedEnvs.map(env => (
                  <tr key={env.id}>
                    <td className="text-nowrap">
                      <strong>{env.longName}</strong>
                    </td>
                    <td className="text-muted">{env.description}</td>
                    <td>
                      {env.extensions &&
                        env.extensions.map(ext => (
                          <span key={ext} className="comma-separated">
                            <code>*.{ext}</code>
                          </span>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!readOnly && (
              <div className="text-center text-primary clickable small halfem-margin-top" onClick={this.toggleExpanded}>
                <FormattedMessage id="generic.showAll" defaultMessage="Show All" />
                ...
              </div>
            )}
          </>
        )}
      </Box>
    );
  }
}

EditEnvironmentSimpleForm.propTypes = {
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  error: PropTypes.any,
  initialValues: PropTypes.object,
  runtimeEnvironments: PropTypes.array,
  readOnly: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

const validate = (formData, { runtimeEnvironments }) => {
  const errors = {};
  if (Object.values(formData).length === 0 || runtimeEnvironments.length === 0) {
    return errors; // This is actually a hack (reduxForm fails to re-validate after re-initialization)
  }

  const allowedEnvrionmentsCount = Object.values(formData).filter(value => value === true || value === 'true').length;
  if (allowedEnvrionmentsCount === 0) {
    errors._error = (
      <FormattedMessage
        id="app.editEnvironmentSimpleForm.validation.environments"
        defaultMessage="Please add at least one runtime environment."
      />
    );
  } else if (allowedEnvrionmentsCount > 1) {
    const standaloneEnvs = STANDALONE_ENVIRONMENTS.filter(envId => formData[envId]).map(envId => {
      const env = runtimeEnvironments.find(({ id }) => id === envId);
      return env && env.name;
    });

    if (standaloneEnvs.length > 0) {
      errors._error = (
        <FormattedMessage
          id="app.editEnvironmentSimpleForm.validation.standaloneEnvironmentsCollisions"
          defaultMessage="Some of the selected environments ({envs}) cannot be combined with any other environment. You need to deselect these environment(s) or make sure only one environment is selected."
          values={{ envs: standaloneEnvs.join(', ') }}
        />
      );
    }
  }

  return errors;
};

export default reduxForm({
  form: 'editEnvironmentSimple',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(injectIntl(EditEnvironmentSimpleForm));
