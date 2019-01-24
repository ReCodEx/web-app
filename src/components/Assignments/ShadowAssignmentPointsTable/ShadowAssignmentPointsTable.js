import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import { Table, Modal } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';
import moment from 'moment';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import EditShadowAssignmentPointsForm from '../../forms/EditShadowAssignmentPointsForm';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/FlatButton';
import Confirm from '../../forms/Confirm';
import Icon, { EditIcon, DeleteIcon } from '../../icons';
import { createUserNameComparator } from '../../helpers/users';
import { arrayToObject, safeGet } from '../../../helpers/common';

//

class ShadowAssignmentPointsTable extends Component {
  state = { dialogOpen: false, dialogStudentId: null, dialogPointsId: null };

  openDialog = (studentId, pointsId = null) =>
    this.setState({
      dialogOpen: true,
      dialogStudentId: studentId,
      dialogPointsId: pointsId
    });

  closeDialog = () => this.setState({ dialogOpen: false });

  getPointsFormInitialValues = defaultMemoize((awardeeId, pointsId) => {
    const studentPoints =
      pointsId && this.props.points.find(({ id }) => id === pointsId);
    return studentPoints === null
      ? {
          pointsId: null,
          awardeeId,
          points: 0,
          awardedAt: moment().startOf('minute'),
          note: ''
        }
      : {
          pointsId,
          points: studentPoints.points,
          awardedAt: moment.unix(studentPoints.awardedAt),
          note: studentPoints.note
        };
  });

  submitPointsForm = ({ pointsId, awardedAt, ...formData }) => {
    const { createPoints, updatePoints } = this.props;
    const promise =
      pointsId === null
        ? createPoints({
            awardedAt: moment(awardedAt).unix(),
            ...formData
          })
        : updatePoints({
            pointsId,
            awardedAt: moment(awardedAt).unix(),
            ...formData
          });
    return promise.then(this.closeDialog);
  };

  removePoints = pointsId => {
    const { removePoints } = this.props;
    return removePoints(pointsId);
  };

  render() {
    const {
      students,
      points,
      permissionHints,
      maxPoints,
      intl: { locale }
    } = this.props;
    const studentPoints = arrayToObject(points, ({ awardeeId }) => awardeeId);
    const nameComparator = createUserNameComparator(locale);

    return (
      <Box
        title={
          <FormattedMessage
            id="app.shadowAssignmentPointsTable.title"
            defaultMessage="Shadow Assignment Points"
          />
        }
        collapsable
        isOpen
        noPadding
        unlimitedHeight
      >
        <React.Fragment>
          <Table responsive hover>
            <thead>
              <tr>
                <th>
                  <FormattedMessage
                    id="app.shadowAssignmentPointsTable.user"
                    defaultMessage="User"
                  />
                </th>
                <th className="text-center text-nowrap">
                  <FormattedMessage
                    id="app.shadowAssignmentPointsTable.receivedPoints"
                    defaultMessage="Points"
                  />
                </th>
                <th className="text-nowrap">
                  <FormattedMessage
                    id="app.shadowAssignmentPointsTable.awardedAt"
                    defaultMessage="Awarded At"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.shadowAssignmentPointsTable.note"
                    defaultMessage="Note"
                  />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {students.sort(nameComparator).map(student => {
                const points = safeGet(
                  studentPoints,
                  [student.id, 'points'],
                  null
                );
                const pointsId = safeGet(
                  studentPoints,
                  [student.id, 'id'],
                  null
                );
                const awardedAt = safeGet(
                  studentPoints,
                  [student.id, 'awardedAt'],
                  null
                );
                return (
                  <tr key={student.id}>
                    <td className="text-nowrap">
                      <UsersNameContainer
                        userId={student.id}
                        showEmail="icon"
                      />
                    </td>
                    <td className="text-center text-nowrap">
                      {points !== null ? points : <span>&mdash;</span>}
                    </td>
                    <td>
                      {awardedAt &&
                        <DateTime unixts={awardedAt} showRelative />}
                    </td>
                    <td>
                      {safeGet(studentPoints, [student.id, 'note'], null)}
                    </td>
                    {points === null
                      ? <td className="shrink-col text-nowrap text-right">
                          {permissionHints.createPoints &&
                            <Button
                              bsStyle="success"
                              onClick={() => this.openDialog(student.id)}
                              bsSize="xs"
                            >
                              <Icon gapRight icon={['far', 'star']} />
                              <FormattedMessage
                                id="app.shadowAssignmentPointsTable.createPointsButton"
                                defaultMessage="Award Points"
                              />
                            </Button>}
                        </td>
                      : <td className="shrink-col text-nowrap text-right">
                          {permissionHints.updatePoints &&
                            <Button
                              bsStyle="warning"
                              onClick={() =>
                                this.openDialog(student.id, pointsId)}
                              bsSize="xs"
                            >
                              <EditIcon gapRight />
                              <FormattedMessage
                                id="app.shadowAssignmentPointsTable.updatePointsButton"
                                defaultMessage="Edit"
                              />
                            </Button>}

                          {permissionHints.removePoints &&
                            <Confirm
                              id={`remove-${pointsId}`}
                              onConfirmed={() => this.removePoints(pointsId)}
                              question={
                                <FormattedMessage
                                  id="app.shadowAssignmentPointsTable.removePointsButtonConfirmation"
                                  defaultMessage="Do you really wish to remove awarded points?"
                                />
                              }
                            >
                              <Button bsStyle="danger" bsSize="xs">
                                <DeleteIcon gapRight />
                                <FormattedMessage
                                  id="app.shadowAssignmentPointsTable.removePointsButton"
                                  defaultMessage="Remove"
                                />
                              </Button>
                            </Confirm>}
                        </td>}
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Modal
            show={this.state.dialogOpen}
            backdrop="static"
            onHide={this.closeDialog}
            bsSize="large"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage
                  id="app.shadowAssignmentPointsTable.formModalTitle"
                  defaultMessage="Set Shadow Assignment Points"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <UsersNameContainer
                userId={this.state.dialogStudentId}
                showEmail="icon"
                large
              />
              <hr />
              <EditShadowAssignmentPointsForm
                initialValues={this.getPointsFormInitialValues(
                  this.state.dialogStudentId,
                  this.state.dialogPointsId
                )}
                onSubmit={this.submitPointsForm}
                maxPoints={maxPoints}
              />
            </Modal.Body>
          </Modal>
        </React.Fragment>
      </Box>
    );
  }
}

ShadowAssignmentPointsTable.propTypes = {
  students: PropTypes.array.isRequired,
  points: PropTypes.array.isRequired,
  permissionHints: PropTypes.object.isRequired,
  maxPoints: PropTypes.number.isRequired,
  createPoints: PropTypes.func.isRequired,
  updatePoints: PropTypes.func.isRequired,
  removePoints: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(ShadowAssignmentPointsTable);
