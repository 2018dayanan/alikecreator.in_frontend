import React from 'react';

const ProductShimmer = ({ count = 8 }) => {
    const shimmerArray = new Array(count).fill(null);

    return (
        <div className="clearfix">
            <ul className="row g-xl-4 g-3 mb-0 list-unstyled">
                {shimmerArray.map((_, ind) => (
                    <div className="card-container col-6 col-xl-3 col-lg-3 col-md-4 col-sm-6" key={ind}>
                        <div className="shop-card" aria-hidden="true">
                            <div className="dz-media placeholder-glow" style={{ position: "relative", aspectRatio: "3 / 4", backgroundColor: "#f8f9fa", borderRadius: "10px", overflow: "hidden" }}>
                                <span className="placeholder w-100 h-100 d-block" style={{ backgroundColor: "#e9ecef" }}></span>
                            </div>
                            <div className="dz-content placeholder-glow mt-3">
                                <h5 className="title mb-2">
                                    <span className="placeholder col-8" style={{ borderRadius: "4px" }}></span>
                                </h5>
                                <h5 className="price">
                                    <span className="placeholder col-4" style={{ borderRadius: "4px" }}></span>
                                </h5>
                            </div>
                        </div>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default ProductShimmer;
