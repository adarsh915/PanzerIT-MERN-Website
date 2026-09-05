'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function TestJodit() {
  const [val, setVal] = useState('');
  return (
    <div>
      <JoditEditor 
        value={val} 
        config={{
          readonly: false,
          uploader: { insertImageAsBase64URI: true }
        }} 
        onBlur={newContent => setVal(newContent)}
      />
      <pre style={{marginTop: '20px', border: '1px solid black', padding: '10px'}}>
        {val}
      </pre>
    </div>
  );
}
