import { useState } from 'react';
import TopBar from '../common/TopBar.jsx';
import ParallaxRoom from '../common/ParallaxRoom.jsx';
import RoomCenterpiece from '../common/RoomCenterpiece.jsx';
import { TODAY } from '../../utils/constants.js';
import { formatDateKey } from '../../utils/dateUtils.js';
import { Plus, RefreshCw, List, MoreHorizontal } from 'lucide-react';

export default function HomeScreen({ tasks, openChatModal }) {
  const todayTasks = tasks[formatDateKey(TODAY.y, TODAY.m, TODAY.d)] || [];

  return (
    <>
      <TopBar/>
      <div className="scroll-content">
        <div className="home-wrap">
          
          {/* 3D Parallax Room Background */}
          <div className="home-hero-section">
            <ParallaxRoom />
            <RoomCenterpiece onActivateVoiceChat={() => openChatModal?.("voice")} />

            {/* Widget action buttons row */}
            <div className="home-widget-row">
              <div className="widget-btn-wrap">
                <button className="widget-btn"><Plus size={22} /></button>
                <span className="widget-label">Placeholder</span>
              </div>
              <div className="widget-btn-wrap">
                <button className="widget-btn"><RefreshCw size={22} /></button>
                <span className="widget-label">Placeholder</span>
              </div>
              <div className="widget-btn-wrap">
                <button className="widget-btn"><List size={22} /></button>
                <span className="widget-label">Placeholder</span>
              </div>
              <div className="widget-btn-wrap">
                <button className="widget-btn"><MoreHorizontal size={22} /></button>
                <span className="widget-label">Placeholder</span>
              </div>
            </div>
          </div>

          {/* Main content cards */}
          <div className="home-cards-section">

            {/* Tasks Preview */}
            {todayTasks.length > 0 && (
              <div className="home-tasks-preview">
                <div className="preview-title">Your Tasks</div>
                <div className="preview-list">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="preview-task-item">
                      <div 
                        className="preview-task-dot" 
                        style={{ backgroundColor: task.color || '#FF7B20' }}
                      ></div>
                      <div className="preview-task-info">
                        <div className="preview-task-title">{task.title}</div>
                        {task.time && <div className="preview-task-time">{task.time}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  heading */}
            <div className="home-section-title"></div>

          </div>

        </div>
      </div>
    </>
  );
}
