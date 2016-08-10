
export const getSidebar = state => state.sidebar;
export const isVisible = state => getSidebar(state).get('visible');
export const isCollapsed = state => getSidebar(state).get('visible');
