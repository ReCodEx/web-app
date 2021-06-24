import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, Alert } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Field, reduxForm } from 'redux-form';

import { SimpleCheckboxField } from '../../forms/Fields';
import SubmitButton from '../../forms/SubmitButton';
import InsetPanel from '../../widgets/InsetPanel';

import Button from '../../widgets/TheButton';
import Icon, { CloseIcon } from '../../icons';

class ArchiveTermGroups extends Component {
  checkAllGroups = () => {
    const { groups, change } = this.props;
    groups.forEach(({ id }) => {
      change(`groups.${id}`, true);
    });
  };

  render() {
    const {
      isOpen,
      onClose,
      externalId,
      groups,
      submitting,
      handleSubmit,
      error,
      onSubmit,
      dirty = false,
      submitFailed = false,
      submitSucceeded = false,
      invalid,
      reset,
    } = this.props;

    return (
      <Modal show={isOpen} backdrop="static" onHide={onClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage id="app.archiveSisTerm.title" defaultMessage="Archive Groups of SIS Term" /> {externalId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {groups.length > 0 ? (
            <Table>
              <tbody>
                {groups.map(({ id, name }) => (
                  <tr key={id}>
                    <td className="shrink-col text-center">
                      <Field name={`groups.${id}`} component={SimpleCheckboxField} />
                    </td>
                    <td>{name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <InsetPanel>
              <FormattedMessage
                id="app.archiveSisTerm.noGroups"
                defaultMessage="There are no groups associated with this semester. Perhaps they have all been archived already."
              />
            </InsetPanel>
          )}

          {submitFailed && (
            <Alert variant="danger">
              <FormattedMessage
                id="app.archiveSisTerm.failed"
                defaultMessage="Archivation failed. Some of the groups may not have been archived."
              />
            </Alert>
          )}

          {error && <div className="callout callout-warning">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center">
            {groups.length > 0 && (
              <>
                <Button variant="primary" onClick={this.checkAllGroups}>
                  <Icon icon={['far', 'check-square']} gapRight />
                  <FormattedMessage id="generic.selectAll" defaultMessage="Select All" />
                </Button>

                <SubmitButton
                  id="archive-sis-term"
                  handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
                  submitting={submitting}
                  dirty={dirty}
                  hasSucceeded={submitSucceeded}
                  hasFailed={submitFailed}
                  disabled={invalid}
                  messages={{
                    submit: <FormattedMessage id="app.archiveSisTerm.archiveGroups" defaultMessage="Archive Groups" />,
                    submitting: <FormattedMessage id="app.archiveSisTerm.archiving" defaultMessage="Archiving..." />,
                    success: <FormattedMessage id="app.archiveSisTerm.archived" defaultMessage="Archived" />,
                  }}
                />
              </>
            )}

            <Button variant="outline-secondary" onClick={onClose}>
              <CloseIcon gapRight />
              <FormattedMessage id="generic.close" defaultMessage="Close" />
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

ArchiveTermGroups.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  error: PropTypes.object,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  change: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  externalId: PropTypes.string,
  groups: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
};

const validate = ({ groups }) => {
  const errors = {};

  if (groups && groups.length > 0 && Object.values(groups).every(group => group === false)) {
    errors._error = (
      <FormattedMessage
        id="app.archiveSisTerm.noGroupsSelected"
        defaultMessage="At least one group needs to be selected."
      />
    );
  }

  return errors;
};

export default reduxForm({
  form: 'archive-sis-term',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(injectIntl(ArchiveTermGroups));
