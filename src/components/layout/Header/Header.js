import React, { Component } from 'react';
import PropTypes from 'prop-types';

import HeaderNotificationsContainer from '../../../containers/HeaderNotificationsContainer';
import HeaderSystemMessagesContainer from '../../../containers/HeaderSystemMessagesContainer';
import HeaderLanguageSwitching from '../HeaderLanguageSwitching';
import MemberGroupsDropdown from '../../Groups/MemberGroupsDropdown';
import ClientOnly from '../../helpers/ClientOnly';
import FetchManyResourceRenderer from '../../helpers/FetchManyResourceRenderer';
import Icon, { GroupIcon, LoadingIcon, WarningIcon } from '../../icons';
import { getConfigVar } from '../../../helpers/config.js';

const SKIN = getConfigVar('SKIN') || 'success';

class Header extends Component {
  toggleSidebarSize = e => {
    e.preventDefault();
    this.props.toggleSidebarSize();
  };

  toggleSidebarVisibility = e => {
    e.preventDefault();
    this.props.toggleSidebarVisibility();
  };

  render() {
    const {
      isLoggedIn,
      availableLangs = [],
      currentLang,
      setLang,
      relatedGroupId,
      memberGroups,
      fetchManyGroupsStatus,
    } = this.props;

    return (
      <nav className={`app-header navbar navbar-expand bg-${SKIN} shadow`} data-bs-theme="dark">
        <ClientOnly>
          <ul className="navbar-nav w-100">
            <li className="nav-item">
              <a className="nav-link" data-widget="pushmenu" href="#" onClick={this.toggleSidebarSize}>
                <Icon icon="bars" />
              </a>
            </li>
            {fetchManyGroupsStatus && (
              <li className="nav-item memberGroupsDropdownContainer">
                <FetchManyResourceRenderer
                  fetchManyStatus={fetchManyGroupsStatus}
                  loading={
                    <span className="nav-link">
                      <GroupIcon gapRight />
                      <LoadingIcon />
                    </span>
                  }
                  failed={
                    <span className="nav-link">
                      <GroupIcon gapRight />
                      <WarningIcon />
                    </span>
                  }>
                  {() => <MemberGroupsDropdown groupId={relatedGroupId} memberGroups={memberGroups} />}
                </FetchManyResourceRenderer>
              </li>
            )}
          </ul>
        </ClientOnly>

        <ul className="navbar-nav ms-auto">
          {isLoggedIn && <HeaderSystemMessagesContainer locale={currentLang} />}
          <HeaderNotificationsContainer />
          <HeaderLanguageSwitching availableLangs={availableLangs} currentLang={currentLang} setLang={setLang} />
        </ul>
      </nav>
    );
  }
}

Header.propTypes = {
  isLoggedIn: PropTypes.bool,
  toggleSidebarSize: PropTypes.func.isRequired,
  toggleSidebarVisibility: PropTypes.func.isRequired,
  currentLang: PropTypes.string.isRequired,
  setLang: PropTypes.func.isRequired,
  availableLangs: PropTypes.array,
  currentUrl: PropTypes.string,
  relatedGroupId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
  fetchManyGroupsStatus: PropTypes.string,
};

export default Header;
