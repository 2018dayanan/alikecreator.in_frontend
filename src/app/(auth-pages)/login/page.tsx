import MainLayout from "@/components/MainLayout";
import Login from "./_components/Login";

export const metadata = {
    title: "E-com: Shop & eCommerce NextJs Template | Eonpulsetech",
    description: "Elevate your online retail presence with E-com Shop & eCommerce React Template. Crafted with precision, this responsive and feature-rich template provides a seamless and visually stunning shopping experience. Explore a world of possibilities with modern design elements, intuitive navigation, and customizable features. Transform your website into a dynamic online storefront with E-com, where style meets functionality for a captivating and user-friendly eCommerce journey.",
};

const LoginPage = () => {
    return (
        <MainLayout>
            <Login />
        </MainLayout>
    )
}
export default LoginPage;