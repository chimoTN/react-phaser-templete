import React from 'react';
import './Inventory'; 

export const Inventory = ({ items }) => {
    return (
        <div className="inventory">
            {items.map((item, index) => (
                <div key={index} className="item-slot">
                    <img src={item.image} alt={item.name} />
                    <span className="item-name">{item.name}</span>
                </div>
            ))}
        </div>
    );
};


