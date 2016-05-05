import React from 'react';

const Sidebar = () => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <div className='user-panel'>
        <div className='pull-left image'>
          <img src='http://placehold.it/160x160' className='img-circle' alt='User Image' />
        </div>
        <div className='pull-left info'>
          <p>Šimon Rozsíval</p>
          <a href='#'>MFF UK v Praze</a>
        </div>
      </div>
    </section>
  </aside>
);

export default Sidebar;
