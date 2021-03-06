import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import Callout from '../../widgets/Callout';

const GroupArchivedWarning = ({ archived, directlyArchived }) =>
  archived && (
    <Row>
      <Col lg={12}>
        <Callout variant="warning">
          <FormattedMessage
            id="app.group.archivedExplain"
            defaultMessage="This group is archived, so it cannot be modified."
          />
          <br />
          {!directlyArchived && (
            <FormattedMessage
              id="app.group.notDirectlyArchived"
              defaultMessage="This group inherits the archived flag from one of its parent groups."
            />
          )}
        </Callout>
      </Col>
    </Row>
  );

GroupArchivedWarning.propTypes = {
  archived: PropTypes.bool.isRequired,
  directlyArchived: PropTypes.bool.isRequired,
};

export default GroupArchivedWarning;
