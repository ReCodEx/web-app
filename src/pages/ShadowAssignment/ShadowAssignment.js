import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Col, Row } from 'react-bootstrap';

import Button from '../../components/widgets/FlatButton';
import { LinkContainer } from 'react-router-bootstrap';

import { fetchShadowAssignmentIfNeeded } from '../../redux/modules/shadowAssignments';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments';

import Page from '../../components/layout/Page';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import ShadowAssignmentPointsContainer from '../../containers/ShadowAssignmentPointsContainer';
import ShadowAssignmentDetails from '../../components/Assignments/ShadowAssignment/ShadowAssignmentDetails';
import { EditIcon } from '../../components/icons';
import LocalizedTexts from '../../components/helpers/LocalizedTexts';

import withLinks from '../../helpers/withLinks';
import { getLocalizedName } from '../../helpers/localizedData';
import { hasPermissions } from '../../helpers/common';

class ShadowAssignment extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    dispatch(fetchShadowAssignmentIfNeeded(assignmentId));

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.assignmentId !== newProps.params.assignmentId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      shadowAssignment,
      links: { SHADOW_ASSIGNMENT_EDIT_URI_FACTORY },
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={shadowAssignment}
        title={shadowAssignment => getLocalizedName(shadowAssignment, locale)}
        description={
          <FormattedMessage
            id="app.shadowAssignment.title"
            defaultMessage="Shadow Assignment"
          />
        }
        breadcrumbs={[
          {
            resource: shadowAssignment,
            iconName: 'users',
            breadcrumb: shadowAssignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_DETAIL_URI_FACTORY }) =>
                GROUP_DETAIL_URI_FACTORY(shadowAssignment.groupId)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.shadowAssignment.title"
                defaultMessage="Shadow Assignment"
              />
            ),
            iconName: 'hourglass-start'
          }
        ]}
      >
        {shadowAssignment =>
          <div>
            <Row>
              <Col xs={12}>
                <HierarchyLineContainer groupId={shadowAssignment.groupId} />
                {hasPermissions(shadowAssignment, 'update') &&
                  <p>
                    <LinkContainer
                      to={SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(
                        shadowAssignment.id
                      )}
                    >
                      <Button bsStyle="warning">
                        <EditIcon gapRight />
                        <FormattedMessage
                          id="app.shadowAssignment.editSettings"
                          defaultMessage="Edit Shadow Assignment Settings"
                        />
                      </Button>
                    </LinkContainer>
                  </p>}
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                {shadowAssignment.localizedTexts.length > 0 &&
                  <div>
                    <LocalizedTexts locales={shadowAssignment.localizedTexts} />
                  </div>}
              </Col>
              <Col lg={6}>
                <ShadowAssignmentDetails {...shadowAssignment} />
              </Col>
            </Row>

            {hasPermissions(shadowAssignment, 'viewAllPoints') &&
              <Row>
                <Col xs={12}>
                  <ShadowAssignmentPointsContainer {...shadowAssignment} />
                </Col>
              </Row>}
          </div>}
      </Page>
    );
  }
}

ShadowAssignment.propTypes = {
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  shadowAssignment: PropTypes.object,
  group: PropTypes.func,
  loadAsync: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  intl: intlShape.isRequired
};

export default withLinks(
  connect(
    (state, { params: { assignmentId } }) => {
      return {
        shadowAssignment: getShadowAssignment(state)(assignmentId)
      };
    },
    (dispatch, { params: { assignmentId } }) => ({
      loadAsync: () => ShadowAssignment.loadAsync({ assignmentId }, dispatch)
    })
  )(injectIntl(ShadowAssignment))
);
