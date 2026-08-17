"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import SearchCategorySlider from "./SearchCategorySlider";
import Categorydropdown from "./CategoryDropdown";
import Image from "next/image";

export default function HeadSearchBar(){    
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${API_BASE_URL}/public/products?search=${searchTerm}&limit=5`);
                const json = await response.json();
                if (json.success) {
                    setResults(json.data);
                }
            } catch (error) {
                console.error("Search error", error);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchResults, 300); // debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return(
        <div className="container position-relative">
            <form className="header-item-search" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group search-input">               
                    <Categorydropdown />                  
                    <input 
                        type="search" 
                        className="form-control" 
                        placeholder="Search Product" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn" type="button">
                        {loading ? <span className="spinner-border spinner-border-sm"/> : <i className="iconly-Light-Search"/>}
                    </button>
                </div>
                
                {results.length > 0 && (
                    <div className="search-results mt-2 bg-white shadow rounded p-3" style={{position: 'absolute', width: 'calc(100% - 30px)', zIndex: 1000}}>
                        <ul className="list-unstyled mb-0">
                            {results.map((product) => (
                                <li key={product._id} className="mb-2 pb-2 border-bottom">
                                    <Link href={`/shop-list`} className="d-flex align-items-center text-dark">
                                        {product.image || (product.images && product.images[0]) ? (
                                            <Image src={product.image || product.images[0]} width={50} height={50} style={{objectFit: 'cover'}} alt={product.title} className="me-3" unoptimized />
                                        ) : (
                                            <div className="bg-light me-3" style={{width: 50, height: 50}}></div>
                                        )}
                                        <div>
                                            <h6 className="mb-0">{product.title}</h6>
                                            <span className="text-primary">₹{product.price}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ul className="recent-tag">
                    <li className="pe-0"><span>Quick Search :</span></li>
                    <li><Link href="/shop-list">Clothes</Link></li>
                    <li><Link href="/shop-list">UrbanSkirt</Link></li>
                    <li><Link href="/shop-list">VelvetGown</Link></li>
                    <li><Link href="/shop-list">LushShorts</Link></li>
                </ul>
            </form>
            <div className="row">
                <div className="col-xl-12">
                    <h5 className="mb-3">You May Also Like</h5>                    
                    <SearchCategorySlider />
                </div>
            </div>
        </div>
    )
}