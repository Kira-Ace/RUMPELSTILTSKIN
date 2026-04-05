import { useState } from 'react';
import TopBar from '../common/TopBar.jsx';
import Greeting from '../common/Greeting.jsx';
import { TODAY } from '../../utils/constants.js';
import { formatDateKey } from '../../utils/dateUtils.js';

export default function HomeScreen({ tasks }) {
  const todayTasks = tasks[formatDateKey(TODAY.y, TODAY.m, TODAY.d)] || [];


  return (
    <>
      <TopBar/>
      <div className="scroll-content">
        <div className="home-wrap">
          {/* TEMPLATE: Replace with your app's greeting/user data */}
          <Greeting userName="My App" />

          {/* Quote - TEMPLATE: Add your own motivational quotes below */}
          <div className="quote-section">
            <p className="quote-text">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
            <p className="quote-attr">— Brian Herbert</p>
          </div>
        </div>
      </div>
    </>
  );
}
