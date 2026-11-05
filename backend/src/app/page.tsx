import React from 'react';

export default function ApiHome() {
  return (
    <div>
      <h1>SkillBridge Backend API</h1>
      <p>Status: Online</p>
      <ul>
        <li><code>POST /api/artifacts</code> - Create artifact</li>
        <li><code>GET /api/problems</code> - List matching problems</li>
        <li><code>GET /api/problems/[id]</code> - Single problem details</li>
        <li><code>GET /api/matches/[problemId]/action-plan</code> - Learning action plan</li>
        <li><code>POST /api/outreach/generate</code> - Generate cold outreach email</li>
      </ul>
    </div>
  );
}
