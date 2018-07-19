import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import GroupTree from '../../Groups/GroupTree';

const InstanceDetail = ({ description, rootGroupId, groups, isAdmin }) =>
  <Row>
    <Col md={6}>
      <Box
        title={
          <FormattedMessage
            id="app.instance.detailTitle"
            defaultMessage="Instance description"
          />
        }
      >
        <Markdown source={description} />
      </Box>
    </Col>
    <Col md={6}>
      <Box
        title={
          <FormattedMessage
            id="app.instance.groupsTitle"
            defaultMessage="Groups hierarchy"
          />
        }
        extraPadding
        unlimitedHeight
      >
        <div>
          {rootGroupId !== null &&
            <GroupTree id={rootGroupId} isAdmin={isAdmin} groups={groups} />}

          {rootGroupId === null &&
            <FormattedMessage
              id="app.instance.groups.noGroups"
              defaultMessage="There are no groups in this ReCodEx instance."
            />}
        </div>
      </Box>
    </Col>
  </Row>;

InstanceDetail.propTypes = {
  description: PropTypes.string.isRequired,
  rootGroupId: PropTypes.string,
  groups: ImmutablePropTypes.map.isRequired,
  isAdmin: PropTypes.bool
};

export default InstanceDetail;
