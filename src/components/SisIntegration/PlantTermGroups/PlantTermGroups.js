import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Field, FieldArray, reduxForm } from 'redux-form';
import { defaultMemoize } from 'reselect';

import DeleteGroupButtonContainer from '../../../containers/DeleteGroupButtonContainer';
import LocalizedTextsFormField from '../../forms/LocalizedTextsFormField';
import { TextField, SimpleCheckboxField } from '../../forms/Fields';
import SubmitButton from '../../forms/SubmitButton';
import Button from '../../widgets/TheButton';
import Callout from '../../widgets/Callout';
import Icon, { CloseIcon } from '../../icons';
import { getLocalizedName, validateLocalizedTextsFormData } from '../../../helpers/localizedData';
import { arrayToObject } from '../../../helpers/common';

const SEMESTER_LOCALIZATIONS = {
  1: [
    {
      locale: 'en',
      name: '1-Winter',
      description: 'Winter Term',
    },
    {
      locale: 'cs',
      name: '1-ZS',
      description: 'Zimní semestr',
    },
  ],
  2: [
    {
      locale: 'en',
      name: '2-Summer',
      description: 'Summer Term',
    },
    {
      locale: 'cs',
      name: '2-LS',
      description: 'Letní semestr',
    },
  ],
};

const fullAcademicYear = year =>
  String(year).match(/^[12][0-9]{3}$/) ? `${year}/${Number(String(year).substr(2)) + 1}` : year;

export const createDefaultSemesterLocalization = (year, term) => {
  year = fullAcademicYear(year);
  return SEMESTER_LOCALIZATIONS[term].map(({ locale, name, description }) => ({
    locale,
    name: `${year} ${name}`,
    description: `${description} ${year}`,
  }));
};

const getExistingSemestralGroups = defaultMemoize((groups, rootGroups, externalId) => {
  const result = arrayToObject(
    rootGroups,
    g => g.id,
    () => []
  );
  groups
    .filter(group => group.externalId === externalId)
    .filter(group => result[group.parentGroupId])
    .forEach(group => result[group.parentGroupId].push(group));
  return result;
});

const PlantTermGroups = ({
  isOpen,
  onClose,
  externalId,
  groups,
  rootGroups,
  submitting,
  handleSubmit,
  error,
  onSubmit,
  dirty = false,
  submitFailed = false,
  submitSucceeded = false,
  invalid,
  reset,
  intl: { locale },
}) => {
  const existingSemestralGroups = getExistingSemestralGroups(groups, rootGroups, externalId);

  return (
    <Modal show={isOpen} backdrop="static" onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage id="app.plantSisTerm.title" defaultMessage="Plant Groups for SIS Term" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table>
          <tbody>
            {rootGroups.map(group => (
              <tr key={group.id}>
                <td className="shrink-col text-center">
                  {existingSemestralGroups[group.id].length === 0 ? (
                    <Field name={`groups.${group.id}`} component={SimpleCheckboxField} />
                  ) : (
                    <Icon icon="seedling" className="text-muted half-opaque" />
                  )}
                </td>
                <td>
                  {existingSemestralGroups[group.id].length === 0
                    ? getLocalizedName(group, locale)
                    : existingSemestralGroups[group.id].map(existGroup => (
                        <div key={existGroup.id}>
                          {getLocalizedName(group, locale)} / <strong>{getLocalizedName(existGroup, locale)}</strong>
                        </div>
                      ))}
                </td>
                <td className="shrink-col">
                  {existingSemestralGroups[group.id].map(existGroup => (
                    <DeleteGroupButtonContainer
                      key={existGroup.id}
                      id={existGroup.id}
                      size="xs"
                      disabled={existGroup.childGroups.length > 0}
                    />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <hr />

        <FieldArray name="localizedTexts" component={LocalizedTextsFormField} fieldType="group" />

        <Field
          name="externalId"
          tabIndex={2}
          component={TextField}
          maxLength={255}
          readOnly
          label={
            <FormattedMessage
              id="app.createGroup.externalId"
              defaultMessage="External ID of the group (helps create bindings to external data sources):"
            />
          }
        />

        {submitFailed && (
          <Callout variant="danger">
            <FormattedMessage
              id="app.sisCreateGroupForm.failed"
              defaultMessage="Creating group failed. Please try again later."
            />
          </Callout>
        )}

        {error && <Callout variant="warning">{error}</Callout>}
      </Modal.Body>
      <Modal.Footer>
        <div className="text-center">
          <SubmitButton
            id="plant-sis-term"
            handleSubmit={handleSubmit(data => onSubmit(data).then(reset))}
            submitting={submitting}
            dirty={dirty}
            hasSucceeded={submitSucceeded}
            hasFailed={submitFailed}
            disabled={invalid}
            messages={{
              submit: <FormattedMessage id="app.plantSisTerm.plantGroups" defaultMessage="Plant Groups" />,
              submitting: <FormattedMessage id="app.plantSisTerm.planting" defaultMessage="Planting..." />,
              success: <FormattedMessage id="app.plantSisTerm.planted" defaultMessage="Planted" />,
            }}
          />

          <Button variant="outline-secondary" onClick={onClose}>
            <CloseIcon gapRight />
            <FormattedMessage id="generic.close" defaultMessage="Close" />
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

PlantTermGroups.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  error: PropTypes.object,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  reset: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  externalId: PropTypes.string,
  groups: PropTypes.array.isRequired,
  rootGroups: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
};

const validate = ({ groups, localizedTexts }) => {
  const errors = {};

  if (groups && Object.values(groups).every(group => group === false)) {
    errors._error = (
      <FormattedMessage
        id="app.plantSisTerm.noGroupsSelected"
        defaultMessage="At least one parent group needs to be selected."
      />
    );
  }

  validateLocalizedTextsFormData(errors, localizedTexts, ({ name }) => {
    const textErrors = {};
    if (!name.trim()) {
      textErrors.name = (
        <FormattedMessage
          id="app.editGroupForm.validation.emptyName"
          defaultMessage="Please fill the name of the group."
        />
      );
    }
    return textErrors;
  });

  return errors;
};

export default reduxForm({
  form: 'plant-sis-term',
  enableReinitialize: true,
  keepDirtyOnReinitialize: false,
  validate,
})(injectIntl(PlantTermGroups));
