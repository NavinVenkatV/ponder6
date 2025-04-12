import React, { useEffect, useState } from 'react';

interface Item {
  id: number;
  name: string;
  // Add other properties as needed
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default App; 