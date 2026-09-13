import React from 'react';
import ReactECharts from 'echarts-for-react';

interface EChartProps {
  option: any;
  height?: string;
  className?: string;
  onEvents?: Record<string, Function>;
}

export const EChart: React.FC<EChartProps> = ({
  option,
  height = '320px',
  className = '',
  onEvents,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        onEvents={onEvents}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};
