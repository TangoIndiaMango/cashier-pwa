import { useOnlineStatus } from './hooks/useOnlineStatus';

 const App = () => {
  
  const { isOnline, networkType, effectiveType, downlink, rtt } = useOnlineStatus();
  return (
    <div className="connection-status">
      <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
      
      {isOnline ? (
        <div className="network-details">
          {networkType && (
            <div>Connection: {networkType}</div>
          )}
          {effectiveType && (
            <div>Speed: {effectiveType}</div>
          )}
          {downlink && (
            <div>Bandwidth: {downlink} Mbps</div>
          )}
          {rtt && (
            <div>Latency: {rtt}ms</div>
          )}
        </div>
      ): (
        <div className="network-details">
          <div>Connection: Not Available</div>
          <h1>Here are some of your products</h1>
          {[1,2,3,4].map((product) => {
            return <div key={product}>Product {product}</div>
          })}
        </div>
      )}
    </div>
  );
};
export default App;