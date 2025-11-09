import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import { Container, Row, Col, Table, Modal } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import EditShadowAssignmentPointsForm, {
  getPointsFormInitialValues,
  transformPointsFormSubmitData,
} from '../../forms/EditShadowAssignmentPointsForm';
import Box from '../../widgets/Box';
import Callout from '../../widgets/Callout';
import { TextField, NumericTextField, SimpleCheckboxField } from '../../forms/Fields';
import SubmitButton from '../../forms/SubmitButton';
import DateTime from '../../widgets/DateTime';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Confirm from '../../forms/Confirm';
import Icon, { BanIcon, EditIcon, DeleteIcon, SquareIcon } from '../../icons';
import { createUserNameComparator } from '../../helpers/users.js';
import { arrayToObject, safeGet } from '../../../helpers/common.js';
import withLinks from '../../../helpers/withLinks.js';

class ShadowAssignmentPointsTable extends Component {
  state = { dialogStudentId: null, dialogPointsId: null, multiAwardMode: false };

  toggleMultiAwardMode = () => {
    this.setState({ multiAwardMode: !this.state.multiAwardMode });
  };

  openDialog = (studentId, pointsId = null) =>
    this.setState({
      dialogOpen: true,
      dialogStudentId: studentId,
      dialogPointsId: pointsId,
    });

  closeDialog = () => {
    this.setState({ dialogOpen: false });
    return Promise.resolve();
  };

  submitPointsForm = formData => {
    const { setPoints } = this.props;
    return setPoints(transformPointsFormSubmitData(formData)).then(this.closeDialog);
  };

  removePoints = (pointsId, awardeeId) => {
    const { removePoints } = this.props;
    return removePoints(pointsId, awardeeId);
  };

  render() {
    const {
      groupId,
      students,
      points,
      permissionHints,
      maxPoints,
      submitting,
      handleSubmit,
      onSubmit,
      dirty,
      submitFailed = false,
      submitSucceeded = false,
      invalid,
      warning,
      intl: { locale },
      links: { GROUP_USER_SOLUTIONS_URI_FACTORY },
    } = this.props;
    const studentPoints = arrayToObject(points, ({ awardeeId }) => awardeeId);
    const nameComparator = createUserNameComparator(locale);

    return (
      <Box
        title={
          <FormattedMessage id="app.shadowAssignmentPointsTable.title" defaultMessage="Shadow Assignment Points" />
        }
        isOpen
        noPadding
        unlimitedHeight
        footer={
          permissionHints.createPoints ? (
            this.state.multiAwardMode ? (
              <>
                <Container fluid>
                  <Row>
                    <Col>
                      <NumericTextField
                        name="points"
                        maxLength={6}
                        validateMin={-10000}
                        validateMax={10000}
                        ignoreDirty
                        label={
                          <FormattedMessage id="app.editShadowAssignmentPointsForm.points" defaultMessage="Points:" />
                        }
                      />
                    </Col>

                    <Col lg={9}>
                      <Field
                        name="note"
                        component={TextField}
                        maxLength={1024}
                        ignoreDirty
                        label={<FormattedMessage id="app.editShadowAssignmentPointsForm.note" defaultMessage="Note:" />}
                      />
                    </Col>
                  </Row>

                  {warning && (
                    <Row>
                      <Col xl={12}>
                        <Callout variant="warning">{warning}</Callout>
                      </Col>
                    </Row>
                  )}
                </Container>

                <div className="text-center text-nowrap mb-1">
                  <TheButtonGroup>
                    <SubmitButton
                      id="multi-assign-form"
                      handleSubmit={handleSubmit(data => onSubmit(data).then(this.toggleMultiAwardMode))}
                      submitting={submitting}
                      dirty={dirty}
                      hasSucceeded={submitSucceeded}
                      hasFailed={submitFailed}
                      invalid={invalid}
                      messages={{
                        submit: <FormattedMessage id="generic.save" defaultMessage="Save" />,
                        submitting: <FormattedMessage id="generic.saving" defaultMessage="Saving..." />,
                        success: <FormattedMessage id="generic.saved" defaultMessage="Saved" />,
                      }}
                    />
                    <Button variant="danger" onClick={this.toggleMultiAwardMode}>
                      <BanIcon gapRight={2} />
                      <FormattedMessage id="generic.cancel" defaultMessage="Cancel" />
                    </Button>
                  </TheButtonGroup>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Button variant="primary" onClick={this.toggleMultiAwardMode}>
                  <SquareIcon gapRight={2} checked />
                  <FormattedMessage
                    id="app.shadowAssignmentPointsTable.multiAwardButton"
                    defaultMessage="Award Points Collectively"
                  />
                </Button>
              </div>
            )
          ) : null
        }>
        <>
          <Table hover className="mb-0">
            <thead>
              <tr>
                {this.state.multiAwardMode && <th />}
                <th>
                  <FormattedMessage id="app.shadowAssignmentPointsTable.user" defaultMessage="User" />
                </th>
                <th className="text-center text-nowrap">
                  <FormattedMessage id="app.shadowAssignmentPointsTable.receivedPoints" defaultMessage="Points" />
                </th>
                <th className="text-nowrap">
                  <FormattedMessage id="app.shadowAssignmentPointsTable.awardedAt" defaultMessage="Awarded At" />
                </th>
                <th>
                  <FormattedMessage id="app.shadowAssignmentPointsTable.note" defaultMessage="Note" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {students.sort(nameComparator).map(student => {
                const points = safeGet(studentPoints, [student.id, 'points'], null);
                const pointsId = safeGet(studentPoints, [student.id, 'id'], null);
                const awardedAt = safeGet(studentPoints, [student.id, 'awardedAt'], null);
                return (
                  <tr key={student.id}>
                    {this.state.multiAwardMode && (
                      <td className="shrink-col">
                        {points === null && permissionHints.createPoints && (
                          <Field name={`students.${student.id}`} component={SimpleCheckboxField} />
                        )}
                      </td>
                    )}
                    <td className="text-nowrap">
                      <UsersNameContainer
                        userId={student.id}
                        showEmail="icon"
                        link={GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, student.id)}
                        listItem
                      />
                    </td>
                    <td className="text-center text-nowrap">{points !== null ? points : <span>&mdash;</span>}</td>
                    <td>{awardedAt && <DateTime unixTs={awardedAt} showRelative />}</td>
                    <td>{safeGet(studentPoints, [student.id, 'note'], null)}</td>
                    <td className="shrink-col text-nowrap text-end">
                      {points === null ? (
                        permissionHints.createPoints && (
                          <Button variant="success" onClick={() => this.openDialog(student.id)} size="xs">
                            <Icon gapRight={2} icon={['far', 'star']} />
                            <FormattedMessage
                              id="app.shadowAssignmentPointsTable.createPointsButton"
                              defaultMessage="Award Points"
                            />
                          </Button>
                        )
                      ) : (
                        <TheButtonGroup>
                          {permissionHints.updatePoints && (
                            <Button variant="warning" onClick={() => this.openDialog(student.id, pointsId)} size="xs">
                              <EditIcon gapRight={2} />
                              <FormattedMessage
                                id="app.shadowAssignmentPointsTable.updatePointsButton"
                                defaultMessage="Edit"
                              />
                            </Button>
                          )}

                          {permissionHints.removePoints && (
                            <Confirm
                              id={`remove-${pointsId}`}
                              onConfirmed={() => this.removePoints(pointsId, student.id)}
                              question={
                                <FormattedMessage
                                  id="app.shadowAssignmentPointsTable.removePointsButtonConfirmation"
                                  defaultMessage="Do you really wish to remove awarded points?"
                                />
                              }>
                              <Button variant="danger" size="xs">
                                <DeleteIcon gapRight={2} />
                                <FormattedMessage id="generic.remove" defaultMessage="Remove" />
                              </Button>
                            </Confirm>
                          )}
                        </TheButtonGroup>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.shadowAssignmentPointsTable.formModalTitle"
                  defaultMessage="Set Shadow Assignment Points"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <UsersNameContainer userId={this.state.dialogStudentId} showEmail="icon" large />
              <hr />
              <EditShadowAssignmentPointsForm
                initialValues={getPointsFormInitialValues(
                  this.state.dialogPointsId && this.props.points.find(({ id }) => id === this.state.dialogPointsId),
                  this.state.dialogStudentId
                )}
                onSubmit={this.submitPointsForm}
                maxPoints={maxPoints}
              />
            </Modal.Body>
          </Modal>
        </>
      </Box>
    );
  }
}

ShadowAssignmentPointsTable.propTypes = {
  groupId: PropTypes.string.isRequired,
  students: PropTypes.array.isRequired,
  points: PropTypes.array.isRequired,
  permissionHints: PropTypes.object.isRequired,
  maxPoints: PropTypes.number.isRequired,
  setPoints: PropTypes.func.isRequired,
  removePoints: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitFailed: PropTypes.bool,
  dirty: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  warning: PropTypes.any,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object,
};

const warn = ({ points }, { maxPoints }) => {
  const warnings = {};

  if (maxPoints > 0) {
    if (points > maxPoints || points < 0) {
      warnings._warning = (
        <FormattedMessage
          id="app.editShadowAssignmentPointsForm.validation.pointsOutOfRange"
          defaultMessage="Points are out of regular range. Regular score for this assignment is between 0 and {maxPoints}."
          values={{ maxPoints }}
        />
      );
    }
  }

  return warnings;
};

export default withLinks(
  reduxForm({
    form: 'multi-assign-form',
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    warn,
  })(injectIntl(ShadowAssignmentPointsTable))
);
