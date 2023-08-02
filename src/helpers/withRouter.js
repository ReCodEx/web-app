import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const withRouter = Inner => {
  const ComponentWithRouter = props => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    return <Inner {...props} location={location} params={params} navigate={navigate} />;
  };
  ComponentWithRouter.displayName = `withRouter(${Inner.displayName || Inner.name || 'Component'})`;
  ComponentWithRouter.WrappedComponent = Inner; // use the same name as react-redux
  return ComponentWithRouter;
};

export default withRouter;

export const withRouterProps = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
};
