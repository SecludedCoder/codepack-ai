function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ color: '#4f46e5', fontSize: '48px', marginBottom: '20px' }}>
        🎉 CodePack AI
      </h1>
      <p style={{ fontSize: '20px', color: '#6b7280' }}>
        React 应用成功加载！
      </p>
      <p style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}>
        如果您能看到这个页面，说明基础环境已经正常工作。
      </p>
    </div>
  );
}

export default App;