import { Fragment } from "react"
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomSheet from "./MobileBottomSheet";

interface Props {
    children: React.ReactNode 
}

const MainLayout = ({children} : Props) =>{
    return(
        <Fragment>
            <div className="page-wraper">
                <Header design="style-1 header-transparent"/>
                    {children}
                <Footer />
                <MobileBottomSheet />
            </div>
        </Fragment>
    )
}
export default MainLayout;