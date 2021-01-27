import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { defaultMemoize } from 'reselect';

import Box from '../../components/widgets/Box';
import GroupTree from '../../components/Groups/GroupTree';
import Button from '../../components/widgets/FlatButton';
import Page from '../../components/layout/Page';
import LicencesTableContainer from '../../containers/LicencesTableContainer';
import AddLicenceFormContainer from '../../containers/AddLicenceFormContainer';
import EditGroupForm, { EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES } from '../../components/forms/EditGroupForm';
import { EditIcon } from '../../components/icons';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';

import { fetchUser } from '../../redux/modules/users';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector, isAdminOfInstance } from '../../redux/selectors/instances';
import { createGroup, fetchAllGroups } from '../../redux/modules/groups';
import { notArchivedGroupsSelector, fetchManyGroupsStatus } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { transformLocalizedTextsFormData, getLocalizedName } from '../../helpers/localizedData';
import { resourceStatus } from '../../redux/helpers/resourceManager';

import withLinks from '../../helpers/withLinks';
import InstanceInfoTable from '../../components/Instances/InstanceDetail/InstanceInfoTable';

const anyGroupVisible = defaultMemoize(groups =>
  Boolean(groups.size > 0 && groups.find(group => group.getIn(['data', 'permissionHints', 'viewDetail'])))
);

class Instance extends Component {
  static loadAsync = ({ instanceId, fetchGroupsStatus = null }, dispatch) => {
    const promises = [dispatch(fetchInstanceIfNeeded(instanceId))];
    if (fetchGroupsStatus === resourceStatus.FAILED) {
      promises.push(dispatch(fetchAllGroups()));
    }
    return Promise.all(promises);
  };

  componentDidMount = () => this.props.loadAsync(this.props.fetchGroupsStatus);

  componentDidUpdate(prevProps) {
    if (this.props.match.params.instanceId !== prevProps.match.params.instanceId) {
      this.props.loadAsync(this.props.fetchGroupsStatus);
    }
  }

  render() {
    const {
      match: {
        params: { instanceId },
      },
      userId,
      instance,
      groups,
      fetchGroupsStatus,
      createGroup,
      isAdmin,
      isSuperAdmin,
      hasThreshold,
      links: { ADMIN_EDIT_INSTANCE_URI_FACTORY },
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={instance}
        title={instance => getLocalizedName(instance.rootGroup, locale)}
        description={<FormattedMessage id="app.instance.description" defaultMessage="Instance overview" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.instance.description" />,
            iconName: 'info-circle',
          },
        ]}>
        {data => (
          <div>
            {isSuperAdmin && (
              <Row>
                <Col sm={12} md={6}>
                  <p>
                    <LinkContainer to={ADMIN_EDIT_INSTANCE_URI_FACTORY(instanceId)}>
                      <Button bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage id="app.instance.edit" defaultMessage="Edit instance" />
                      </Button>
                    </LinkContainer>
                  </p>
                </Col>
              </Row>
            )}

            <Row>
              <Col sm={12} md={6}>
                <InstanceInfoTable instance={data} locale={locale} />

                {(isSuperAdmin || isAdmin) && (
                  <React.Fragment>
                    <LicencesTableContainer instance={data} />
                    <AddLicenceFormContainer instanceId={data.id} />
                  </React.Fragment>
                )}
              </Col>
              <Col sm={12} md={6}>
                <Box
                  title={<FormattedMessage id="app.instance.groupsTitle" defaultMessage="Groups Hierarchy" />}
                  extraPadding
                  unlimitedHeight>
                  <div>
                    {data.rootGroupId !== null && (
                      <FetchManyResourceRenderer fetchManyStatus={fetchGroupsStatus}>
                        {() =>
                          anyGroupVisible(groups) ? (
                            <GroupTree id={data.rootGroupId} isAdmin={isSuperAdmin || isAdmin} groups={groups} />
                          ) : (
                            <FormattedMessage
                              id="app.instance.groups.noGroups"
                              defaultMessage="There are no groups in this ReCodEx instance currently visible to you."
                            />
                          )
                        }
                      </FetchManyResourceRenderer>
                    )}

                    {data.rootGroupId === null && (
                      <FormattedMessage
                        id="app.instance.groups.noGroups"
                        defaultMessage="There are no groups in this ReCodEx instance currently visible to you."
                      />
                    )}
                  </div>
                </Box>

                {(isSuperAdmin || isAdmin) && (
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
                  />
                )}
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

Instance.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      instanceId: PropTypes.string.isRequired,
    }),
  }).isRequired,
  userId: PropTypes.string.isRequired,
  instance: ImmutablePropTypes.map,
  groups: ImmutablePropTypes.map,
  fetchGroupsStatus: PropTypes.string,
  createGroup: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  links: PropTypes.object.isRequired,
  hasThreshold: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

const addGroupFormSelector = formValueSelector('addGroup');

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { instanceId },
        },
      }
    ) => {
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        instance: instanceSelector(state, instanceId),
        groups: notArchivedGroupsSelector(state),
        fetchGroupsStatus: fetchManyGroupsStatus(state),
        isAdmin: isAdminOfInstance(userId, instanceId)(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        hasThreshold: addGroupFormSelector(state, 'hasThreshold'),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { instanceId },
        },
      }
    ) => ({
      createGroup: userId => ({ localizedTexts, hasThreshold, threshold, makeMeAdmin, ...data }) =>
        dispatch(
          createGroup({
            ...data,
            hasThreshold,
            threshold: hasThreshold ? threshold : undefined,
            localizedTexts: transformLocalizedTextsFormData(localizedTexts),
            noAdmin: !makeMeAdmin, // inverted logic in API, user is added as admin by default
            instanceId,
          })
        ).then(() => Promise.all([dispatch(fetchAllGroups()), dispatch(fetchUser(userId))])),
      loadAsync: fetchGroupsStatus => Instance.loadAsync({ instanceId, fetchGroupsStatus }, dispatch),
    })
  )(injectIntl(Instance))
);
