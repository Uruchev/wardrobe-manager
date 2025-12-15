"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("Зареждане...");

  useEffect(() => {
    setMessage("Fashion Advisor - Web версия за тестване");
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#7c3aed' }}>
        👗 Fashion Advisor
      </h1>
      <p style={{ color: '#666' }}>{message}</p>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#999' }}>
        Използвай мобилното приложение за пълната функционалност
      </p>
    </div>
  );
}
