import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // File CSS untuk styling
import { MdOutlineSpeed, MdTrain, MdLocationOn } from 'react-icons/md';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';
import GaugeComponent from 'react-gauge-component';
import logo from './assets/Images/Logo-PT-INKA.png';
import io from 'socket.io-client';

const MAX_DATA_COUNT = 20;
const MAX_SPEED = 350;
const gaugeLimits = [
  { limit: 20, color: '#5BE12C', showTick: true },
  { limit: 40, color: '#F5CD19', showTick: true },
  { limit: 60, color: '#F58B19', showTick: true },
  { limit: MAX_SPEED, color: '#EA4228', showTick: true },
];

function Home() {
  const [sensorData, setSensorData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [distanceData, setDistanceData] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [prevTimestamp, setPrevTimestamp] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  const kmhToMs = (value) => {
    return { value: value.toFixed(2), unit: 'km/h' };
  };

  useEffect(() => {
    const URL = "http://localhost:5001";
    const socket = io(URL, {
      pinTimeout: 30000,
      pingInterval: 5000,
      upgradeTimeout: 30000,
      cors: {
        origin: "http://localhost:5001",
      }
    });

    socket.connect();
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('sensorData', ({ value, date }) => {
      const newTimestamp = new Date(date).getTime();

      setSensorData(prevData => {
        const newData = [...prevData, { date: newTimestamp, speed: value }].slice(-MAX_DATA_COUNT);

        if (prevTimestamp !== null) {
          const timeDiff = (newTimestamp - prevTimestamp) / 3600; // perbedaan waktu dalam jam
          const incrementalDistance = value * timeDiff; // jarak dalam kilometer
          setTotalDistance(prevDistance => {
            const updatedDistance = prevDistance + incrementalDistance;
            return parseFloat(updatedDistance.toFixed(2)); // memastikan dua angka di belakang koma
          });

          const updatedDistanceData = newData.map((point, index) => ({
            ...point,
            distance: (index === 0 ? 0 : (totalDistance + incrementalDistance)).toFixed(2),
          }));

          setDistanceData(updatedDistanceData);
        }

        setPrevTimestamp(newTimestamp);
        return newData;
      });

      setGaugeValue(value);
    });

    return () => {
      socket.disconnect();
    };
  }, [prevTimestamp, totalDistance]);

  const lastSensorData = sensorData.length > 0 ? sensorData[sensorData.length - 1].speed : 0;
  const { value: convertedValue, unit: speedUnit } = kmhToMs(lastSensorData);

  console.log('distanceData:', distanceData);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className='main-container'>
      <div className='gauge-chart'>
        <h3>Gauge Chart</h3>
        <GaugeComponent
          className='gauge-component'
          arc={{
            nbSubArcs: gaugeLimits.length,
            colorArray: gaugeLimits.map(limit => limit.color),
            width: 0.3,
            padding: 0.003
          }}
          labels={{
            valueLabel: {
              fontSize: 40,
              formatTextValue: value => `${value.toFixed(2)} km/h`
            }
          }}
          value={gaugeValue}
          maxValue={MAX_SPEED}
        />
      </div>
      <div className='main-cards'>
        <div className='card'>
          <div className='card-inner'>
            <h3>Speed Rated</h3>
          </div>
          <div className="d-flex align-items-center">
            <h2 id='speedValue'>{convertedValue}</h2>
            <span className="unit">{speedUnit}</span>
          </div>
          {/*<small className="text-muted">Kecepatan yang Terbaca oleh Radar</small>*/}
        </div>
        <div className='card'>
          <div className='card-inner'>
            <h3>Train Position</h3>
          </div>
          <div className="d-flex align-items-center">
            <h2>{totalDistance.toFixed(2)}</h2>
            <span className="unit">km</span>
          </div>
          {/*<small className="text-muted">Posisi terhadap Jarak</small>*/}
        </div>
        <div className='card'>
          <div className='card-inner'>
            <h3>Blocking</h3>
          </div>
          <div className="d-flex align-items-center">
            <h2>42</h2> {/* untuk dihubungkan dengan sensor */}
          </div>
          {/*<small className="text-muted">Posisi Kereta</small>*/}
        </div>
      </div>
      <div className='button-container'>
        {/* Card 2 */}
        <div className='company'>
          <div className="d-flex align-items-center">
            <img src={logo} alt="PT.Inka" className="company-logo" />
          </div>
        </div>
        {/* Card 3 */}
        <div className='info-card'>
          <div className="d-flex align-items-center">
            <h2>{currentTime}</h2>
          </div>
        </div>
        {/* Card 1 */}
        <div className='button'>
          <button onClick={() => navigate('/history')}>History</button>
        </div>
      </div>
      <div className='line-chart'>
        <h3>Grafik kecepatan terhadap jarak</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={distanceData}
            margin={{
              top: 5,
              right: 30,
              left: 10,
              bottom: 9,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" label={{ value: "Distance (km)", position: 'insideBottomRight', offset: 0 }} />
            <YAxis label={{ value: "speed (km/h)", angle: -90, position: 'insideLeft' }}
              domain={[0, 350]}
              ticks={[0, 50, 100, 150, 200, 250, 300, 350]}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="speed" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
export default Home;
