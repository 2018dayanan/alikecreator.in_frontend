export const HeaderOne = `
<header className={\`site-header mo-left header \${design}\`}>		
    {/*  Main Header  */}
    <div className={\`sticky-header main-bar-wraper navbar-expand-lg \${headerFix ? 'is-fixed' : ''}\`}>
        <div className="main-bar clearfix">
            <div className="container-fluid clearfix d-lg-flex d-block">                            
                {design === "header-text-white header-transparent" ? 
                    ''
                    :
                    <div className="logo-header logo-dark me-md-5">
                        <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                    </div>
                }
                {design === "header-text-white header-transparent" ? 
                    <div className="logo-header me-md-5">
                        <Link to="/" className=" logo-light"><Image src={IMAGES.LogoWhite} alt="logo-white" /></Link>
                        <Link to="/" className="logo-dark"><Image src={IMAGES.logopng} alt="logo" /></Link>
                    </div>                      
                    :
                    ''
                }
                <button className={\`navbar-toggler collapsed navicon justify-content-end \${openSidebar ? "open" : ""}\`} 
                    onClick={()=>setOpenSidebar(!openSidebar)}
                >
                <span></span>
                <span></span>
                <span></span>
            </button>
                
            {/*  Main Nav  */}
            <div className={\`header-nav w3menu navbar-collapse collapse justify-content-start \${openSidebar ? "show" : ""}\`} 
                id="navbarNavDropdown"                            
            >
                <div className="logo-header logo-dark">
                    <Link to="index"><Image src={IMAGES.logo} alt="logo" /></Link>
                </div>
                {/* All menus item */}
                    <Menus />
                {/* All menus item end*/}
                <div className="dz-social-icon">
                    <ul>
                        <li><Link className="fab fa-facebook-f" target="_blank" to="https://www.facebook.com/alikecreator"></Link></li>
                        <li><Link className="fab fa-twitter" target="_blank" to="https://twitter.com/alikecreators"></Link></li>
                        <li><Link className="fab fa-linkedin-in" target="_blank" to="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                        <li><Link className="fab fa-instagram" target="_blank" to="https://www.instagram.com/alikecreator/"></Link></li>
                    </ul>
                </div>
            </div>
            {/* EXTRA NAV  */}
            <div className="extra-nav">
                <div className="extra-cell">						
                    <ul className="header-right">
                        <li className="nav-item login-link">
                            <Link className="nav-link"to="/login">
                                Login / Register
                            </Link>
                        </li>
                        <li className="nav-item search-link">
                            <Link className="nav-link" to="#" 
                                onClick={()=>setOpenSearchBar(true)}
                            >
                                <i className="iconly-Light-Search"/>
                            </Link>
                        </li>
                        <li className="nav-item wishlist-link">
                            <Link className="nav-link" to="#" 
                                onClick={()=>setHeadShoppingSidebar(true)}
                            >
                                <i className="iconly-Light-Heart2"/>
                            </Link>
                        </li>
                        <li className="nav-item cart-link">
                            <Link to="#" className="nav-link cart-btn"  onClick={()=>setBasketShoppingCard(true)}>
                                <i className="iconly-Broken-Buy"/>
                                <span className="badge badge-circle">5</span>
                            </Link>
                        </li>
                        <li className="nav-item filte-link">
                            <Link to="#" className="nav-link filte-btn"
                                onClick={() => setHeadSideBar(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                    <rect y="11" width="30" height="2" fill="black"/>
                                    <rect width="30" height="2" fill="black"/>
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
        </div>
    </div>
    {/*  Main Header End  */}
</header>   
{/*  SearchBar  */}
<Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
        show={openSearchBar} onHide={setOpenSearchBar}
        placement={'top'}
    >
    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
        onClick={()=>setOpenSearchBar(false)}
    >
        &times;
    </button>
    <HeadSearchBar />
</Offcanvas>
{/*  SearchBar  */}

 {/* - Sidebar finter */}
 <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={headSideBar} onHide={setHeadSideBar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadSideBar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <HeaderSidbar />
    </div>
</Offcanvas>  
{/*  Sidebar cart  */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={headShoppingSidebar} onHide={setHeadShoppingSidebar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadShoppingSidebar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="Wishlist" />
        </div>
    </div>
</Offcanvas>

 {/*  Shopping Sidebar Basket   */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={basketShoppingCard} onHide={setBasketShoppingCard}>
    <button type="button" className="btn-close" 
        onClick={()=>setBasketShoppingCard(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="ShoppingCart" />
        </div>
    </div>
</Offcanvas>`;


export const HeaderTwo = `
<header className="site-header mo-left header style-2">
    <div className="header-info-bar">
        <div className="container clearfix">
            <div className="logo-header logo-dark">
                <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
            </div>
            <div className="extra-nav d-md-flex d-none m-l15">
                <div className="extra-cell">
                    <ul className="navbar-nav header-right m-0">
                        <li className="nav-item info-box">
                            <div className="nav-link">
                                <div className="dz-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path style={{ fill: "#3cc" }} d="..." />
                                        <path d="..." />
                                        <path d="..." />
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <span>24/7 SUPPORT</span>
                                    <h6 className="title mb-0">+123 456 789</h6>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="header-search-nav">
                <form className="header-item-search">
                    <div className="input-group search-input">
                        <Categorydropdown />
                        <input type="text" className="form-control" aria-label="Text input with dropdown button" placeholder="Search for products" />
                        <button className="btn" type="button">
                            <i className="iconly-Light-Search text-secondary"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div className={\`sticky-header main-bar-wraper navbar-expand-lg \${headerFix ? 'is-fixed' : ''}\`}>
        <div className="main-bar clearfix">
            <div className="container clearfix d-lg-flex d-block">
                <div className="logo-header logo-dark">
                    <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                </div>
                <button className={\`navbar-toggler collapsed navicon justify-content-end \${openSidebar ? "open" : ""}\`}
                    onClick={() => setOpenSidebar(!openSidebar)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className={\`header-nav w3menu navbar-collapse collapse justify-content-start \${openSidebar ? "show" : ""}\`}>
                    <div className="logo-header">
                        <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                    </div>
                    <div className="browse-category-menu">
                        <Link to="#" className={\`category-btn \${categoryActive ? "active" : ""}\`} onClick={handleToggleClick}>
                            <div className="category-menu me-3">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span className="category-btn-title">Browse Categories</span>
                            <span className="toggle-arrow ms-auto">
                                <i className="icon feather icon-chevron-down"></i>
                            </span>
                        </Link>
                        <div className="category-menu-items" style={{
                            display: categoryActive ? "block" : "none",
                            transition: "all 0.5s ease",
                        }}>
                            <CategoryMenuItem />
                        </div>
                    </div>
                    <ul className="nav navbar-nav">
                        <Header2Menus />  
                    </ul>
                    <div className="dz-social-icon">
                        <ul>
                            <li><Link className="fab fa-facebook-f" target="_blank" to="https://www.facebook.com/alikecreator"></Link></li>
                            <li><Link className="fab fa-twitter" target="_blank" to="https://twitter.com/alikecreators"></Link></li>
                            <li><Link className="fab fa-linkedin-in" target="_blank" to="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                            <li><Link className="fab fa-instagram" target="_blank" to="https://www.instagram.com/alikecreator/"></Link></li>
                        </ul>
                    </div>
                </div>
                <div className="extra-nav">
                    <div className="extra-cell">
                        <ul className="header-right">
                            <li className="nav-item login-link">
                                <Link className="nav-link" to="/login">Login / Register</Link>
                            </li>
                            <li className="nav-item search-link">
                                <Link to="#" className="nav-link" onClick={() => setOpenSearchBar(true)}>
                                    <i className="iconly-Light-Search"></i>
                                </Link>
                            </li>
                            <li className="nav-item wishlist-link">
                                <Link className="nav-link" to="#" onClick={() => setHeadShoppingSidebar(true)}>
                                    <i className="iconly-Light-Heart2"></i>
                                </Link>
                            </li>
                            <li className="nav-item cart-link">
                                <Link to="#" className="nav-link cart-btn" onClick={() => setBasketShoppingCard(true)}>
                                    <i className="iconly-Broken-Buy"></i>
                                    <span className="badge badge-circle">5</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
<Offcanvas className="dz-search-area dz-offcanvas offcanvas-top" show={openSearchBar} onHide={setOpenSearchBar} placement={'top'}>
    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => setOpenSearchBar(false)}>
        &times;
    </button>
    <HeadSearchBar />
</Offcanvas>
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={headShoppingSidebar} onHide={setHeadShoppingSidebar}>
    <button type="button" className="btn-close" onClick={() => setHeadShoppingSidebar(false)}>
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="Wishlist" />
        </div>
    </div>
</Offcanvas>
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={basketShoppingCard} onHide={setBasketShoppingCard}>
    <button type="button" className="btn-close" onClick={() => setBasketShoppingCard(false)}>
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="ShoppingCart" />
        </div>
    </div>
</Offcanvas>
`;
export const HeaderThree = `
<header className="site-header mo-left header style-3">                            
    <div className={\`sticky-header main-bar-wraper \${headerFix ? 'is-fixed' : ''}\`}>
        <div className="main-bar clearfix">
            <div className="container-fluid clearfix">                 
                <button className={\`menu-nav-btn \${openSidebar ? "" : "collapsed"}\`}                                 
                    onClick={()=>setOpenSidebar(!openSidebar)}
                >
                    <span className="for-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <span className="dots-close">
                        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="20" height="2.10526" transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 22.0635 20.561)" fill="white"/>
                            <rect x="6.43262" y="20.5611" width="20" height="2.10526" transform="rotate(-45 6.43262 20.5611)" fill="white"/>
                        </svg>
                    </span>
                </button>                            
                <div className="logo-header me-5">
                    <Link to={"/"} >
                        <Image src={IMAGES.logo} className="logo-dark" alt="logo" />
                        <Image src={IMAGES.LogoWhiteSvg} className="logo-light" alt="logo" />
                    </Link>
                </div>
                
                <div className="extra-nav">
                    <div className="extra-cell">						
                        <ul className="header-right">
                            <li className="nav-item login-link">
                                <Link className="nav-link" to="/login">
                                    Login / Register
                                </Link>
                            </li>
                            <li className="nav-item search-link">
                                <Link to={"#"} className="nav-link" 
                                    onClick={()=>setOpenSearchBar(true)}
                                >
                                    <i className="iconly-Light-Search"/>
                                </Link>
                            </li>
                            <li className="nav-item wishlist-link">
                                <Link to={"#"} className="nav-link"  
                                    onClick={()=>setHeadShoppingSidebar(true)}
                                >
                                    <i className="iconly-Light-Heart2"/>
                                </Link>
                            </li>
                            <li className="nav-item cart-link">
                                <Link to={"#"}  className="nav-link cart-btn" 
                                    onClick={()=>setBasketShoppingCard(true)}
                                >
                                    <i className="iconly-Broken-Buy"/>
                                    <span className="badge badge-circle">5</span>
                                </Link>
                            </li>
                            <li className="nav-item filte-link">
                                <Link to={"#"}  className="nav-link filte-btn"  
                                    onClick={() => setHeadSideBar(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                        <rect y="11" width="30" height="2" fill="black"/>
                                        <rect width="30" height="2" fill="black"/>
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    </div>                                            
</header>
<div className={\`header-menu navbar-collapse collapse \${openSidebar ? "show" : ""}\`} >
    <div className="row h-100">
        <div className="col-lg-3">
            <div className="header-nav h-100 nav-dark">
            <ul className="nav navbar-nav">
                <li>
                    <Link to="/"><span>Home</span></Link>
                </li>

                <li><Link to="/blog"><span>Blog</span></Link></li>
                <li><Link to="/about-us"><span>About Us</span></Link></li>
                <li><Link to="/contact-us"><span>Contact Us</span></Link></li>
                <li className={\`sub-menu-down \${state.openMenu === 6 ? "open active" : ""}\`}
                    onClick={() => dispatch({ type: 'toggleMenu', index: 6 })}
                    onMouseEnter={() => dispatch({ type: 'toggleMenu', index: 6 })}
                >
                    <Link to="#"><span>My Account</span> <i className="fas fa-chevron-down tabindex"/></Link>
                    <ul className="sub-menu">						
                        {accountMenuItem.map((data,index)=>(
                            <li key={index}><Link to={data.url}>{data.name}</Link></li>
                        ))}                    
                    </ul>
                </li>
            </ul>
            </div>
        </div>
    </div>
    <div className="right-social-menu">
        <ul>
            <li>
                <Link to={"#"}>info@alikecreator.com</Link>
            </li>
            <li>
                <Link to={"#"}>+91 123 456 7890</Link>
            </li>
        </ul>	
        <ul>
            <li>
                <Link to={"#"}>Instagram</Link>
            </li>
            <li>
                <Link to={"#"}>Facebook</Link>
            </li>
            <li>
                <Link to={"#"}>twitter</Link>
            </li>
        </ul>
    </div>
    <div className="footer-menu">
        <p className="mb-0">© <span className="current-year">{year}</span> Alikecreator Theme. All Rights Reserved.</p>
    </div>	
</div>
<Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
    show={openSearchBar} onHide={setOpenSearchBar}
    placement={'top'}
>
    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
        onClick={()=>setOpenSearchBar(false)}
    >
        &times;
    </button>
 <HeadSearchBar />
</Offcanvas>

{/*  Sidebar finter */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={headSideBar} onHide={setHeadSideBar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadSideBar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <HeaderSidbar />
    </div>
</Offcanvas>  

{/*  Sidebar cart  */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={headShoppingSidebar} onHide={setHeadShoppingSidebar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadShoppingSidebar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="Wishlist" />
        </div>
    </div>
</Offcanvas>

{/*  Shopping Sidebar Basket   */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={basketShoppingCard} onHide={setBasketShoppingCard}>
    <button type="button" className="btn-close" 
        onClick={()=>setBasketShoppingCard(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="ShoppingCart" />
        </div>
    </div>
</Offcanvas>
`;
export const HeaderSix = `
    <header className={\`site-header mo-left header\`}>		
        <div className="top-bar">
            <div className="container-fluid">
                <div className="dz-topbar-inner d-flex justify-content-between align-items-center">
                    <div className="dz-topbar-left">
                        <ul>
                            <li><Link to="/about-us">About Us</Link></li>
                            <li><Link to="/contact-us-1">Contact Us</Link></li>
                            <li><Link to="/faqs-2">Help Desk</Link></li>
                        </ul>
                    </div>
                    <div className="dz-topbar-right">
                        <ul>
                            <li><span>Share:</span></li>
                            <li><Link to="https://www.facebook.com/alikecreator" target="_blank"><i className="fa-brands fa-facebook-f"/></Link></li>
                            <li><Link to="https://www.linkedin.com/showcase/3686700/admin/" target="_blank"><i className="fa-brands fa-linkedin-in"/></Link></li>
                            <li><Link to="https://www.instagram.com/alikecreator/" target="_blank"><i className="fa-brands fa-instagram"/></Link></li>
                            <li><Link to="https://twitter.com/alikecreators" target="_blank"><i className="fa-brands fa-twitter"/></Link></li>
                        </ul>					
                    </div>
                </div>
            </div>
        </div>        
        <div className={\`sticky-header main-bar-wraper navbar-expand-lg \${headerFix ? 'is-fixed' : ''}\`}>
            <div className="main-bar clearfix">
                <div className="container-fluid clearfix d-lg-flex d-block">                            
                     <div className="logo-header logo-dark me-md-5">
                        <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                    </div>
                    <button className={\`navbar-toggler collapsed navicon justify-content-end \${openSidebar ? "open" : ""}\`} 
                        onClick={()=>setOpenSidebar(!openSidebar)}
                    >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>                    
              
                <div className={\`header-nav w3menu navbar-collapse collapse justify-content-start \${openSidebar ? "show" : ""}\`} 
                    id="navbarNavDropdown"                            
                >
                    <div className="logo-header logo-dark">
                        <Link to="index"><Image src={IMAGES.logo} alt="logo" /></Link>
                    </div>
                    
                    <Menus />
                    
                    <div className="dz-social-icon">
                        <ul>
                            <li><Link className="fab fa-facebook-f" target="_blank" to="https://www.facebook.com/alikecreator"></Link></li>
                            <li><Link className="fab fa-twitter" target="_blank" to="https://twitter.com/alikecreators"></Link></li>
                            <li><Link className="fab fa-linkedin-in" target="_blank" to="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                            <li><Link className="fab fa-instagram" target="_blank" to="https://www.instagram.com/alikecreator/"></Link></li>
                        </ul>
                    </div>
                </div>
               
                <div className="extra-nav">
                    <div className="extra-cell">						
                        <ul className="header-right">
                            <li className="nav-item login-link">
                                <Link className="nav-link"to="/login">
                                    Login / Register
                                </Link>
                            </li>
                            <li className="nav-item search-link">
                                <Link className="nav-link" to="#" 
                                    onClick={()=>setOpenSearchBar(true)}
                                >
                                    <i className="iconly-Light-Search"/>
                                </Link>
                            </li>
                            <li className="nav-item wishlist-link">
                                <Link className="nav-link" to="#" 
                                    onClick={()=>setHeadShoppingSidebar(true)}
                                >
                                    <i className="iconly-Light-Heart2"/>
                                </Link>
                            </li>
                            <li className="nav-item cart-link">
                                <Link to="#" className="nav-link cart-btn"  onClick={()=>setBasketShoppingCard(true)}>
                                    <i className="iconly-Broken-Buy"/>
                                    <span className="badge badge-circle">5</span>
                                </Link>
                            </li>
                            <li className="nav-item filte-link">
                                <Link to="#" className="nav-link filte-btn"
                                    onClick={() => setHeadSideBar(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                        <rect y="11" width="30" height="2" fill="black"/>
                                        <rect width="30" height="2" fill="black"/>
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                </div>
            </div>
        </div>        
    </header>   
    {/*  SearchBar  */}
    <Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
            show={openSearchBar} onHide={setOpenSearchBar}
            placement={'top'}
        >
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
            onClick={()=>setOpenSearchBar(false)}
        >
            &times;
        </button>
        <HeadSearchBar />
    </Offcanvas>
    {/*  SearchBar  */}

    {/* - Sidebar finter */}
    <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={headSideBar} onHide={setHeadSideBar}>
        <button type="button" className="btn-close" 
            onClick={()=>setHeadSideBar(false)}
        >
            &times;
        </button>
        <div className="offcanvas-body">
            <HeaderSidbar />
        </div>
    </Offcanvas>  
    {/*  Sidebar cart  */}
    <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={headShoppingSidebar} onHide={setHeadShoppingSidebar}>
        <button type="button" className="btn-close" 
            onClick={()=>setHeadShoppingSidebar(false)}
        >
            &times;
        </button>
        <div className="offcanvas-body">
            <div className="product-description">
                <HeaderSideShoppingCard tabactive="Wishlist" />
            </div>
        </div>
    </Offcanvas>

    {/*  Shopping Sidebar Basket   */}
    <Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={basketShoppingCard} onHide={setBasketShoppingCard}>
        <button type="button" className="btn-close" 
            onClick={()=>setBasketShoppingCard(false)}
        >
            &times;
        </button>
        <div className="offcanvas-body">
            <div className="product-description">
                <HeaderSideShoppingCard tabactive="ShoppingCart" />
            </div>
        </div>
</Offcanvas>`;

export const HeaderSeven = `
<header className={\`site-header mo-left header\`}>		
    <div className="top-bar bg-primary text-white">
        <div className="container-fluid">
            <div className="dz-topbar-inner d-flex justify-content-between align-items-center">
                <div className="dz-topbar-left">
                    <ul>
                        <li><Link to="/about-us">About Us</Link></li>
                        <li><Link to="/contact-us-1">Contact Us</Link></li>
                        <li><Link to="/faqs-2">Help Desk</Link></li>
                    </ul>
                </div>
                <div className="dz-topbar-right">
                    <ul>
                        <li><span>Share:</span></li>
                        <li><Link to="https://www.facebook.com/alikecreator" target="_blank"><i className="fa-brands fa-facebook-f"/></Link></li>
                        <li><Link to="https://www.linkedin.com/showcase/3686700/admin/" target="_blank"><i className="fa-brands fa-linkedin-in"/></Link></li>
                        <li><Link to="https://www.instagram.com/alikecreator/" target="_blank"><i className="fa-brands fa-instagram"/></Link></li>
                        <li><Link to="https://twitter.com/alikecreators" target="_blank"><i className="fa-brands fa-twitter"/></Link></li>
                    </ul>					
                </div>
            </div>
        </div>
    </div>
    {/*  Main Header  */}
    <div className={\`sticky-header main-bar-wraper navbar-expand-lg \${headerFix ? 'is-fixed' : ''}\`}>
        <div className="main-bar clearfix">
            <div className="container-fluid clearfix d-lg-flex d-block">                            
                    <div className="logo-header logo-dark me-md-5">
                    <Link to="/"><Image src={IMAGES.logo} alt="logo" /></Link>
                </div>
                <button className={\`navbar-toggler collapsed navicon justify-content-end \${openSidebar ? "open" : ""}\`} 
                    onClick={()=>setOpenSidebar(!openSidebar)}
                >
                <span></span>
                <span></span>
                <span></span>
            </button>
                
            {/*  Main Nav  */}
            <div className={\`header-nav w3menu navbar-collapse collapse justify-content-start \${openSidebar ? "show" : ""}\`} 
                id="navbarNavDropdown"                            
            >
                <div className="logo-header logo-dark">
                    <Link to="index"><Image src={IMAGES.logo} alt="logo" /></Link>
                </div>
                {/* All menus item */}
                    <Menus />
                {/* All menus item end*/}
                <div className="dz-social-icon">
                    <ul>
                        <li><Link className="fab fa-facebook-f" target="_blank" to="https://www.facebook.com/alikecreator"></Link></li>
                        <li><Link className="fab fa-twitter" target="_blank" to="https://twitter.com/alikecreators"></Link></li>
                        <li><Link className="fab fa-linkedin-in" target="_blank" to="https://www.linkedin.com/showcase/3686700/admin/"></Link></li>
                        <li><Link className="fab fa-instagram" target="_blank" to="https://www.instagram.com/alikecreator/"></Link></li>
                    </ul>
                </div>
            </div>
            {/* EXTRA NAV  */}
            <div className="extra-nav">
                <div className="extra-cell">						
                    <ul className="header-right">
                        <li className="nav-item login-link">
                            <Link className="nav-link"to="/login">
                                Login / Register
                            </Link>
                        </li>
                        <li className="nav-item search-link">
                            <Link className="nav-link" to="#" 
                                onClick={()=>setOpenSearchBar(true)}
                            >
                                <i className="iconly-Light-Search"/>
                            </Link>
                        </li>
                        <li className="nav-item wishlist-link">
                            <Link className="nav-link" to="#" 
                                onClick={()=>setHeadShoppingSidebar(true)}
                            >
                                <i className="iconly-Light-Heart2"/>
                            </Link>
                        </li>
                        <li className="nav-item cart-link">
                            <Link to="#" className="nav-link cart-btn"  onClick={()=>setBasketShoppingCard(true)}>
                                <i className="iconly-Broken-Buy"/>
                                <span className="badge badge-circle">5</span>
                            </Link>
                        </li>
                        <li className="nav-item filte-link">
                            <Link to="#" className="nav-link filte-btn"
                                onClick={() => setHeadSideBar(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 13" fill="none">
                                    <rect y="11" width="30" height="2" fill="black"/>
                                    <rect width="30" height="2" fill="black"/>
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
        </div>
    </div>
    {/*  Main Header End  */}
</header>   
{/*  SearchBar  */}
<Offcanvas className="dz-search-area dz-offcanvas offcanvas-top"
        show={openSearchBar} onHide={setOpenSearchBar}
        placement={'top'}
    >
    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
        onClick={()=>setOpenSearchBar(false)}
    >
        &times;
    </button>
    <HeadSearchBar />
</Offcanvas>
{/*  SearchBar  */}

{/* - Sidebar finter */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" show={headSideBar} onHide={setHeadSideBar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadSideBar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <HeaderSidbar />
    </div>
</Offcanvas>  
{/*  Sidebar cart  */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={headShoppingSidebar} onHide={setHeadShoppingSidebar}>
    <button type="button" className="btn-close" 
        onClick={()=>setHeadShoppingSidebar(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="Wishlist" />
        </div>
    </div>
</Offcanvas>

{/*  Shopping Sidebar Basket   */}
<Offcanvas className="dz-offcanvas offcanvas-end" placement="end" tabIndex={-1} show={basketShoppingCard} onHide={setBasketShoppingCard}>
    <button type="button" className="btn-close" 
        onClick={()=>setBasketShoppingCard(false)}
    >
        &times;
    </button>
    <div className="offcanvas-body">
        <div className="product-description">
            <HeaderSideShoppingCard tabactive="ShoppingCart" />
        </div>
    </div>
</Offcanvas>
`;