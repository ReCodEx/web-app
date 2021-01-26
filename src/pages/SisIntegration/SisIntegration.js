import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

import Page from '../../components/layout/Page';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import SisIntegrationContainer from '../../containers/SisIntegrationContainer';
import SisSupervisorGroupsContainer from '../../containers/SisSupervisorGroupsContainer';
import AddSisTermForm from '../../components/forms/AddSisTermForm/AddSisTermForm';
import TermsList from '../../components/SisIntegration/TermsList/TermsList';
import Confirm from '../../components/forms/Confirm';
import Icon, { ArchiveGroupIcon, EditIcon, DeleteIcon, UserIcon } from '../../components/icons';
import PlantTerm, { createDefaultSemesterLocalization } from '../../components/SisIntegration/PlantTerm';
import EditTerm from '../../components/SisIntegration/EditTerm';
import Box from '../../components/widgets/Box/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Button from '../../components/widgets/FlatButton';

import { fetchAllTerms, create, deleteTerm, editTerm } from '../../redux/modules/sisTerms';
import { createGroup, fetchAllGroups } from '../../redux/modules/groups';
import { fetchUser } from '../../redux/modules/users';
import { loggedInUserSelector, getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchManyStatus, readySisTermsSelector } from '../../redux/selectors/sisTerms';
import { notArchivedGroupsSelector } from '../../redux/selectors/groups';
import { loggedInSupervisorOfSelector } from '../../redux/selectors/usersGroups';

import {
  getLocalizedTextsInitialValues,
  getLocalizedName,
  transformLocalizedTextsFormData,
} from '../../helpers/localizedData';
import { isStudentRole, isSupervisorRole, isSuperadminRole } from '../../components/helpers/usersRoles';
import { getExternalIdForCAS } from '../../helpers/cas';
import { arrayToObject } from '../../helpers/common';

const ADD_SIS_TERM_INITIAL_VALUES = {
  year: new Date(new Date().getTime() - 86400000 * 180).getFullYear(), // actual year (shifted by 180 days back)
  term: '',
};

class SisIntegration extends Component {
  state = {
    openPlant: null,
    plantInitialValues: null,
    plantRootGroups: [],
    openEdit: null,
    editInitialValues: null,
    openArchive: null,
  };

  // planting new groups
  openPlantDialog = ({ year, term }, groups) => {
    const id = `${year}-${term}`;
    const {
      intl: { locale },
    } = this.props;

    const mainRootGroup = groups.find(group => group.parentGroupId === null);
    const plantRootGroups = mainRootGroup
      ? groups.filter(group => group.parentGroupId === mainRootGroup.id).filter(group => group.externalId)
      : [];
    plantRootGroups.sort((a, b) => getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale), locale));

    const localizations = createDefaultSemesterLocalization(year, term);
    const plantInitialValues = {
      groups: arrayToObject(
        plantRootGroups,
        g => g.id,
        () => false
      ),
      localizedTexts: getLocalizedTextsInitialValues(
        localizations,
        localizations.find(l => l.locale === 'en')
      ),
      externalId: id,
    };

    this.setState({ openPlant: id, plantInitialValues, plantRootGroups });
  };

  closePlantDialog = () => {
    this.setState({ openPlant: null });
  };

  submitPlantDialog = ({ groups, ...data }) => {
    const { addSubgroup, refreshGroupsAndUser, loggedInUserId } = this.props;
    const groupTemplate = {
      publicStats: false,
      detaining: false,
      isPublic: false,
      isOrganizational: true,
      hasThreshold: false,
      noAdmin: true,
    };

    return Promise.all(
      Object.entries(groups)
        .filter(([_, value]) => value)
        .map(([key, _]) => this.state.plantRootGroups.find(group => group.id === key))
        .filter(group => group)
        .map(group => addSubgroup(group, { ...groupTemplate, ...data }))
    ).then(() => {
      this.closePlantDialog();
      return refreshGroupsAndUser(loggedInUserId);
    });
  };

  // editting semester parameters
  openEditDialog = (openEdit, data) => {
    const editInitialValues = {
      beginning: data.beginning * 1000,
      end: data.end * 1000,
      advertiseUntil: data.advertiseUntil * 1000,
    };
    this.setState({ openEdit, editInitialValues });
  };

  closeEditDialog = () => {
    this.setState({ openEdit: null, editInitialValues: null });
  };

  submitEditDialog = data => this.props.editTerm(this.state.openEdit, data).then(this.closeEditDialog);

  static loadAsync = (params, dispatch) => dispatch(fetchAllTerms());

  componentDidMount() {
    const { loadAsync, effectiveRole } = this.props;
    isSuperadminRole(effectiveRole) && loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.effectiveRole !== prevProps.effectiveRole && isSuperadminRole(this.props.effectiveRole)) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      loggedInUser,
      effectiveRole,
      fetchStatus,
      supervisorOfGroups,
      allGroups,
      createNewTerm,
      deleteTerm,
      sisTerms,
    } = this.props;

    return (
      <Page
        resource={loggedInUser}
        title={<FormattedMessage id="app.sisIntegration.title" defaultMessage="UK SIS Integration" />}
        description={
          <FormattedMessage
            id="app.sisIntegration.description"
            defaultMessage="Integration with Charles University student information system"
          />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.sisIntegration.title" defaultMessage="UK SIS Integration" />,
            iconName: 'id-badge',
          },
        ]}>
        {user => {
          const externalId = getExternalIdForCAS(user);

          return externalId ? (
            <React.Fragment>
              <div className="callout callout-info">
                <UserIcon gapRight />
                <FormattedMessage
                  id="app.sisIntegration.identityInfo"
                  defaultMessage="Your ReCodEx account is associated with SIS identity identifier '{externalId}'."
                  values={{ externalId }}
                />
              </div>

              <ResourceRenderer
                resource={isSuperadminRole(effectiveRole) ? allGroups.toArray() : supervisorOfGroups.toArray()}
                returnAsArray={true}>
                {groups => (
                  <React.Fragment>
                    {isStudentRole(effectiveRole) && (
                      <Row>
                        <Col lg={12}>
                          <SisIntegrationContainer />
                        </Col>
                      </Row>
                    )}

                    {isSupervisorRole(effectiveRole) && (
                      <Row>
                        <Col lg={12}>
                          <SisSupervisorGroupsContainer groups={groups} />
                        </Col>
                      </Row>
                    )}

                    {isSuperadminRole(effectiveRole) && (
                      <Row>
                        <Col lg={8}>
                          <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
                            {() => (
                              <Box
                                title={<FormattedMessage id="app.sisIntegration.list" defaultMessage="SIS Terms" />}
                                noPadding
                                unlimitedHeight>
                                <TermsList
                                  terms={sisTerms}
                                  createActions={(id, data) => (
                                    <div>
                                      {Date.now() <= data.advertiseUntil * 1000 && (
                                        <Button
                                          bsSize="xs"
                                          bsStyle="success"
                                          onClick={() => this.openPlantDialog(data, groups)}>
                                          <Icon icon="seedling" gapRight />
                                          <FormattedMessage
                                            id="app.sisIntegration.plantButton"
                                            defaultMessage="Plant"
                                          />
                                        </Button>
                                      )}
                                      <Button
                                        bsSize="xs"
                                        bsStyle="primary"
                                        onClick={() => this.setState({ openArchive: id })}>
                                        <ArchiveGroupIcon gapRight />
                                        <FormattedMessage
                                          id="app.archiveGroupButton.setShort"
                                          defaultMessage="Archive"
                                        />
                                      </Button>
                                      <Button
                                        bsSize="xs"
                                        bsStyle="warning"
                                        onClick={() => this.openEditDialog(id, data)}>
                                        <EditIcon gapRight />
                                        <FormattedMessage id="generic.edit" defaultMessage="Edit" />
                                      </Button>
                                      <Confirm
                                        id={id}
                                        onConfirmed={() => deleteTerm(id)}
                                        question={
                                          <FormattedMessage
                                            id="app.sisIntegration.deleteConfirm"
                                            defaultMessage="Are you sure you want to delete the SIS term?"
                                          />
                                        }>
                                        <Button bsSize="xs" bsStyle="danger">
                                          <DeleteIcon gapRight />
                                          <FormattedMessage id="generic.delete" defaultMessage="Delete" />
                                        </Button>
                                      </Confirm>
                                    </div>
                                  )}
                                />
                              </Box>
                            )}
                          </FetchManyResourceRenderer>
                        </Col>
                        <Col lg={4}>
                          <AddSisTermForm onSubmit={createNewTerm} initialValues={ADD_SIS_TERM_INITIAL_VALUES} />
                        </Col>
                      </Row>
                    )}

                    <PlantTerm
                      isOpen={this.state.openPlant !== null}
                      onClose={this.closePlantDialog}
                      onSubmit={this.submitPlantDialog}
                      externalId={this.state.openPlant}
                      groups={groups}
                      rootGroups={this.state.plantRootGroups}
                      initialValues={this.state.plantInitialValues}
                    />

                    <EditTerm
                      isOpen={this.state.openEdit !== null}
                      onClose={this.closeEditDialog}
                      onSubmit={this.submitEditDialog}
                      initialValues={this.state.editInitialValues}
                    />
                  </React.Fragment>
                )}
              </ResourceRenderer>
            </React.Fragment>
          ) : (
            <div className="callout callout-warning">
              <FormattedMessage
                id="app.sisIntegration.noCasIdentifier"
                defaultMessage="Your ReCodEx account is not associated with any SIS identity identifier."
              />
            </div>
          );
        }}
      </Page>
    );
  }
}

SisIntegration.propTypes = {
  loggedInUserId: PropTypes.string,
  loggedInUser: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  fetchStatus: PropTypes.string,
  sisTerms: PropTypes.array.isRequired,
  supervisorOfGroups: ImmutablePropTypes.map,
  allGroups: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  createNewTerm: PropTypes.func,
  deleteTerm: PropTypes.func,
  editTerm: PropTypes.func,
  addSubgroup: PropTypes.func,
  refreshGroupsAndUser: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  return {
    loggedInUserId: loggedInUserIdSelector(state),
    loggedInUser: loggedInUserSelector(state),
    effectiveRole: getLoggedInUserEffectiveRole(state),
    fetchStatus: fetchManyStatus(state),
    sisTerms: readySisTermsSelector(state),
    supervisorOfGroups: loggedInSupervisorOfSelector(state),
    allGroups: notArchivedGroupsSelector(state),
  };
};

const mapDispatchToProps = (dispatch, { match: { params } }) => ({
  loadAsync: () => SisIntegration.loadAsync(params, dispatch),
  createNewTerm: data => dispatch(create(data)),
  deleteTerm: id => dispatch(deleteTerm(id)),
  editTerm: (id, data) => {
    // convert deadline times to timestamps
    const processedData = Object.assign({}, data, {
      beginning: moment(data.beginning).unix(),
      end: moment(data.end).unix(),
      advertiseUntil: moment(data.advertiseUntil).unix(),
    });
    return dispatch(editTerm(id, processedData));
  },
  addSubgroup: (parentGroup, { localizedTexts, ...data }) =>
    dispatch(
      createGroup({
        ...data,
        localizedTexts: transformLocalizedTextsFormData(localizedTexts),
        instanceId: parentGroup.privateData.instanceId,
        parentGroupId: parentGroup.id,
      })
    ).then(),
  refreshGroupsAndUser: userId => Promise.all([dispatch(fetchAllGroups()), dispatch(fetchUser(userId))]),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SisIntegration));
