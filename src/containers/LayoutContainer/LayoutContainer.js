import { connect } from 'react-redux';
import Layout from '../../components/Layout';

import { toggleSize, toggleVisibility } from '../../redux/modules/sidebar';
import { logout } from '../../redux/modules/auth';

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: state.sidebar.visible,
    isCollapsed: state.sidebar.collapsed
  },
  user: state.auth.user
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleSidebar: {
    visibility: () => dispatch(toggleVisibility()),
    size: () => dispatch(toggleSize())
  },
  logout: () => dispatch(logout)
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
