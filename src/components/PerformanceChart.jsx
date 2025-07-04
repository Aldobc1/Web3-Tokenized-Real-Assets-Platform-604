import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../contexts/LanguageContext';

const PerformanceChart = ({ assetId }) => {
  const { t } = useLanguage();

  // Sample data - in a real app, this would come from an API
  const generateSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    let baseValue = 1000;
    
    months.forEach((month, index) => {
      const variation = (Math.random() - 0.5) * 100;
      baseValue += variation;
      data.push([month, Math.round(baseValue)]);
    });
    
    return data;
  };

  const chartData = generateSampleData();

  const option = {
    title: {
      text: t('asset.historicalPerformance'),
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}: $${params[0].value[1]}`;
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item[0]),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        formatter: '${value}'
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: [
      {
        data: chartData.map(item => item[1]),
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#0ea5e9',
          width: 3
        },
        itemStyle: {
          color: '#0ea5e9'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(14, 165, 233, 0.3)'
            }, {
              offset: 1, color: 'rgba(14, 165, 233, 0.05)'
            }]
          }
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
};

export default PerformanceChart;