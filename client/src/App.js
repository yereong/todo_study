import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function App() { 
  const [categories, setCategories] = useState([{ id: 0, name: '공부', items: [] }]);
  const [cateNum, setCateNum] = useState(1);

  const addCategory = () => {
    setCategories([...categories, { id: cateNum, name: '', items: [] }]);
    setCateNum(cateNum + 1);
  };

  const addItem = (cateId) => {
    setCategories(categories.map(cat => 
      cat.id === cateId ? { ...cat, items: [...cat.items, { id: Date.now(), text: '', checked: false }] } : cat
    ));
  };

  const handleCategoryNameChange = (cateId, event) => {
    setCategories(categories.map(cat => 
      cat.id === cateId ? { ...cat, name: event.target.value } : cat
    ));
  };

  const handleItemTextChange = (cateId, itemId, event) => {
    setCategories(categories.map(cat => 
      cat.id === cateId ? { 
        ...cat, 
        items: cat.items.map(item => 
          item.id === itemId ? { ...item, text: event.target.value } : item
        ) 
      } : cat
    ));
  };

  const handleItemChecked = (cateId, itemId) => {
    setCategories(categories.map(cat => 
      cat.id === cateId ? { 
        ...cat, 
        items: cat.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ) 
      } : cat
    ));
  };



  return (
    <div className="App">
      <div id="title">
        <div id="titlebox">to - do</div>
      </div>
      <div id="main">
        <div id="calendar">
          <Calendar/>
        </div>
        <div id="todo">
          <div id="add_categori">
            <button id="addcategori" onClick={addCategory}>+</button>
          </div>
          <div id="list">
            {categories.map((category) => (
              <div key={category.id} id={`categori${category.id}`} className='catebox' >
                <div className="categori">
                  <input 
                    id='inputcategori'
                    type="text" 
                    value={category.name} 
                    onChange={(e) => handleCategoryNameChange(category.id, e)} 
                    placeholder="카테고리 입력"
                  />
                  <button className="add_item" onClick={() => addItem(category.id)}>+</button>
                </div>
                <ul id="itemlist">
                  {category.items.map((item) => (
                    <li key={item.id} id={`item-${item.id}`} className="item" style={{ backgroundColor: item.checked ? 'gray' : '#F7EBEB' }}>
                      <input 
                        type="checkbox" 
                        id="checkbox"
                        checked={item.checked}
                        onChange={() => handleItemChecked(category.id, item.id)} 
                      />
                      <input 
                        type="text" 
                        value={item.text} 
                        onChange={(e) => handleItemTextChange(category.id, item.id, e)} 
                        id={`itemtext-${item.id}`} 
                        className='itemtext'
                        style={{ backgroundColor: item.checked ? 'gray' : '#F7EBEB' }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
