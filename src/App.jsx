import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import axios from 'axios';

function App() {
  const [categories, setCategories] = useState([]);
  const [cateNum, setCateNum] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 날짜를 문자열로 변환
  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const dateString = formatDate(selectedDate);

    axios.get(`http://localhost:8080/api/categories/${dateString}`)
      .then(response => {
        console.log("카테고리 조회 성공:", response.data);
        setCategories(response.data); // 서버에서 받은 카테고리 목록으로 상태 업데이트
      })
      .catch(error => {
        console.error('카테고리 조회 실패:', error);
      });
  }, [selectedDate]);

  const addCategory = () => {
    const newCategory = { date: formatDate(selectedDate), name: '', items: [] };
    setCateNum(cateNum + 1);

    axios.post('http://localhost:8080/api/categories', newCategory)
      .then(response => {
        console.log("추가 성공:", response.data);
        setCategories([...categories, response.data]); // 서버에서 생성된 카테고리 추가
      })
      .catch(error => {
        console.error('카테고리 추가 실패:', error);
      });
  };

  const deleteCategory = (cateId) => {
    axios.delete(`http://localhost:8080/api/categories/${cateId}`)
      .then(response => {
        console.log("삭제 성공:", response.data);
        // 상태 업데이트: 삭제된 카테고리를 목록에서 제거
        setCategories(categories.filter((cat) => cat._id !== cateId));
      })
      .catch(error => {
        console.error('카테고리 삭제 실패:', error);
      });
  };
  const addItem = (cateId) => {
    const newItem = { text: '', checked: false }; // 클라이언트에서 생성할 아이템
  
    axios.post('http://localhost:8080/api/categories/items', { categoryId: cateId, newItem })
      .then(response => {
        console.log("아이템 추가 성공:", response.data);
        // 상태 업데이트: 추가된 아이템을 서버에서 받아옴
        const updatedCategories = categories.map((cat) =>
          cat._id === cateId ? { ...cat, items: [...cat.items, response.data] } : cat
        );
        setCategories(updatedCategories);
      })
      .catch(error => {
        console.error('아이템 추가 실패:', error);
      });
  };
  

  const handleCategoryNameChange = (cateId, event) => {
    const newName = event.target.value;

    console.log('카테고리 ID:', cateId);
    console.log('변경된 이름:', newName);

    const updatedCategories = categories.map((cat) =>
      cat._id === cateId ? { ...cat, name: newName } : cat
    );
    setCategories(updatedCategories);

    axios.patch(`http://localhost:8080/api/categories/${cateId}`, { name: newName })
      .then(response => {
        console.log("카테고리 이름 업데이트 성공:", response.data);
      })
      .catch(error => {
        console.error('카테고리 이름 업데이트 실패:', error);
      });
  };

  const handleItemTextChange = (cateId, itemId, event) => {
    const newText = event.target.value;
  
    // 카테고리와 아이템을 찾아서 업데이트
    const updatedCategories = categories.map((cat) => {
      if (cat._id === cateId) {
        const updatedItems = cat.items.map((item) => {
          if (item._id === itemId) {
            return { ...item, text: newText };
          }
          return item;
        });
  
        // 업데이트된 아이템 목록을 포함한 카테고리 반환
        return { ...cat, items: updatedItems };
      }
      return cat;
    });
  
    setCategories(updatedCategories);
  
    // 서버에 업데이트된 아이템 텍스트를 전송
    const itemToUpdate = updatedCategories.find(cat => cat._id === cateId)?.items.find(item => item._id === itemId);
    if (itemToUpdate) {
      axios.patch(`http://localhost:8080/api/categories/items/${cateId}/${itemId}`, {
        text: newText,
        checked: itemToUpdate.checked // 현재 체크 상태를 함께 전송
      })
      .then(response => {
        console.log("아이템 업데이트 성공:", response.data);
      })
      .catch(error => {
        console.error('아이템 업데이트 실패:', error);
      });
    } else {
      console.error('아이템을 찾을 수 없습니다.');
    }
  };
  
  const handleItemChecked = (cateId, itemId) => {
    // 아이템의 현재 체크 상태를 찾음
    const itemToUpdate = categories.find(cat => cat._id === cateId)?.items.find(item => item._id === itemId);

    if (!itemToUpdate) {
      console.error('아이템을 찾을 수 없습니다.');
      return;
    }

    // 업데이트된 카테고리 상태를 클라이언트에서 변경
    const updatedCategories = categories.map((cat) =>
      cat._id === cateId ? {
        ...cat,
        items: cat.items.map((item) =>
          item._id === itemId ? { ...item, checked: !item.checked } : item
        )
      } : cat
    );
    setCategories(updatedCategories);

    // 서버에 업데이트된 아이템 체크 상태를 전송
    axios.patch(`http://localhost:8080/api/categories/items/${cateId}/${itemId}`, {
      text: itemToUpdate.text,
      checked: !itemToUpdate.checked
    })
    .then(response => {
      console.log("아이템 체크 상태 업데이트 성공:", response.data);
    })
    .catch(error => {
      console.error('아이템 체크 상태 업데이트 실패:', error);
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="App">
      <div id="title">
        <div id="titlebox">to - do</div>
      </div>
      <div id="main">
        <div id="calendar">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
          />
        </div>
        <div id="todo">
          <div id="add_categori">
            <button id="addcategori" onClick={addCategory}>+</button>
          </div>
          <div id="list">
            {categories.map((category) => (
              <div key={category._id} id={`categori${category._id}`} className='catebox'>
                <div className="categori">
                  <input
                    id='inputcategori'
                    type='text'
                    value={category.name}
                    onChange={(e) => handleCategoryNameChange(category._id, e)}
                    placeholder="카테고리 입력"
                  />
                  <button className="add_item" onClick={() => addItem(category._id)}>+</button>
                  <button className="delete_category" onClick={() => deleteCategory(category._id)}>삭제</button>
                </div>
                <ul id="itemlist">
                  {category.items.map((item) => (
                    <li key={item._id} id={`item-${item._id}`} className="item" style={{ backgroundColor: item.checked ? 'gray' : '#F7EBEB' }}>
                      <input
                        type="checkbox"
                        id={`checkbox-${item._id}`}
                        checked={item.checked}
                        onChange={() => handleItemChecked(category._id, item._id)}
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleItemTextChange(category._id, item._id, e)}
                        id={`itemtext-${item._id}`}
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
