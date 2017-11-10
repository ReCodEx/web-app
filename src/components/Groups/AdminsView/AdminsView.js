import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';

import Box from '../../widgets/Box';
import AddSupervisor from '../AddSupervisor';
import EditGroupForm from '../../forms/EditGroupForm';
import { getLocalizedName } from '../../../helpers/getLocalizedData';

const AdminsView = ({ group, addSubgroup, formValues, intl: { locale } }) =>
  <div>
    <Row>
      <Col sm={12}>
        <h3>
          <FormattedMessage
            id="app.group.adminsView.title"
            defaultMessage="Administrator controls of {groupName}"
            values={{ groupName: getLocalizedName(group, locale) }}
          />
        </h3>
      </Col>
    </Row>
    <Row>
      <Col md={6}>
        <Box
          title={
            <FormattedMessage
              id="app.group.adminsView.addSupervisor"
              defaultMessage="Add supervisor"
            />
          }
        >
          <AddSupervisor instanceId={group.instanceId} groupId={group.id} />
        </Box>
      </Col>
      <Col md={6}>
        <EditGroupForm
          onSubmit={addSubgroup}
          initialValues={{ publicStats: true }}
          createNew
          collapsable
          isOpen={false}
          formValues={formValues}
        />
      </Col>
    </Row>
  </div>;

AdminsView.propTypes = {
  group: PropTypes.object.isRequired,
  addSubgroup: PropTypes.func.isRequired,
  formValues: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default connect(
  state => {
    return {
      formValues: getFormValues('editGroup')(state)
    };
  },
  dispatch => ({})
)(injectIntl(AdminsView));
