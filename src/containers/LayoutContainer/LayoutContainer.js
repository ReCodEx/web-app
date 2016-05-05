import { connect } from 'react-redux';
import Layout from '../../components/Layout';
import { toggleSize, toggleVisibility } from '../../redux/sidebar';

const mapStateToProps = (state) => ({
  sidebar: {
    isOpen: state.sidebar.visible,
    isCollapsed: state.sidebar.collapsed
  }
});

const mapDispatchToProps = (dispatch, props) => ({
  toggleSidebar: {
    visibility: () => dispatch(toggleVisibility()),
    size: () => dispatch(toggleSize())
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
