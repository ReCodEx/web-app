import React, { PropTypes } from 'react';

const UserProfile = ({
  id,
  fullName,
  role,
  avatarUrl
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
    {/*
      <div className='row'>
        <div className='col-sm-4 border-right'>
          <div className='description-block'>
            <h5 className='description-header'>3,200</h5>
            <span className='description-text'>SALES</span>
          </div>
        </div>
        <div className='col-sm-4 border-right'>
          <div className='description-block'>
            <h5 className='description-header'>13,000</h5>
            <span className='description-text'>FOLLOWERS</span>
          </div>
        </div>
        <div className='col-sm-4'>
          <div className='description-block'>
            <h5 className='description-header'>35</h5>
            <span className='description-text'>PRODUCTS</span>
          </div>
        </div>
      </div>
    */}
    </div>
  </div>
);

export default UserProfile;
