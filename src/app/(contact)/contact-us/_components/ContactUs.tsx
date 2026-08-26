"use client"
import ContactFormBlog from "@/elements/ContactFormBlog";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ContactUs = () => {
	let path = usePathname();

	useEffect(() => {
		if (path === "/contact-us") {
			document.body.classList.add('bg-light');
		} else {
			document.body.classList.remove('bg-light');
		}
	}, [path])
	return (
		<div className="page-content">
			<section className="bg-light content-inner-1 m-t70 contact-us2 overflow-hidden">
				<div className="container">
					<div className="row">
						<div className="col-xl-6 col-md-6 mb-4">
							<div className="contact-info style-1 text-start text-white">
								<h2 className="title wow fadeInUp" data-wow-delay="0.1s">Contact Us</h2>
								<p className="text wow fadeInUp" data-wow-delay="0.2s"><span>Address:</span>75 C Park Street Kolkata 700016</p>
								<div className="contact-bottom wow fadeInUp justify-content-between" data-wow-delay="0.3s">
									<div className="contact-left">
										<h3>Call Us</h3>
										<ul>
											<li>+91-11-4215 3255</li>
										</ul>
									</div>
									<div className="contact-right">
										<h3>Email Us</h3>
										<ul>
											<li>info@alikecreator.com</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-6 col-md-6">
							<div className="contact-area1 wow fadeInUp" data-wow-delay="0.4s">
								<ContactFormBlog />
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ContactUs;