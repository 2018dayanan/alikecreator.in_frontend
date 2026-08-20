import Link from "next/link";
import IMAGES from "../constant/theme";
import CountdownBlog from "./CountdownBlog";
import { Fragment, useReducer } from "react";
import { accountMenuItem, menuData2, menuData3, menuData4, menuDataOne, portfolioMenu } from "../constant/Alldata";
import Image from "next/image";

// Pages Menu Items
// interface MenuItem4 {
//     title: string;
//     links: { name: string; path: string }[];
//     subMenu?: MenuItem4[]; 
// }


// interface stateType{
//     home : boolean; 
//     collpase0 : boolean; 

// }

// const initialState = {
//     home : false,
//     collpase0 : false,

// };
// const reducer = (state : stateType, action : reduType) =>{
//     switch (action.type){
//         case 'home':
//             return { ...state, home: !state.home }

//         default:
//             return state	
//     }	
// }

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
export default function Menus() {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <ul className="nav navbar-nav">
            <li>
                <Link href="/"><span>Home</span></Link>
            </li>

            <li><Link href="/photos"><span>Photos</span></Link></li>


            <li><Link href="/about-us"><span>About Us</span></Link></li>
            <li><Link href="/contact-us-2"><span>Contact Us</span></Link></li>
            <li className={`sub-menu-down ${state.openMenu === 6 ? "open" : ""}`}
                onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
            >
                <Link href="#"><span>My Account</span> <i className="fas fa-chevron-down tabindex" /></Link>
                <ul className="sub-menu">
                    {accountMenuItem.map((data, index) => (
                        <li key={index}><Link href={data.url}>{data.name}</Link></li>
                    ))}
                </ul>
            </li>
        </ul>
    )
}