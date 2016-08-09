import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import { Row, Col } from 'react-bootstrap';

const UserProfile = ({
  id,
  fullName,
  role,
  avatarUrl,
  groups: {
    studentOf,
    supervisorOf
  }
}) => (
  <div className='box box-widget widget-user'>
    <div className='widget-user-header bg-aqua-active'>
      <h3 className='widget-user-username'>{fullName}</h3>
      <h5 className='widget-user-desc'>{id}, {role}</h5>
    </div>
    <div className='widget-user-image'>
      <img className='img-circle' src={avatarUrl} alt={fullName} />
    </div>
    <div className='box-footer'>
      <Row>
        <Col sm={4} className='border-right'>
          <div className='description-block'>
            <h5 className='description-header'>{studentOf.length}</h5>
            <span className='description-text text-uppercase'>
              <FormattedMessage id='app.user.profile.studentOf' defaultMessage='Member as student' />
            </span>
          </div>
        </Col>
        <Col sm={4} className='border-right'>
          <div className='description-block'>
            <h5 className='description-header'>{supervisorOf.length}</h5>
            <span className='description-text text-uppercase'>
              <FormattedMessage id='app.user.profile.supervisorOf' defaultMessage='Member as supervisor' />
            </span>
          </div>
        </Col>
        <Col sm={4}>
          <div className='description-block'>
            <h5 className='description-header'>35</h5>
            <span className='description-text'>PRODUCTS</span>
          </div>
        </Col>
      </Row>
    </div>
  </div>
);

export default UserProfile;
