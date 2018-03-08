import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Row, Col, Table } from 'react-bootstrap';
import ReactMarkdown from 'react-remarkable';

import Box from '../../widgets/Box';
import SupervisorsList from '../../Users/SupervisorsList';
import { MaybeSucceededIcon } from '../../icons';
import GroupTree from '../GroupTree';
import {
  getLocalizedName,
  getLocalizedDescription
} from '../../../helpers/getLocalizedData';

const GroupDetail = ({
  group: {
    id,
    externalId,
    name,
    localizedTexts,
    primaryAdminsIds,
    childGroups,
    privateData: {
      description,
      threshold,
      parentGroupId,
      isPublic = false,
      ...privateGroup
    }
  },
  groups,
  supervisors,
  isAdmin,
  intl: { locale }
}) =>
  <div>
    <Row>
      <Col lg={6} sm={12}>
        <Row>
          <Col sm={12}>
            <Box
              title={
                <FormattedMessage
                  id="app.groupDetail.description"
                  defaultMessage="Group description"
                />
              }
              description={
                <ReactMarkdown
                  source={getLocalizedDescription(
                    { description, localizedTexts },
                    locale
                  )}
                />
              }
              type="primary"
              collapsable
              noPadding
              unlimitedHeight
            >
              <Table>
                <tbody>
                  {Boolean(externalId) &&
                    <tr>
                      <th>
                        <FormattedMessage
                          id="app.groupDetail.externalId"
                          defaultMessage="External identification of the group:"
                        />
                      </th>
                      <td>
                        <code>
                          {externalId}
                        </code>
                      </td>
                    </tr>}
                  <tr>
                    <th>
                      <FormattedMessage
                        id="app.groupDetail.isPublic"
                        defaultMessage="Students can join this group themselves:"
                      />
                    </th>
                    <td>
                      <MaybeSucceededIcon success={isPublic} />
                    </td>
                  </tr>
                  {threshold !== null &&
                    <tr>
                      <th>
                        <FormattedMessage
                          id="app.groupDetail.threshold"
                          defaultMessage="Minimum percent of the total points count needed to complete the course:"
                        />
                      </th>
                      <td>
                        <FormattedNumber value={threshold} style="percent" />
                      </td>
                    </tr>}
                </tbody>
              </Table>
            </Box>
          </Col>
        </Row>
      </Col>
      <Col lg={6} sm={12} />
    </Row>
  </div>;

GroupDetail.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parentGroupId: PropTypes.string,
    childGroups: PropTypes.shape({
      all: PropTypes.array,
      public: PropTypes.array.isRequired
    }),
    threshold: PropTypes.number,
    primaryAdminsIds: PropTypes.array.isRequired,
    privateData: PropTypes.shape({
      description: PropTypes.string.isRequired,
      isPublic: PropTypes.bool,
      supervisors: PropTypes.array.isRequired
    })
  }),
  groups: PropTypes.object.isRequired,
  supervisors: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(GroupDetail);
