"use client"
import { useEffect, useState } from "react";
import { Tab, Nav } from "react-bootstrap";
import Link from "next/link";
import { ShopProductItem, ShopProductItemtype } from "../constant/Alldata"; 
import Image from "next/image";

interface propType{
    tabactive : string;
}

export default function HeaderSideShoppingCard(props : propType){
    const [arayitem, setArrayitem]  = useState<any[]>([]);
    const [shoppingItem, setShoppingItem]  = useState<ShopProductItemtype[]>(ShopProductItem);
    const [isClient, setIsClient] = useState(false);

    const loadCart = () => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setArrayitem(storedCart);
    };

    useEffect(() => {
        setIsClient(true);
        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const saveCart = (items: any[]) => {
        setArrayitem(items);
        localStorage.setItem('cart', JSON.stringify(items));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleRemove = (index: number) => {
        const newItems = arayitem.filter((_, i) => i !== index);
        saveCart(newItems);
    };

    const handlePrice = (index: number) => {
        setShoppingItem((prevItems) => prevItems.filter((_, i) => i !== index));
    }

    function handleIncrease(ind : number){
        const updateData = [...arayitem];            
        updateData[ind] = {
            ...updateData[ind],
            quantity: (updateData[ind].quantity || 1) + 1,
        };
        saveCart(updateData);                         
    }
    
    function handledDecrease(ind : number){
        const updateData = [...arayitem];
        const newQty = (updateData[ind].quantity || 1) - 1;
        updateData[ind] = {
            ...updateData[ind],
            quantity: newQty > 0 ? newQty : 1,
        };
        saveCart(updateData);  
    }

    const totalPrice = arayitem.reduce((acc : number, item) => acc + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);

    if (!isClient) return null;
    
    return(
        <div className="dz-tabs">
            <Tab.Container defaultActiveKey={props.tabactive}>
                <Nav as="ul" className="nav nav-tabs center">
                    <Nav.Item as="li">
                        <Nav.Link as="button" className="nav-link" eventKey="ShoppingCart">Shopping Cart
                            <span className="badge badge-light">{arayitem.length}</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item as="li">
                        <Nav.Link as="button" eventKey="Wishlist">Wishlist
                            <span className="badge badge-light">2</span>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className="pt-4" id="dz-shopcart-sidebar">
                    <Tab.Pane eventKey="ShoppingCart">
                        <div className="shop-sidebar-cart">
                            <ul className="sidebar-cart-list">
                                {arayitem.map((elem, index)=>(
                                    <li key={index}>
                                        <div className="cart-widget">
                                            <div className="dz-media me-3">
                                                {elem.image ? <Image src={elem.image} alt="card" width={100} height={100} style={{objectFit:'cover'}} unoptimized /> : null}
                                            </div>
                                            <div className="cart-content">
                                                <h6 className="title"><Link href="/product-thumbnail">{elem.name}</Link></h6>
                                                <div className="d-flex align-items-center">
                                                    <div className="btn-quantity light quantity-sm me-3">
                                                        <div className="input-group bootstrap-touchspin">
                                                            <span className="input-group-addon bootstrap-touchspin-prefix" style={{display: "none"}}></span>
                                                            <input type="text" value={elem.quantity || 1} name="demo_vertical2" className="form-control" 
                                                                style={{display: "block"}} readOnly
                                                            />
                                                            <span className="input-group-addon bootstrap-touchspin-postfix" style={{display: "none"}}></span>
                                                            <span className="input-group-btn-vertical">
                                                                <button className="btn btn-default bootstrap-touchspin-up" type="button"
                                                                    onClick={()=>handleIncrease(index)}
                                                                >
                                                                    <i className="fa-solid fa-plus"/>
                                                                </button>
                                                                <button className="btn btn-default bootstrap-touchspin-down" type="button"
                                                                    onClick={()=>handledDecrease(index)}
                                                                >
                                                                    <i className="fa-solid fa-minus"/>
                                                                </button>
                                                            </span>
                                                        </div>                                                    
                                                    </div>
                                                    <h6 className="dz-price mb-0">₹{(parseFloat(elem.price || 0) * (elem.quantity || 1)).toFixed(2)}</h6>
                                                </div>
                                            </div>
                                            <Link href="#" className="dz-close" onClick={()=>handleRemove(index)}>
                                                <i className="ti-close"/>
                                            </Link>
                                        </div>
                                    </li>
                                ))}                            
                            </ul>
                            <div className="cart-total">
                                <h5 className="mb-0">Subtotal:</h5>                                
                                <h5 className="mb-0">₹{totalPrice.toFixed(2)}</h5>
                            </div>
                            <div className="mt-auto">
                                <div className="shipping-time">													
                                    <div className="dz-icon">
                                        <i className="flaticon flaticon-ship"/>
                                    </div>
                                    <div className="shipping-content">
                                        <h6 className="title pe-4">Congratulations , you've got free shipping!</h6>
                                        <div className="progress">
                                            <div className="progress-bar progress-animated border-0" style={{width: "75%"}}>
                                                <span className="sr-only">75% Complete</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/shop-checkout" className="btn btn-outline-secondary btn-block m-b20">Checkout</Link>	
                                <Link href="/shop-cart" className="btn btn-secondary btn-block">View Cart</Link>	
                            </div>	
                        </div>	
                    </Tab.Pane>
                    <Tab.Pane eventKey="Wishlist">
                        <div className="shop-sidebar-cart">
                            <ul className="sidebar-cart-list">
                                {shoppingItem.map((elem, index)=>(
                                    <li key={index}>
                                        <div className="cart-widget">
                                            <div className="dz-media me-3">
                                                <Image src={elem.image} alt="media" />
                                            </div>
                                            <div className="cart-content">
                                                <h6 className="title"><Link href="/product-thumbnail">{elem.title}</Link></h6>
                                                <div className="d-flex align-items-center">
                                                    <h6 className="dz-price  mb-0">₹{elem.price}.00</h6>
                                                </div>
                                            </div>
                                            <Link href="#" className="dz-close"
                                                onClick={()=>handlePrice(index)}
                                            >
                                                <i className="ti-close"/>
                                            </Link>
                                        </div>
                                    </li>
                                ))}                               
                            </ul>
                            <div className="mt-auto">
                                <Link href="/shop-wishlist" className="btn btn-secondary btn-block">Check Your Favourite</Link>
                            </div>	
                        </div>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    )
}