"use client"
import { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";

export default function Categorydropdown(){
    const [selectCat, setSelectCat] = useState("All Categories");
    const [categories, setCategories] = useState<{name: string, _id: string}[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${API_BASE_URL}/public/categories`);
                const json = await response.json();
                if (json.success) {
                    setCategories(json.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    return(
        <Dropdown className="bootstrap-select default-select">
            <Dropdown.Toggle as="div" className="btn dropdown-toggle btn-light show">
                {selectCat}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={()=>setSelectCat("All Categories")}>All Categories</Dropdown.Item>
                {categories.map((cat, index) => (
                    <Dropdown.Item key={index} onClick={()=>setSelectCat(cat.name)}>{cat.name}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown> 
    )
}