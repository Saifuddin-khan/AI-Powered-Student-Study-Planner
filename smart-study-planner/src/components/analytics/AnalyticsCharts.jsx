import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MdDownload } from 'react-icons/md';
import './AnalyticsCharts.css';

/**
 * AnalyticsCharts
 * Collection of advanced charts for analytics dashboard
 *
 * Props:
 *  - trendData: Array of { date, hours }
 *  - subjectPerformance: Array of { subject, score }
 *  - skillsProfile: Array of { skill, competency (0-100) }
 *  - heatmapData: Array of { day, hour, count }
 *  - rangeDays: Selected range (7, 30, 90)
 *  - onRangeChange: Callback when range changes
 *  - isLoading: Loading state
 */

/* Custom tooltip styles */
function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ac-tooltip">
      <p className="ac-tooltip__label">{label}</p>
      <p className="ac-tooltip__value">{payload[0]?.value}h</p>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ac-tooltip">
      <p className="ac-tooltip__label">{payload[0]?.payload?.subject}</p>
      <p className="ac-tooltip__value">{payload[0]?.value}%</p>
    </div>
  );
}

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ac-tooltip">
      <p className="ac-tooltip__label">{payload[0]?.payload?.skill}</p>
      <p className="ac-tooltip__value">{payload[0]?.value}%</p>
    </div>
  );
}

/* Heatmap cell component */
function HeatmapCell({ day, hour, count, maxCount }) {
  const intensity = count ? (count / maxCount) * 100 : 0;
  const colors = [
    '#1F2937', // 0%
    '#3B82F6', // 25%
    '#06B6D4', // 50%
    '#10B981', // 75%
    '#F59E0B', // 100%
  ];
  const colorIdx = Math.floor(intensity / 20);
  const color = colors[Math.min(colorIdx, colors.length - 1)];

  return (
    <div
      className="ac-heatmap__cell"
      style={{ backgroundColor: color }}
      title={`${day} ${hour}:00 - ${count} sessions`}
    />
  );
}

/* Export chart to PNG using html2canvas (if available) */
async function exportChart(elementId, filename) {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const element = document.getElementById(elementId);
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: 'var(--bg-surface)' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = filename;
    link.click();
  } catch (err) {
    console.warn('Could not export chart:', err.message);
  }
}

export default function AnalyticsCharts({
  trendData = [],
  subjectPerformance = [],
  skillsProfile = [],
  heatmapData = [],
  rangeDays = 7,
  onRangeChange = () => {},
  isLoading = false,
}) {
  const [heatmapDay, setHeatmapDay] = useState('all'); // Filter heatmap by day

  const RANGE_OPTIONS = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
  ];

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* Filter heatmap data by selected day */
  const filteredHeatmap = heatmapDay === 'all'
    ? heatmapData
    : heatmapData.filter(d => d.day === heatmapDay);

  const maxHeatmapCount = Math.max(...filteredHeatmap.map(d => d.count), 1);

  return (
    <div className="ac-charts">
      {/* ── Trend Chart: Study Hours Over Time ── */}
      <div className="ac-card" id="trend-chart">
        <div className="ac-card__header">
          <h3 className="ac-card__title">Study Hours Trend</h3>
          <div className="ac-range-tabs">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.days}
                className={`ac-range-btn ${rangeDays === opt.days ? 'ac-range-btn--active' : ''}`}
                onClick={() => onRangeChange(opt.days)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ac-chart-wrapper">
          {isLoading || trendData.length === 0 ? (
            <p className="ac-empty">No data available</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6FCD" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7C6FCD" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<LineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#7C6FCD"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <button
                className="ac-export-btn"
                onClick={() => exportChart('trend-chart', 'study-trend.png')}
                title="Export chart as PNG"
              >
                <MdDownload size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Subject Performance Bar Chart ── */}
      <div className="ac-card" id="subject-chart">
        <div className="ac-card__header">
          <h3 className="ac-card__title">Subject Performance</h3>
        </div>
        <div className="ac-chart-wrapper">
          {isLoading || subjectPerformance.length === 0 ? (
            <p className="ac-empty">No subject data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="score" fill="#7C6FCD" radius={[6, 6, 0, 0]}>
                    {subjectPerformance.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color || '#7C6FCD'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <button
                className="ac-export-btn"
                onClick={() => exportChart('subject-chart', 'subject-performance.png')}
                title="Export chart as PNG"
              >
                <MdDownload size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Skills Profile Radar Chart ── */}
      {skillsProfile.length > 0 && (
        <div className="ac-card" id="skills-chart">
          <div className="ac-card__header">
            <h3 className="ac-card__title">Skills Profile</h3>
          </div>
          <div className="ac-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsProfile}>
                <PolarGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Radar name="Competency" dataKey="competency" stroke="#7C6FCD" fill="#7C6FCD" fillOpacity={0.3} />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <button
              className="ac-export-btn"
              onClick={() => exportChart('skills-chart', 'skills-profile.png')}
              title="Export chart as PNG"
            >
              <MdDownload size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Heatmap: Study Activity by Day & Time ── */}
      {heatmapData.length > 0 && (
        <div className="ac-card" id="heatmap-chart">
          <div className="ac-card__header">
            <h3 className="ac-card__title">Study Activity Heatmap</h3>
            <select
              value={heatmapDay}
              onChange={(e) => setHeatmapDay(e.target.value)}
              className="ac-heatmap-filter"
            >
              <option value="all">All Days</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="ac-heatmap">
            <div className="ac-heatmap__labels">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="ac-heatmap__day">{day}</div>
              ))}
            </div>
            <div className="ac-heatmap__grid">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="ac-heatmap__hour-group">
                  {DAYS_OF_WEEK.map(day => {
                    const cell = filteredHeatmap.find(d => d.day === day && d.hour === h);
                    return (
                      <HeatmapCell
                        key={`${day}-${h}`}
                        day={day}
                        hour={h}
                        count={cell?.count || 0}
                        maxCount={maxHeatmapCount}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="ac-heatmap__legend">
              <span className="ac-heatmap__legend-label">Less</span>
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="ac-heatmap__legend-cell"
                  style={{
                    backgroundColor: [
                      '#1F2937', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B',
                    ][i],
                  }}
                />
              ))}
              <span className="ac-heatmap__legend-label">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
