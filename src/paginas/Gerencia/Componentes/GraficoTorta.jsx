import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Paleta de colores definitiva
const COLORS_MAP = {
  // Valores principales
  'Total Cobrado': '#28a745',      // Verde
  'Total Prestado': '#fd7e14',     // Naranja
  'Total a Cobrar': '#ffc107',     // Amarillo
  'Suscripciones Iniciales': '#6f42c1', // Morado
  'Intereses Generados': '#007bff',          // Azul
  'Total Perdido': '#dc3545',           // Rojo
  
  // Métodos de pago
  'Efectivo': '#17a2b8',           // Cyan
  'Transferencia': '#20c997',      // Verde-azulado
  'Tarjeta Crédito': '#6610f2',    // Índigo
  'Tarjeta Débito': '#8E7DBE',     // Rosa
  'Dólares': '#6c757d',            // Gris
  'USDT': '#343a40'                // Negro
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`$${value.toLocaleString('es-AR')}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const PieChartComponent = ({ data, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getColor = (name) => COLORS_MAP[name] || '#6c757d'; // Gris por defecto

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {title && <h4 style={{ marginBottom: '20px' }}>{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Valor']}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Leyenda */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        marginTop: '20px',
        gap: '10px'
      }}>
        {data.map((entry, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '0 10px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: getColor(entry.name),
              marginRight: '8px',
              borderRadius: '2px',
            }}></div>
            <span style={{ 
              fontWeight: '500',
              color: getColor(entry.name),
              marginRight: '5px'
            }}>
              {entry.name}:
            </span>
            <span>${entry.value.toLocaleString('es-AR')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;