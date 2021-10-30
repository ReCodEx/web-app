import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Box from '../../components/widgets/Box';
import GroupsTreeContainer from '../../containers/GroupsTreeContainer';
import Button from '../../components/widgets/TheButton';
import Page from '../../components/layout/Page';
import LicencesTableContainer from '../../containers/LicencesTableContainer';
import AddLicenceFormContainer from '../../containers/AddLicenceFormContainer';
import EditGroupForm, { EDIT_GROUP_FORM_EMPTY_INITIAL_VALUES } from '../../components/forms/EditGroupForm';
import { EditIcon, InstanceIcon } from '../../components/icons';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import NotVerifiedEmailCallout from '../../components/Users/NotVerifiedEmailCallout';

import { fetchUser, fetchByIds } from '../../redux/modules/users';
import { fetchInstanceIfNeeded } from '../../redux/modules/instances';
import { instanceSelector, isAdminOfInstance } from '../../redux/selectors/instances';
import { createGroup, fetchAllGroups } from '../../redux/modules/groups';
import { fetchManyGroupsStatus, getGroupsAdmins } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isLoggedAsSuperAdmin, getUser } from '../../redux/selectors/users';
import { transformLocalizedTextsFormData, getLocalizedName } from '../../helpers/localizedData';

import withLinks from '../../helpers/withLinks';
import InstanceInfoTable from '../../components/Instances/InstanceDetail/InstanceInfoTable';

class Instance extends Component {
  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  static loadAsync = ({ instanceId }, dispatch) =>
    Promise.all([
      dispatch(fetchInstanceIfNeeded(instanceId)),
      dispatch(fetchAllGroups({ archived: true })).then(({ value: groups }) =>
        dispatch(fetchByIds(getGroupsAdmins(groups)))
      ),
    ]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.instanceId !== prevProps.match.params.instanceId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      match: {
        params: { instanceId },
      },
      userId,
      user,
      refreshUser,
      instance,
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
        icon={<InstanceIcon />}
        title={instance => (
          <FormattedMessage
            id="app.instance.title"
            defaultMessage="{name}: Instance Overview and Groups List"
            values={{ name: getLocalizedName(instance.rootGroup, locale) }}
          />
        )}
        windowTitle={instance => getLocalizedName(instance.rootGroup, locale)}>
        {data => (
          <div>
            <ResourceRenderer resource={user} hiddenUntilReady>
              {user =>
                user &&
                !user.isVerified && <NotVerifiedEmailCallout userId={userId} refreshUser={() => refreshUser(userId)} />
              }
            </ResourceRenderer>

            {isSuperAdmin && (
              <Row>
                <Col sm={12} md={6}>
                  <p>
                    <Link to={ADMIN_EDIT_INSTANCE_URI_FACTORY(instanceId)}>
                      <Button variant="warning">
                        <EditIcon gapRight />
                        <FormattedMessage id="app.instance.edit" defaultMessage="Edit instance" />
                      </Button>
                    </Link>
                  </p>
                </Col>
              </Row>
            )}

            <Row>
              <Col sm={12} md={6}>
                <InstanceInfoTable instance={data} locale={locale} />

                {(isSuperAdmin || isAdmin) && (
                  <>
                    <LicencesTableContainer instance={data} />
                    <AddLicenceFormContainer instanceId={data.id} />
                  </>
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
                        {() => <GroupsTreeContainer />}
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
  refreshUser: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      instanceId: PropTypes.string.isRequired,
    }),
  }).isRequired,
  userId: PropTypes.string.isRequired,
  user: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
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
        user: getUser(userId)(state),
        instance: instanceSelector(state, instanceId),
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
      createGroup:
        userId =>
        ({ localizedTexts, hasThreshold, threshold, makeMeAdmin, ...data }) =>
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
      loadAsync: () => Instance.loadAsync({ instanceId }, dispatch),
      refreshUser: userId => dispatch(fetchUser(userId)),
    })
  )(injectIntl(Instance))
);
