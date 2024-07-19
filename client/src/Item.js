import React, { useState } from 'react';
function Item() {
    return(
    <div id="item">
        <li>
            <input
                type="checkbox"
                className="checkbox"/>
                <input
                    type='text'
                    id='itemtext'
                    />
                <img
                    src=''
                    alt="trash"/>
        </li>
    </div>
    );
}

export default Item;