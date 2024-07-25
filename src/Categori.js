import React, { useState } from 'react';

function Categori() {
    return(
      
        <li className='categori'>
          <form
            <input type='text'
                   id='inputcategori'
                   placeholder='카테고리 입력'
                   formMethod='post'
                   ></input>
        <button id= "add_item" onClick={addItem}>
          +
        </button>
        </li>
  
    )
}