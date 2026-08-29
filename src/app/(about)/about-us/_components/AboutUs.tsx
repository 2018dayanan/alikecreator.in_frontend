import Link from "next/link";

const AboutUs = () => {
    return (
        <div className="page-content bg-light">
            <section className="dz-bnr-inr dz-bnr-inr-sm bg-light">
                <div className="container">
                    <div className="dz-bnr-inr-entry">
                        <div className="row align-items-center">
                            <div className="col-12">
                                <div className="text-center mb-xl-0 mb-4">
                                    <h1>About Us</h1>
                                    <nav aria-label="breadcrumb" className="breadcrumb-row">
                                        <ul className="breadcrumb justify-content-center">
                                            <li className="breadcrumb-item"><Link href={"/"}>Home</Link></li>
                                            <li className="breadcrumb-item">About Us</li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="content-inner">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-12">
                            <div className="about-content-wrapper p-4 p-md-5 bg-white rounded shadow-sm">
                                <h2 className="mb-4">Welcome to AlikeCreator</h2>
                                <h5 className="text-primary mb-4">Discover the style. Shop the look. Make it yours.</h5>
                                
                                <p className="mb-4">AlikeCreator is a creator-inspired shopping platform where <strong>fashion, lifestyle and creativity come together.</strong></p>
                                <p className="mb-4">We make it easier for you to discover products inspired by the creators you love—from <strong>stylish clothing and accessories to beauty essentials, home décor, lifestyle products and more.</strong></p>
                                <p className="mb-5">Instead of simply watching creators showcase their style, <strong>AlikeCreator lets you shop it.</strong></p>

                                <h3 className="mb-4">What is AlikeCreator?</h3>
                                <p className="mb-3">Every day, creators influence what we wear, how we style ourselves, how we decorate our homes and the products we love.</p>
                                <p className="mb-3">AlikeCreator brings that inspiration directly to shopping.</p>
                                <p className="mb-4">Creators can showcase their favourite products, styling ideas and recommendations, while users can discover those products and purchase them through one convenient platform.</p>
                                
                                <div className="alert alert-primary mb-5" role="alert">
                                    <h5 className="alert-heading mb-2">From Inspiration to Your Cart</h5>
                                    <p className="mb-0"><strong>See it &rarr; Discover it &rarr; Shop it &rarr; Make it yours</strong></p>
                                </div>

                                <h3 className="mb-4">What Can You Shop?</h3>
                                <p className="mb-4">At AlikeCreator, you'll discover products across multiple categories:</p>
                                
                                <div className="row mb-5">
                                    <div className="col-md-6 mb-4">
                                        <div className="icon-bx-wraper style-1 p-4 border rounded h-100">
                                            <h4 className="title mb-2">👗 Fashion</h4>
                                            <p className="mb-0">Dresses, sarees, kurtis, western wear, ethnic wear, footwear and more.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="icon-bx-wraper style-1 p-4 border rounded h-100">
                                            <h4 className="title mb-2">👜 Accessories</h4>
                                            <p className="mb-0">Bags, jewellery, watches, sunglasses, fashion accessories and more.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="icon-bx-wraper style-1 p-4 border rounded h-100">
                                            <h4 className="title mb-2">💄 Beauty & Lifestyle</h4>
                                            <p className="mb-0">Beauty products, personal care, grooming essentials and lifestyle products.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <div className="icon-bx-wraper style-1 p-4 border rounded h-100">
                                            <h4 className="title mb-2">🏠 Home Décor</h4>
                                            <p className="mb-0">Wall décor, decorative items, lighting, furniture accessories and products to make your space beautiful.</p>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-4">
                                        <div className="icon-bx-wraper style-1 p-4 border rounded h-100 bg-light">
                                            <h4 className="title mb-2">✨ Trending & Creator Picks</h4>
                                            <p className="mb-0">Discover products that creators are styling, using, recommending and loving.</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="mb-5 text-muted fst-italic">And we're continuously expanding our categories.</p>

                                <h3 className="mb-4">Shop Your Favourite Creator's Style</h3>
                                <p className="mb-3">Ever seen a creator wearing something and thought:</p>
                                <blockquote className="blockquote border-start border-primary border-4 ps-4 mb-4">
                                    <p className="mb-0 fw-bold">“I want that too!”</p>
                                </blockquote>
                                <p className="mb-3">That's exactly where AlikeCreator comes in.</p>
                                <p className="mb-3">Discover the products behind the looks, explore creator recommendations and shop products that match your personal style.</p>
                                <p className="mb-5">From a complete outfit to a small accessory or a home décor idea, <strong>your next favourite product could be just one discovery away.</strong></p>

                                <div className="row mb-5">
                                    <div className="col-lg-6 mb-4 mb-lg-0">
                                        <div className="bg-light p-4 rounded h-100">
                                            <h3 className="mb-3">For Creators</h3>
                                            <p className="mb-3">AlikeCreator gives creators a new way to turn their <strong>style, creativity and influence into shopping experiences.</strong></p>
                                            <p className="mb-3">Creators can showcase products they genuinely love, create inspiring collections and help their audience discover products that fit their lifestyle.</p>
                                            <p className="mb-0">We believe creators should not only influence trends—they should be able to <strong>build shopping experiences around those trends.</strong></p>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="bg-light p-4 rounded h-100">
                                            <h3 className="mb-3">For Shoppers</h3>
                                            <p className="mb-3">Shopping on AlikeCreator is about more than finding a product.</p>
                                            <p className="mb-3">It's about discovering <strong>ideas, inspiration and styles that feel relevant to you.</strong></p>
                                            <p className="mb-0">Whether you're looking for your next outfit, a new accessory, something for your home or a trending lifestyle product, AlikeCreator helps you discover it through the people and content you already enjoy.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center p-4 p-md-5 bg-dark text-white rounded mb-5">
                                    <h3 className="text-white mb-4">Our Mission</h3>
                                    <p className="mb-4 text-white-50">Our mission is to connect <strong>Creators, Products and Shoppers</strong> in one simple ecosystem.</p>
                                    <p className="mb-4 text-white">We want to make online shopping more:</p>
                                    <h5 className="text-primary mb-0">Inspirational &bull; Discoverable &bull; Creator-driven &bull; Personal</h5>
                                </div>

                                <div className="text-center mb-5">
                                    <h3 className="mb-4">Our Vision</h3>
                                    <p className="mb-3">We envision AlikeCreator becoming a destination where people don't just come to shop—</p>
                                    <h4 className="mb-4 text-primary">they come to discover what to shop.</h4>
                                    <p className="mb-0">A place where creators inspire trends, brands showcase products and shoppers discover products they love.</p>
                                </div>
                                
                                <hr className="my-5" />

                                <div className="text-center">
                                    <h2 className="mb-3">AlikeCreator</h2>
                                    <h5 className="mb-3 text-muted">Your Creator. Your Style. Your Shopping.</h5>
                                    <h4 className="text-primary fw-bold">Discover &bull; Shop &bull; Inspire</h4>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="get-in-touch">
                <div className="m-r100 m-md-r0 m-sm-r0">
                    <h3 className="dz-title mb-lg-0 mb-3">Questions ?
                        <span>Our experts will help find the gear that's right for you</span>
                    </h3>
                </div>
                <Link href="/contact-us" className="btn btn-light">Get In Touch</Link>
            </section>
        </div>
    )
}

export default AboutUs;