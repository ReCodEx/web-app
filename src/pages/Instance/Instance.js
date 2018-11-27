import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Box from '../../components/widgets/Box';
import Markdown from '../../components/widgets/Markdown';
import GroupTree from '../../components/Groups/GroupTree';
import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import LicencesTableContainer from '../../containers/LicencesTableContainer';
import AddLicenceFormContainer from '../../containers/AddLicenceFormContainer';
import EditGroupForm, {
  EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES
} from '../../components/forms/EditGroupForm';
import { EditIcon } from '../../components/icons';

import { fetchUser } from '../../redux/modules/users';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import {
  instanceSelector,
  isAdminOfInstance
} from '../../redux/selectors/instances';
import { createGroup, fetchAllGroups } from '../../redux/modules/groups';
import { notArchivedGroupsSelector } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { transformLocalizedTextsFormData } from '../../helpers/localizedData';

import withLinks from '../../helpers/withLinks';

class Instance extends Component {
  static loadAsync = ({ instanceId }, dispatch) =>
    Promise.all([dispatch(fetchInstanceIfNeeded(instanceId))]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.instanceId !== newProps.params.instanceId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      params: { instanceId },
      userId,
      instance,
      groups,
      createGroup,
      isAdmin,
      isSuperAdmin,
      hasThreshold,
      links: { ADMIN_EDIT_INSTANCE_URI_FACTORY }
    } = this.props;

    return (
      <Page
        resource={instance}
        title={instance => instance.name}
        description={
          <FormattedMessage
            id="app.instance.description"
            defaultMessage="Instance overview"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.instance.description" />,
            iconName: 'info-circle'
          }
        ]}
      >
        {data =>
          <div>
            {isSuperAdmin &&
              <Row>
                <Col sm={12} md={6}>
                  <p>
                    <LinkContainer
                      to={ADMIN_EDIT_INSTANCE_URI_FACTORY(instanceId)}
                    >
                      <Button bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.instance.edit"
                          defaultMessage="Edit instance"
                        />
                      </Button>
                    </LinkContainer>
                  </p>
                </Col>
              </Row>}

            <Row>
              <Col sm={12} md={6}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.instance.detailTitle"
                      defaultMessage="Instance Description"
                    />
                  }
                >
                  <Markdown source={data.description} />
                </Box>

                {(isSuperAdmin || isAdmin) &&
                  <React.Fragment>
                    <LicencesTableContainer instance={data} />
                    <AddLicenceFormContainer instanceId={data.id} />
                  </React.Fragment>}
              </Col>
              <Col sm={12} md={6}>
                <Box
                  title={
                    <FormattedMessage
                      id="app.instance.groupsTitle"
                      defaultMessage="Groups Hierarchy"
                    />
                  }
                  extraPadding
                  unlimitedHeight
                >
                  <div>
                    {data.rootGroupId !== null &&
                      <GroupTree
                        id={data.rootGroupId}
                        isAdmin={isSuperAdmin || isAdmin}
                        groups={groups}
                      />}

                    {data.rootGroupId === null &&
                      <FormattedMessage
                        id="app.instance.groups.noGroups"
                        defaultMessage="There are no groups in this ReCodEx instance."
                      />}
                  </div>
                </Box>

                {(isSuperAdmin || isAdmin) &&
                  <EditGroupForm
                    form="addGroup"
                    onSubmit={createGroup(userId)}
                    instanceId={instanceId}
                    initialValues={EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES}
                    createNew
                    collapsable
                    isOpen={false}
                    hasThreshold={hasThreshold}
                    isSuperAdmin={isSuperAdmin}
                  />}
              </Col>
            </Row>
          </div>}
      </Page>
    );
  }
}

Instance.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  params: PropTypes.shape({
    instanceId: PropTypes.string.isRequired
  }).isRequired,
  userId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map,
  createGroup: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  links: PropTypes.object.isRequired,
  hasThreshold: PropTypes.bool
};

const addGroupFormSelector = formValueSelector('addGroup');

export default withLinks(
  connect(
    (state, { params: { instanceId } }) => {
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        instance: instanceSelector(state, instanceId),
        groups: notArchivedGroupsSelector(state),
        isAdmin: isAdminOfInstance(userId, instanceId)(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        hasThreshold: addGroupFormSelector(state, 'hasThreshold')
      };
    },
    (dispatch, { params: { instanceId } }) => ({
      createGroup: userId => ({ localizedTexts, ...data }) =>
        dispatch(
          createGroup({
            ...data,
            localizedTexts: transformLocalizedTextsFormData(localizedTexts),
            instanceId
          })
        ).then(() =>
          Promise.all([dispatch(fetchAllGroups()), dispatch(fetchUser(userId))])
        ),
      loadAsync: () => Instance.loadAsync({ instanceId }, dispatch)
    })
  )(Instance)
);
