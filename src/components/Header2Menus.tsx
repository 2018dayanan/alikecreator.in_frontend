"use client"

import Link from "next/link";
import IMAGES from "../constant/theme";
import CountdownBlog from "./CountdownBlog";
import { Fragment, useReducer } from "react";
import { menuData2, menuData3, menuData4, menuDataOne, portfolioMenu } from "../constant/Alldata";
import Image from "next/image";


interface reduType {
    type: string;
    index: number;
}

interface stateType {
    home: boolean;
    openMenu: number | null;
}

const initialState = {
    home: false,
    openMenu: null,
};

const reducer = (state: stateType, action: reduType) => {
    switch (action.type) {
        case 'home':
            return { ...state, home: !state.home };
        case 'toggleMenu':
            return {
                ...state,
                openMenu: state.openMenu === action.index ? null : action.index,
            };
        default:
            return state;
    }
};
export default function Header2Menus() {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <ul className="nav navbar-nav">
            <li>
                <Link href="/"><span>Home</span></Link>
            </li>

            <li><Link href="/photos"><span>Photos</span></Link></li>


            <li><Link href="/about-us"><span>About Us</span></Link></li>
            <li><Link href="/contact-us-2"><span>Contact Us</span></Link></li>
        </ul>
    )
}